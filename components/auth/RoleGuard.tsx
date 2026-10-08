"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Role } from "@/types/auth";

export interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: Role[] | string[];
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * Guards client-side routes and components based on authentication
 * and M02 user roles.
 */
export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = "/admin/login",
  fallback,
}: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();

  useEffect(() => {
    // If loading is complete and user is not logged in, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, router]);

  // 1. Show loading state while checking credentials in localStorage
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[#64766a]">
          <span
            className="size-4 animate-spin rounded-full border-2 border-[#1b5e20] border-t-transparent"
            aria-hidden="true"
          />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: return null while redirection is in flight
  if (!isAuthenticated) {
    return null;
  }

  // 3. Authenticated, but lacks the required role(s)
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="mx-auto my-12 max-w-lg rounded-lg border border-[#dce5dd] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f8d7da] text-[#842029]">
          <ShieldAlert size={24} aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-[#19392a]">
          Access Restricted
        </h2>
        <p className="mt-2 text-sm text-[#64766a]">
          Your account does not have the required permissions to view this
          section.
        </p>
        <div className="mt-4 inline-flex items-center rounded-md bg-[#f1f5f1] px-3 py-1 font-mono text-xs text-[#31483a]">
          Current Role: {user?.roles?.join(", ") || "No role assigned"}
        </div>
      </div>
    );
  }

  // 4. Authenticated & Authorized: render content
  return <>{children}</>;
}