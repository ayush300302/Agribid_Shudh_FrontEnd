"use client";

import { useState, type FormEvent } from "react";
import { Suspense } from "react";
import { MotionConfig, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import AdminAuthLayout from "@/components/auth/AdminAuthLayout";
import SessionExpiryNotice from "@/components/auth/SessionExpiryNotice";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function AdminLoginPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <AdminAuthLayout eyebrow="secureAccess" title="adminSignIn">
      <Suspense fallback={null}>
        <SessionExpiryNotice />
      </Suspense>
      <MotionConfig reducedMotion="user">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#31483a]"
            >
              {t("email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-12 w-full rounded-md border border-[#cbd8ce] bg-white px-4 text-sm text-[#19392a] outline-none transition-colors placeholder:text-[#87958b] focus:border-[#1b5e20] focus:ring-3 focus:ring-[#1b5e20]/15"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#31483a]"
            >
              {t("password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-md border border-[#cbd8ce] bg-white px-4 text-sm text-[#19392a] outline-none transition-colors placeholder:text-[#87958b] focus:border-[#1b5e20] focus:ring-3 focus:ring-[#1b5e20]/15"
            />
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-md bg-[#ed8b32] text-sm font-semibold text-white shadow-sm hover:bg-[#d97822] focus-visible:ring-[#ed8b32]/40"
          >
            {t("continue")}
          </Button>
        </motion.form>
      </MotionConfig>
    </AdminAuthLayout>
  );
}