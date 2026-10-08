/**
 * Centralized Token and JWT Utility
 * Agribid Shudh Admin Web Console
 */

export interface JwtPayload {
  sub?: string;
  user_id?: string;
  partner_id?: string;
  role?: string;
  roles?: string[];
  is_admin?: boolean;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export interface SetTokensParams {
  accessToken: string;
  refreshToken?: string;
}

const ACCESS_TOKEN_KEY = "as_access_token";
const REFRESH_TOKEN_KEY = "as_refresh_token";

/**
 * Checks whether execution is happening in the browser.
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Retrieves the stored access token from localStorage.
 */
export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Retrieves the stored refresh token from localStorage.
 */
export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Persists token credentials to localStorage.
 */
export function setTokens({ accessToken, refreshToken }: SetTokensParams): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

/**
 * Removes all token credentials from localStorage.
 */
export function clearTokens(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Safely decodes a JWT payload without external dependencies.
 * Returns null if the token is invalid or malformed.
 */
export function decodeJwt<T = JwtPayload>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(payloadBase64)
        .split("")
        .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}

/**
 * Evaluates whether a JWT token has expired based on its `exp` claim.
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt<JwtPayload>(token);
  if (!payload || !payload.exp) {
    return true;
  }
  // Convert exp (in seconds) to milliseconds
  return Date.now() >= payload.exp * 1000;
}

/**
 * Extracts the user role from the currently stored access token.
 */
export function getStoredUserRole(): string | null {
  const token = getAccessToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }

  const payload = decodeJwt<JwtPayload>(token);
  if (!payload) return null;

  // Backend JWT contains `role` claim or falls back to first entry of `roles`
  if (typeof payload.role === "string") {
    return payload.role;
  }
  if (Array.isArray(payload.roles) && payload.roles.length > 0) {
    return payload.roles[0];
  }

  return null;
}