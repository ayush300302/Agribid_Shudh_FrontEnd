"use client";

import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function SessionExpiryNotice() {
  const searchParams = useSearchParams();
  const { t } = useLocale();

  if (searchParams.get("reason") !== "idle_timeout") {
    return null;
  }

  return (
    <p
      role="alert"
      className="mb-5 rounded-md border border-[#ed8b32]/40 bg-[#fff7eb] px-4 py-3 text-sm text-[#704516]"
    >
      {t("sessionExpired")}
    </p>
  );
}