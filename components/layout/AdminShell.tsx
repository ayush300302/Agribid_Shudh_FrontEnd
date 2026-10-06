"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, LogIn } from "lucide-react";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function AdminShell({ children }: { children: ReactNode }) {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-[#f1f5f1] text-[#19392a]">
      <header className="border-b border-[#dce5dd] bg-white">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 rounded-sm">
            <span className="flex size-9 items-center justify-center rounded-md bg-[#1b5e20] text-sm font-bold text-white">
              AS
            </span>
            <span>
              <span className="block text-sm font-semibold">Agribid Shudh</span>
              <span className="block text-xs text-[#64766a]">Admin console</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            <Link
              href="/admin/login"
              aria-label={t("adminSignIn")}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-[#64766a] transition-colors hover:text-[#1b5e20] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1b5e20] sm:size-auto sm:justify-start sm:rounded-sm sm:text-xs sm:font-semibold sm:uppercase sm:tracking-[0.14em]"
            >
              <LogIn aria-hidden="true" size={18} className="sm:hidden" />
              <span className="hidden sm:inline">{t("administration")}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-screen-2xl">
        <aside className="hidden w-60 shrink-0 border-r border-[#dce5dd] bg-white px-4 py-6 md:block">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#718176]">
            {t("workspace")}
          </p>
          <nav aria-label="Main navigation" className="mt-4">
            <Link
              href="/"
              aria-current="page"
              className="flex min-h-11 items-center gap-3 rounded-md bg-[#e9f1e9] px-3 text-sm font-medium text-[#1b5e20]"
            >
              <LayoutDashboard aria-hidden="true" size={18} />
              {t("dashboard")}
            </Link>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <nav
            aria-label="Main navigation"
            className="border-b border-[#dce5dd] bg-white px-4 py-2 md:hidden"
          >
            <Link
              href="/"
              aria-current="page"
              className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-[#1b5e20]"
            >
              <LayoutDashboard aria-hidden="true" size={18} />
              {t("dashboard")}
            </Link>
          </nav>
          <main className="px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}