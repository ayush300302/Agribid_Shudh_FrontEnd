import type { ReactNode } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";
import type { MessageKey } from "@/lib/messages";

type AdminAuthLayoutProps = {
  eyebrow: MessageKey;
  title: MessageKey;
  description?: MessageKey;
  children: ReactNode;
};

export default function AdminAuthLayout({
  eyebrow,
  title,
  description,
  children,
}: AdminAuthLayoutProps) {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-[#f1f5f1] text-[#19392a]">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:py-8">
        <aside className="relative hidden overflow-hidden rounded-lg bg-[#1b5e20] p-10 text-white lg:flex lg:min-h-[640px] lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:40px_40px]"
          />
          <div className="relative">
            <div className="h-1 w-12 rounded-sm bg-[#ed8b32]" />
            <p className="mt-7 text-3xl font-semibold">Agribid Shudh</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              {t("adminConsole")}
            </p>
          </div>
          <div className="relative border-l-2 border-[#ed8b32] pl-4">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-white/85">
              {t("administration")}
            </p>
          </div>
        </aside>

        <section className="mx-auto flex w-full max-w-[440px] flex-col justify-center rounded-lg border border-[#dce5dd] bg-white px-6 py-9 shadow-[0_12px_40px_rgba(25,57,42,0.07)] sm:px-10 sm:py-11 lg:border-transparent lg:bg-transparent lg:px-8 lg:shadow-none">
          <div className="mb-6 flex justify-end">
            <LocaleSwitcher />
          </div>
          <div className="mb-10 lg:hidden">
            <div className="h-1 w-10 rounded-sm bg-[#ed8b32]" />
            <p className="mt-4 text-xl font-semibold">Agribid Shudh</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#64766a]">
              {t("adminConsole")}
            </p>
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1b5e20]">
              {t(eyebrow)}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#19392a]">
              {t(title)}
            </h1>
            {description ? (
              <p className="mt-3 text-sm leading-6 text-[#64766a]">
                {t(description)}
              </p>
            ) : null}
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}