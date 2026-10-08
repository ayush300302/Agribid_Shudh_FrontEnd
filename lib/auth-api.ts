/**
 * Authentication API Service
 * Agribid Shudh Admin Web Console
 * Connects to documented backend auth routes in API_Documentation.md
 */

import { apiRequest } from "@/lib/api-client";
import type {
  LoginRequest,
  RefreshRequest,
  TokenPair,
  UserContext,
} from "@/types/auth";

type ApiResponseWrapper<T> = T | { data: T };

/**
 * Defensively extracts data whether the backend returns
 * raw JSON or a { data: ... } response envelope.
 */
function unwrapResponse<T>(payload: ApiResponseWrapper<T>): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: T }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

/**
 * Authenticates an admin user with email and password.
 * POST /api/v1/auth/login
 */
export async function login(credentials: LoginRequest): Promise<TokenPair> {
  const response = await apiRequest<ApiResponseWrapper<TokenPair>>(
    "/api/v1/auth/login",
    {
      method: "POST",
      body: credentials,
    },
  );
  return unwrapResponse(response);
}

/**
 * Obtains a fresh access/refresh token pair using an existing refresh token.
 * POST /api/v1/auth/refresh
 */
export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const body: RefreshRequest = { refresh_token: refreshToken };
  const response = await apiRequest<ApiResponseWrapper<TokenPair>>(
    "/api/v1/auth/refresh",
    {
      method: "POST",
      body,
    },
  );
  return unwrapResponse(response);
}

/**
 * Revokes the current session and refresh token on the server.
 * POST /api/v1/auth/logout
 */
export async function logout(accessToken?: string): Promise<void> {
  try {
    await apiRequest<void>("/api/v1/auth/logout", {
      method: "POST",
      accessToken,
    });
  } catch {
    // If server logout fails (e.g. network offline or already expired),
    // we still allow local cleanup to succeed.
  }
}

/**
 * Retrieves identity, partner association, and roles for the active session.
 * GET /api/v1/auth/me
 */
export async function getMe(accessToken?: string): Promise<UserContext> {
  const response = await apiRequest<ApiResponseWrapper<UserContext>>(
    "/api/v1/auth/me",
    {
      method: "GET",
      accessToken,
    },
  );
  return unwrapResponse(response);
}