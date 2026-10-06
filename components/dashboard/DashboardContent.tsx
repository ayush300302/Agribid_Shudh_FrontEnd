"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Sprout } from "lucide-react";
import Image from "next/image";

const supplyChain = [
  "agribid",
  "stateStockist",
  "distributor",
  "subDistributor",
  "retailer",
] as const;

export default function DashboardContent() {
  const { t } = useLocale();

  return (
    <div className="space-y-7">
      <section className="relative isolate min-h-[230px] overflow-hidden rounded-lg bg-[#1b5e20] text-white sm:min-h-[270px]">
        <Image
          src="/farmer-field.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1360px"
          className="object-cover object-[center_48%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#123b1a]/90 via-[#123b1a]/65 to-[#123b1a]/15"
        />
        <div className="relative flex min-h-[230px] flex-col justify-between gap-6 p-6 sm:min-h-[270px] sm:flex-row sm:items-end sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
              {t("adminConsole")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("dashboard")}
            </h1>
            <p className="mt-2 text-sm text-white/90 sm:text-base">
              {t("dashboardWelcome")}
            </p>
          </div>

          <div className="inline-flex min-h-10 items-center gap-2 self-start rounded-md border border-white/30 bg-[#fffaf0]/95 px-3 text-xs font-medium text-[#76551f] sm:self-auto">
            <span aria-hidden="true" className="size-2 rounded-full bg-[#ed8b32]" />
            {t("notConnected")}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.8fr)]">
        <section className="rounded-lg border border-[#dce5dd] bg-white p-5 shadow-[0_8px_28px_rgba(25,57,42,0.04)] sm:p-7">
          <div className="flex items-center justify-between gap-4 border-b border-[#e8eee9] pb-4">
            <h2 className="text-lg font-semibold text-[#19392a]">
              {t("operationsOverview")}
            </h2>
            <span className="rounded-sm bg-[#f1f5f1] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64766a]">
              API
            </span>
          </div>

          <div className="flex min-h-48 flex-col items-start justify-center gap-4 py-7 sm:flex-row sm:items-center">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-[#e9f1e9] text-[#1b5e20]">
              <Sprout aria-hidden="true" size={28} strokeWidth={1.7} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#19392a]">
                {t("dashboardNoMetricsTitle")}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#64766a]">
                {t("dashboardNoMetricsBody")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8eee9] pt-4 text-sm">
            <span className="text-[#64766a]">{t("dashboardSource")}</span>
            <span className="font-medium text-[#76551f]">{t("notConnected")}</span>
          </div>
        </section>

        <aside className="relative overflow-hidden rounded-lg bg-[#1b5e20] p-5 text-white sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(135deg,transparent_49%,rgba(255,255,255,0.8)_50%,transparent_51%)] [background-size:22px_22px]"
          />
          <div className="relative">
            <div className="flex items-center gap-3">
              <Sprout aria-hidden="true" size={21} />
              <div>
                <h2 className="text-lg font-semibold">
                  {t("distributionNetwork")}
                </h2>
                <p className="mt-1 text-xs text-white/70">
                  {t("networkFlowDescription")}
                </p>
              </div>
            </div>

            <ol className="mt-7 space-y-3">
              {supplyChain.map((role, index) => (
                <li key={role} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/35 text-xs font-semibold text-white/80">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{t(role)}</span>
                  {index < supplyChain.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="ml-auto h-px flex-1 bg-white/25"
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}