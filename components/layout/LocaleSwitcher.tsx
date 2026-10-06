"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { Locale } from "@/lib/messages";

const languageNames: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
};

export default function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <select
      aria-label={t("language")}
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
      className="h-9 rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#31483a] outline-none focus:border-[#1b5e20] focus:ring-3 focus:ring-[#1b5e20]/15"
    >
      {Object.entries(languageNames).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}