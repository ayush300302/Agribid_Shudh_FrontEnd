"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { MotionConfig, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import AdminAuthLayout from "@/components/auth/AdminAuthLayout";
import SessionExpiryNotice from "@/components/auth/SessionExpiryNotice";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { ApiError } from "@/lib/api-client";

export default function AdminLoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await login({ email, password });
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(
          err.message || "Invalid credentials. Please verify your email and password.",
        );
      } else {
        setErrorMessage("Unable to connect to the server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
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
          {errorMessage ? (
            <div
              role="alert"
              className="rounded-md border border-[#f5c2c7] bg-[#f8d7da] px-4 py-3 text-sm text-[#842029]"
            >
              {errorMessage}
            </div>
          ) : null}

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
              disabled={submitting}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-12 w-full rounded-md border border-[#cbd8ce] bg-white px-4 text-sm text-[#19392a] outline-none transition-colors placeholder:text-[#87958b] focus:border-[#1b5e20] focus:ring-3 focus:ring-[#1b5e20]/15 disabled:opacity-60"
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
              disabled={submitting}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-md border border-[#cbd8ce] bg-white px-4 text-sm text-[#19392a] outline-none transition-colors placeholder:text-[#87958b] focus:border-[#1b5e20] focus:ring-3 focus:ring-[#1b5e20]/15 disabled:opacity-60"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-md bg-[#ed8b32] text-sm font-semibold text-white shadow-sm hover:bg-[#d97822] focus-visible:ring-[#ed8b32]/40 disabled:opacity-60"
          >
            {submitting ? "Signing in..." : t("continue")}
          </Button>
        </motion.form>
      </MotionConfig>
    </AdminAuthLayout>
  );
}