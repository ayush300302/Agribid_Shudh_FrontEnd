import type { Locale } from "@/lib/messages";

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

type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  accessToken?: string;
  body?: unknown;
  headers?: HeadersInit;
  locale?: Locale;
};

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
    ...requestOptions
  } = options;
  const headers = new Headers(initialHeaders);

  headers.set("Accept", "application/json");
  headers.set("Accept-Language", locale);

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(
    `${baseUrl}/${path.replace(/^\/+/, "")}`,
    {
      ...requestOptions,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: requestOptions.cache ?? "no-store",
      headers,
    },
  );
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