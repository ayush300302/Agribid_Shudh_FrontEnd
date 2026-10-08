/**
 * Authentication and RBAC Domain Types
 * Derived from API_Documentation.md and Dev Spec M01/M02
 */

// Documented Admin Role codes
export type AdminRole =
  | "ADM_SUPER"
  | "ADM_SALES_OPS"
  | "ADM_FINANCE"
  | "ADM_CATALOG"
  | "ADM_SUPPORT"
  | "ADM_STATE_MGR";

// Documented Partner Role codes
export type PartnerRole =
  | "MF_OWNER"
  | "SS_OWNER"
  | "DS_OWNER"
  | "SD_OWNER"
  | "RT_OWNER"
  | "DS_STAFF_BILLING";

// Combined Role union type
export type Role = AdminRole | PartnerRole;

/**
 * Token response returned by /api/v1/auth/login, /api/v1/auth/refresh,
 * and /api/v1/auth/otp/verify
 */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number; // in seconds
}

/**
 * Admin email/password login request body for POST /api/v1/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Token refresh request body for POST /api/v1/auth/refresh
 */
export interface RefreshRequest {
  refresh_token: string;
}

/**
 * Send OTP request body for POST /api/v1/auth/otp/send
 */
export interface SendOTPRequest {
  phone: string;
}

/**
 * Verify OTP request body for POST /api/v1/auth/otp/verify
 */
export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

/**
 * User Context model returned by GET /api/v1/auth/me
 */
export interface UserContext {
  id: string;
  user_id: string;
  partner_id?: string;
  roles: Role[] | string[];
  is_admin: boolean;
  email?: string;
  full_name?: string;
  phone?: string;
}

/**
 * User record model from backend
 */
export interface User {
  id: string;
  phone: string;
  email?: string | null;
  full_name: string;
  status: "active" | "inactive" | "suspended" | string;
  partner_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Client-side authentication state indicator
 */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";