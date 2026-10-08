import type { Locale } from "@/lib/messages";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/token";

type ApiErrorBody = {
  code?: string;
  message?: string;
  details?: unknown;
  traceId?: string;
};

type ApiErrorResponse = {
  error?: ApiErrorBody;
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code?: string,
    readonly details?: unknown,
    readonly traceId?: string,
    message = `Request failed with status ${status}`,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  accessToken?: string;
  body?: unknown;
  headers?: HeadersInit;
  locale?: Locale;
  skipAuth?: boolean;
  _isRetry?: boolean;
};

// Shared promise lock to handle concurrent 401 refresh requests
let activeRefreshPromise: Promise<string> | null = null;

/**
 * Requests a new access token from the backend using the stored refresh token.
 */
async function requestNewAccessToken(baseUrl: string): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error("Session expired or refresh token revoked");
  }

  const payload = await response.json();
  const tokenPair = payload?.data ?? payload;

  if (!tokenPair?.access_token) {
    clearTokens();
    throw new Error("Malformed token response from server");
  }

  setTokens({
    accessToken: tokenPair.access_token,
    refreshToken: tokenPair.refresh_token,
  });

  return tokenPair.access_token;
}

/**
 * Central HTTP client for the Agribid Shudh frontend.
 */
export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const {
    accessToken,
    body,
    headers: initialHeaders,
    locale = "en",
    skipAuth = false,
    _isRetry = false,
    ...requestOptions
  } = options;

  const headers = new Headers(initialHeaders);

  headers.set("Accept", "application/json");
  headers.set("Accept-Language", locale);

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  // 1. Automatically attach Bearer token if available and not skipped
  const token = accessToken ?? (skipAuth ? null : getAccessToken());
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const cleanPath = path.replace(/^\/+/, "");
  const response = await fetch(`${baseUrl}/${cleanPath}`, {
    ...requestOptions,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: requestOptions.cache ?? "no-store",
    headers,
  });

  // 2. Intercept 401 Unauthorized for silent token refresh
  const isAuthEndpoint =
    cleanPath.includes("auth/login") ||
    cleanPath.includes("auth/refresh") ||
    cleanPath.includes("auth/logout");

  if (response.status === 401 && !isAuthEndpoint && !_isRetry) {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        if (!activeRefreshPromise) {
          activeRefreshPromise = requestNewAccessToken(baseUrl).finally(() => {
            activeRefreshPromise = null;
          });
        }

        const newAccessToken = await activeRefreshPromise;

        // 3. Transparently replay the original request with the fresh token
        return await apiRequest<TResponse>(path, {
          ...options,
          accessToken: newAccessToken,
          _isRetry: true,
        });
      } catch {
        // Refresh token failed or expired -> Redirect to login with reason
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/admin/login"
        ) {
          window.location.href = "/admin/login?reason=idle_timeout";
        }
      }
    }
  }

  const payload: unknown =
    response.status === 204 ? undefined : await response.json();

  if (!response.ok) {
    const error = (payload as ApiErrorResponse | undefined)?.error;

    throw new ApiError(
      response.status,
      error?.code,
      error?.details,
      error?.traceId,
      error?.message,
    );
  }

  return payload as TResponse;
}