"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IndianRupee,
  LayoutDashboard,
  LogIn,
  LogOut,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User as UserIcon,
  Users,
} from "lucide-react";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AdminShell({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const dashboardActive = pathname === "/";
  const rolesActive = pathname === "/admin/access/roles";
  const partnersActive = pathname.startsWith("/admin/partners");
  const catalogActive = pathname.startsWith("/admin/products");
  const ordersActive = pathname.startsWith("/admin/orders");
  const fulfilmentActive = pathname.startsWith("/admin/fulfilment");
  const pricingActive =
    pathname.startsWith("/admin/pricing") || pathname.startsWith("/admin/schemes");

  const navigationClass = (active: boolean) =>
    `flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
      active
        ? "bg-[#e9f1e9] text-[#1b5e20]"
        : "text-[#64766a] hover:bg-[#f1f5f1] hover:text-[#1b5e20]"
    }`;

  const currentRole =
    user?.roles?.[0] || (user?.is_admin ? "ADM_SUPER" : "USER");

  return (
    <div className="min-h-screen bg-[#f1f5f1] text-[#19392a]">
      {/* Top Header */}
      <header className="border-b border-[#dce5dd] bg-white">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 rounded-sm">
            <span className="flex size-9 items-center justify-center rounded-md bg-[#1b5e20] text-sm font-bold text-white">
              AS
            </span>
            <span>
              <span className="block text-sm font-semibold">Agribid Shudh</span>
              <span className="block text-xs text-[#64766a]">
                Admin console
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <LocaleSwitcher />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 border-l border-[#dce5dd] pl-4">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-semibold text-[#19392a]">
                    {user.full_name || user.email || "Admin"}
                  </p>
                  <p className="font-mono text-[11px] font-medium text-[#1b5e20]">
                    {currentRole}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  aria-label="Sign out"
                  title="Sign out"
                  className="inline-flex size-9 items-center justify-center rounded-md text-[#64766a] transition-colors hover:bg-[#f8d7da]/60 hover:text-[#842029] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#842029]"
                >
                  <LogOut aria-hidden="true" size={18} />
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                aria-label={t("adminSignIn")}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-[#64766a] transition-colors hover:text-[#1b5e20] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1b5e20] sm:size-auto sm:justify-start sm:rounded-sm sm:text-xs sm:font-semibold sm:uppercase sm:tracking-[0.14em]"
              >
                <LogIn aria-hidden="true" size={18} className="sm:hidden" />
                <span className="hidden sm:inline">{t("administration")}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-screen-2xl">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-[#dce5dd] bg-white px-4 py-6 md:flex">
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#718176]">
              {t("workspace")}
            </p>
            <nav aria-label="Main navigation" className="mt-4">
              <Link
                href="/"
                aria-current={dashboardActive ? "page" : undefined}
                className={navigationClass(dashboardActive)}
              >
                <LayoutDashboard aria-hidden="true" size={18} />
                {t("dashboard")}
              </Link>
              <Link
                href="/admin/partners"
                aria-current={partnersActive ? "page" : undefined}
                className={`mt-1 ${navigationClass(partnersActive)}`}
              >
                <Users aria-hidden="true" size={18} />
                Partners
              </Link>
              <Link
                href="/admin/products"
                aria-current={catalogActive ? "page" : undefined}
                className={`mt-1 ${navigationClass(catalogActive)}`}
              >
                <Package aria-hidden="true" size={18} />
                Catalog
              </Link>
              <Link
                href="/admin/orders"
                aria-current={ordersActive ? "page" : undefined}
                className={`mt-1 ${navigationClass(ordersActive)}`}
              >
                <ShoppingBag aria-hidden="true" size={18} />
                Orders & POs
              </Link>
              <Link
                href="/admin/fulfilment"
                aria-current={fulfilmentActive ? "page" : undefined}
                className={`mt-1 ${navigationClass(fulfilmentActive)}`}
              >
                <Truck aria-hidden="true" size={18} />
                Fulfilment & Dispatch
              </Link>
              <Link
                href="/admin/pricing"
                aria-current={pricingActive ? "page" : undefined}
                className={`mt-1 ${navigationClass(pricingActive)}`}
              >
                <IndianRupee aria-hidden="true" size={18} />
                Pricing & Schemes
              </Link>
              <Link
                href="/admin/access/roles"
                aria-current={rolesActive ? "page" : undefined}
                className={`mt-1 ${navigationClass(rolesActive)}`}
              >
                <ShieldCheck aria-hidden="true" size={18} />
                {t("rolesAndPermissions")}
              </Link>
            </nav>
          </div>

          {/* User Session Footer Card */}
          {isAuthenticated && user ? (
            <div className="rounded-md border border-[#dce5dd] bg-[#f1f5f1] p-3 text-xs">
              <div className="flex items-center gap-2 text-[#19392a]">
                <UserIcon size={14} className="text-[#1b5e20]" />
                <span className="font-semibold truncate">
                  {user.full_name || "Active Session"}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-[#64766a]">
                Role: {currentRole}
              </p>
            </div>
          ) : null}
        </aside>

        {/* Content Area */}
        <div className="min-w-0 flex-1">
          {/* Mobile Top Navigation */}
          <nav
            aria-label="Main navigation"
            className="border-b border-[#dce5dd] bg-white px-4 py-2 md:hidden"
          >
            <Link
              href="/"
              aria-current={dashboardActive ? "page" : undefined}
              className={`inline-flex ${navigationClass(dashboardActive)}`}
            >
              <LayoutDashboard aria-hidden="true" size={18} />
              {t("dashboard")}
            </Link>
            <Link
              href="/admin/partners"
              aria-current={partnersActive ? "page" : undefined}
              className={`ml-1 inline-flex ${navigationClass(partnersActive)}`}
            >
              <Users aria-hidden="true" size={18} />
              Partners
            </Link>
            <Link
              href="/admin/products"
              aria-current={catalogActive ? "page" : undefined}
              className={`ml-1 inline-flex ${navigationClass(catalogActive)}`}
            >
              <Package aria-hidden="true" size={18} />
              Catalog
            </Link>
            <Link
              href="/admin/orders"
              aria-current={ordersActive ? "page" : undefined}
              className={`ml-1 inline-flex ${navigationClass(ordersActive)}`}
            >
              <ShoppingBag aria-hidden="true" size={18} />
              Orders
            </Link>
            <Link
              href="/admin/fulfilment"
              aria-current={fulfilmentActive ? "page" : undefined}
              className={`ml-1 inline-flex ${navigationClass(fulfilmentActive)}`}
            >
              <Truck aria-hidden="true" size={18} />
              Fulfilment
            </Link>
            <Link
              href="/admin/pricing"
              aria-current={pricingActive ? "page" : undefined}
              className={`ml-1 inline-flex ${navigationClass(pricingActive)}`}
            >
              <IndianRupee aria-hidden="true" size={18} />
              Pricing
            </Link>
            <Link
              href="/admin/access/roles"
              aria-current={rolesActive ? "page" : undefined}
              className={`ml-1 inline-flex ${navigationClass(rolesActive)}`}
            >
              <ShieldCheck aria-hidden="true" size={18} />
              {t("rolesAndPermissions")}
            </Link>
          </nav>

          <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}