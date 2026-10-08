"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import * as authApi from "@/lib/auth-api";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  setTokens,
} from "@/lib/token";
import type {
  AuthStatus,
  LoginRequest,
  Role,
  UserContext,
} from "@/types/auth";

export interface AuthContextValue {
  user: UserContext | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (allowedRoles: Role | Role[] | string | string[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserContext | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  /**
   * Refreshes the active user context from GET /api/v1/auth/me
   */
  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      const userContext = await authApi.getMe(token);
      setUser(userContext);
      setStatus("authenticated");
    } catch {
      clearTokens();
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  /**
   * Initial session bootstrap on mount
   */
  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      // Case 1: No credentials stored
      if (!accessToken && !refreshToken) {
        if (isMounted) setStatus("unauthenticated");
        return;
      }

      // Case 2: Valid access token exists
      if (accessToken && !isTokenExpired(accessToken)) {
        try {
          const userContext = await authApi.getMe(accessToken);
          if (isMounted) {
            setUser(userContext);
            setStatus("authenticated");
          }
          return;
        } catch {
          // If /me fails with 401, fall through to refresh flow
        }
      }

      // Case 3: Access token expired, but refresh token exists
      if (refreshToken) {
        try {
          const tokenPair = await authApi.refreshTokens(refreshToken);
          setTokens({
            accessToken: tokenPair.access_token,
            refreshToken: tokenPair.refresh_token,
          });

          const userContext = await authApi.getMe(tokenPair.access_token);
          if (isMounted) {
            setUser(userContext);
            setStatus("authenticated");
          }
          return;
        } catch {
          // Refresh token invalid or revoked on server
        }
      }

      // Fallback: Clear corrupted/expired credentials
      clearTokens();
      if (isMounted) {
        setUser(null);
        setStatus("unauthenticated");
      }
    }

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Handles user login: obtains tokens, persists them, and loads user context
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    setStatus("loading");
    try {
      const tokenPair = await authApi.login(credentials);
      setTokens({
        accessToken: tokenPair.access_token,
        refreshToken: tokenPair.refresh_token,
      });

      const userContext = await authApi.getMe(tokenPair.access_token);
      setUser(userContext);
      setStatus("authenticated");
    } catch (error) {
      setStatus("unauthenticated");
      throw error;
    }
  }, []);

  /**
   * Handles user logout: informs server, wipes local storage, and resets state
   */
  const logout = useCallback(async () => {
    const token = getAccessToken();
    clearTokens();
    setUser(null);
    setStatus("unauthenticated");

    if (token) {
      await authApi.logout(token);
    }

    router.push("/admin/login");
  }, [router]);

  /**
   * Checks whether the current user possesses any of the required roles
   */
  const hasRole = useCallback(
    (allowedRoles: Role | Role[] | string | string[]): boolean => {
      if (!user) return false;

      // Super Admins bypass role checks
      if (user.is_admin && user.roles.includes("ADM_SUPER")) {
        return true;
      }

      const roleList = Array.isArray(allowedRoles)
        ? allowedRoles
        : [allowedRoles];
      const userRoles = Array.isArray(user.roles) ? user.roles : [];

      return roleList.some((role) => userRoles.includes(role as Role));
    },
    [user],
  );

  const value: AuthContextValue = {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    login,
    logout,
    hasRole,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to consume the AuthContext
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}