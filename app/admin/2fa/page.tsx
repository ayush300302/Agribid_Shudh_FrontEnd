"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import AdminAuthLayout from "@/components/auth/AdminAuthLayout";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function AdminTwoFactorPage() {
  const { t } = useLocale();
  const [code, setCode] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <AdminAuthLayout
      eyebrow="twoFactorVerification"
      title="verifyIdentity"
      description="authenticatorPrompt"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-[#31483a]">
            {t("authenticatorCode")}
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="mt-2 h-12 w-full rounded-md border border-[#cbd8ce] bg-white px-4 text-sm text-[#19392a] outline-none transition-colors focus:border-[#1b5e20] focus:ring-3 focus:ring-[#1b5e20]/15"
          />
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-md bg-[#ed8b32] text-sm font-semibold text-white shadow-sm hover:bg-[#d97822] focus-visible:ring-[#ed8b32]/40"
        >
          {t("verify")}
        </Button>
      </form>
    </AdminAuthLayout>
  );
}