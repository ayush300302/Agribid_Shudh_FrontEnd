"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  Moon,
  Radio,
  Save,
  Server,
  Settings,
  ShieldCheck,
  Smartphone,
  Wifi,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/notification-api";
import type { NotificationPreferences } from "@/types/notification";

export default function NotificationSettingsPage() {
  const queryClient = useQueryClient();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: prefs, isLoading } = useQuery({
    queryKey: ["notifications-prefs"],
    queryFn: () => getNotificationPreferences(),
  });

  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState("21:00");
  const [quietEnd, setQuietEnd] = useState("08:00");

  const saveMutation = useMutation({
    mutationFn: () =>
      updateNotificationPreferences({
        quiet_hours_enabled: quietHoursEnabled,
        quiet_hours_start: quietStart,
        quiet_hours_end: quietEnd,
      }),
    onSuccess: () => {
      setSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["notifications-prefs"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-metrics"] });
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "distributor"]}>
      <AdminShell>
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div>
            <Link
              href="/admin/notifications"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64766a] transition-colors hover:text-[#1b5e20]"
            >
              <ArrowLeft size={14} /> Back to Notification Logs
            </Link>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-purple-50 p-1.5 text-purple-700">
                    <Settings size={20} />
                  </span>
                  <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                    Gateway Status & Routing Policy
                  </h1>
                </div>
                <p className="mt-0.5 text-xs text-[#64766a]">
                  Manage third-party telco adapters, TRAI quiet-hours compliance, and channel fallbacks.
                </p>
              </div>

              {saveSuccess && (
                <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 size={14} /> Policy Saved Successfully
                </div>
              )}
            </div>
          </div>

          {/* 1. Gateway Health Cards */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#19392a]">
              Active Gateway Health & Telco Connectivity
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* WhatsApp Cloud API */}
              <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#19392a]">WhatsApp Business BSP</span>
                  <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs text-[#64766a]">Meta Cloud API (WABA ID: 1092841)</p>
                <div className="pt-2 border-t border-[#eef2ef] text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Wifi size={12} /> Connected · Latency 142ms
                </div>
              </div>

              {/* DLT SMS Telecom */}
              <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#19392a]">Airtel / Jio DLT Gateway</span>
                  <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs text-[#64766a]">Principal Entity: 140156991024</p>
                <div className="pt-2 border-t border-[#eef2ef] text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Wifi size={12} /> Registered Header: AGRIBD
                </div>
              </div>

              {/* Firebase Cloud Messaging */}
              <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#19392a]">Firebase Cloud Push (FCM)</span>
                  <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs text-[#64766a]">Project: agribid-shudh-prod</p>
                <div className="pt-2 border-t border-[#eef2ef] text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Wifi size={12} /> HTTP v1 API Ready
                </div>
              </div>
            </div>
          </div>

          {/* 2. Quiet Hours Settings */}
          <div className="rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-50 p-1.5 text-amber-700">
                <Moon size={18} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#19392a]">
                  TRAI Quiet Hours Compliance (Rule M13.5)
                </h3>
                <p className="text-xs text-[#64766a]">
                  Non-transactional messages are held in a delay queue between 21:00 and 08:00 IST and automatically flushed at 08:00 AM.
                </p>
              </div>
            </div>

            <div className="border-t border-[#eef2ef] pt-4 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#19392a]">Enforce Quiet Hours Queueing:</span>
                  <p className="text-[#87958b]">Hold promotional/stock broadcasts until morning</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quietHoursEnabled}
                    onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1b5e20]" />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-[#19392a] mb-1">
                    Quiet Hours Start Time (IST):
                  </label>
                  <input
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    className="w-full rounded-md border border-[#dce5dd] p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#19392a] mb-1">
                    Quiet Hours End Time (IST):
                  </label>
                  <input
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    className="w-full rounded-md border border-[#dce5dd] p-2 text-xs"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-[#f8faf8] border border-[#eef2ef] p-3 text-[11px] text-[#64766a]">
                <strong className="text-[#19392a]">Statutory Exemption:</strong> Critical transactional messages (OTP, Delivery OTP, Seller PO allocation, Payment Receipts, Credit Hold) bypass quiet hours and are dispatched immediately 24x7.
              </div>
            </div>
          </div>

          {/* 3. Fallback Channel Matrix */}
          <div className="rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-50 p-1.5 text-blue-700">
                <Layers size={18} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#19392a]">
                  Automatic Delivery Fallback Matrix
                </h3>
                <p className="text-xs text-[#64766a]">
                  If primary push / WhatsApp channel times out after 120s, system automatically cascades to DLT SMS.
                </p>
              </div>
            </div>

            <div className="border-t border-[#eef2ef] pt-4 text-xs space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-[#f8faf8]">
                <span className="font-semibold text-[#19392a]">Delivery OTP:</span>
                <span className="text-[#1b5e20] font-mono font-medium">SMS (Primary) → WhatsApp (Secondary)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#f8faf8]">
                <span className="font-semibold text-[#19392a]">New Order Alert:</span>
                <span className="text-[#1b5e20] font-mono font-medium">WhatsApp (Primary) → Push → SMS</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#f8faf8]">
                <span className="font-semibold text-[#19392a]">Credit Hold Alert:</span>
                <span className="text-[#1b5e20] font-mono font-medium">In-App (Primary) + WhatsApp (Instant)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] transition-colors"
              >
                <Save size={14} /> Save Gateway Policies
              </button>
            </div>
          </div>
        </div>
      </AdminShell>
    </RoleGuard>
  );
}
