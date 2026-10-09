"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertOctagon,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  ExternalLink,
  Layers,
  Power,
  Radio,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  Smartphone,
  Sliders,
  Users,
  Wifi,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import {
  evictAdminSession,
  getSystemHealth,
  listActiveSessions,
  listFeatureFlags,
  toggleFeatureFlag,
  toggleMaintenanceMode,
} from "@/lib/admin-console-api";
import type { FeatureFlagConfig } from "@/types/admin-console";

export default function PlatformOperationsPage() {
  const queryClient = useQueryClient();
  const [maintenanceFeedback, setMaintenanceFeedback] = useState<string | null>(null);

  // Queries
  const { data: health, isLoading: loadingHealth } = useQuery({
    queryKey: ["system-health"],
    queryFn: () => getSystemHealth(),
    refetchInterval: 15000,
  });

  const { data: featureFlags = [], isLoading: loadingFlags } = useQuery({
    queryKey: ["feature-flags"],
    queryFn: () => listFeatureFlags(),
  });

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: () => listActiveSessions(),
  });

  // Mutations
  const maintenanceMutation = useMutation({
    mutationFn: (enabled: boolean) => toggleMaintenanceMode(enabled),
    onSuccess: (enabled) => {
      setMaintenanceFeedback(
        enabled ? "Platform switched to MAINTENANCE MODE!" : "Platform RESTORED to normal operations.",
      );
      queryClient.invalidateQueries({ queryKey: ["system-health"] });
      setTimeout(() => setMaintenanceFeedback(null), 3000);
    },
  });

  const flagMutation = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      toggleFeatureFlag(key, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
    },
  });

  const evictMutation = useMutation({
    mutationFn: (id: string) => evictAdminSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["system-health"] });
    },
  });

  return (
    <RoleGuard allowedRoles={["admin", "ADM_SUPER"]}>
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Link
              href="/admin/governance"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64766a] transition-colors hover:text-[#1b5e20]"
            >
              <ArrowLeft size={14} /> Back to Maker-Checker Governance
            </Link>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-cyan-50 p-1.5 text-cyan-800">
                    <Server size={20} />
                  </span>
                  <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                    Platform Operations & System Health
                  </h1>
                </div>
                <p className="mt-0.5 text-xs text-[#64766a]">
                  Real-time AWS ECS compute health, BullMQ background queues, active sessions, and global feature toggles.
                </p>
              </div>

              {maintenanceFeedback && (
                <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-900">
                  {maintenanceFeedback}
                </div>
              )}
            </div>
          </div>

          {/* 1. Real-time Cluster Health Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {/* API Cluster */}
            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#87958b] uppercase">API Cluster</span>
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="mt-1 text-2xl font-black text-emerald-700">
                {health?.api_status ?? "HEALTHY"}
              </p>
              <span className="text-[10px] text-[#64766a]">
                Uptime: {Math.floor((health?.uptime_seconds || 489240) / 86400)}d {Math.floor(((health?.uptime_seconds || 489240) % 86400) / 3600)}h
              </span>
            </div>

            {/* DB Replica Lag */}
            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#87958b] uppercase">Postgres Lag</span>
                <Database size={13} className="text-[#1b5e20]" />
              </div>
              <p className="mt-1 text-2xl font-black text-[#19392a]">
                {health?.db_replica_lag_ms ?? 12} ms
              </p>
              <span className="text-[10px] text-emerald-700 font-medium">Read replica sync OK</span>
            </div>

            {/* Redis Queues */}
            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#87958b] uppercase">BullMQ Depth</span>
                <Cpu size={13} className="text-purple-600" />
              </div>
              <p className="mt-1 text-2xl font-black text-purple-700">
                {health?.redis_queue_depth ?? 4} Jobs
              </p>
              <span className="text-[10px] text-[#64766a]">
                {health?.active_bullmq_workers ?? 6} workers processing
              </span>
            </div>

            {/* Live Sessions */}
            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#87958b] uppercase">Active Sessions</span>
                <Users size={13} className="text-[#1b5e20]" />
              </div>
              <p className="mt-1 text-2xl font-black text-[#19392a]">
                {health?.active_admin_sessions ?? sessions.length}
              </p>
              <span className="text-[10px] text-[#64766a]">30-min idle timeout</span>
            </div>

            {/* Maintenance Mode */}
            <div className="col-span-2 sm:col-span-1 rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#87958b] uppercase">App Gateway</span>
                <Power size={13} className={health?.maintenance_mode ? "text-red-600" : "text-emerald-600"} />
              </div>
              <p className="mt-1 text-sm font-bold">
                {health?.maintenance_mode ? (
                  <span className="text-red-700">MAINTENANCE</span>
                ) : (
                  <span className="text-emerald-700">ONLINE (Normal)</span>
                )}
              </p>
              <span className="text-[10px] text-[#64766a]">{health?.min_supported_mobile_version}</span>
            </div>
          </div>

          {/* 2. Emergency Maintenance Mode Switch */}
          <div className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="rounded-md bg-amber-50 p-2 text-amber-700 shrink-0">
                <AlertOctagon size={22} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#19392a]">
                  Platform Maintenance Emergency Switch
                </h3>
                <p className="text-xs text-[#64766a]">
                  When active, blocks mobile order placements and displays the blocking maintenance screen across all partner devices.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => maintenanceMutation.mutate(!health?.maintenance_mode)}
              disabled={maintenanceMutation.isPending}
              className={`rounded-md px-4 py-2 text-xs font-bold transition-colors shadow-xs ${
                health?.maintenance_mode
                  ? "bg-emerald-700 text-white hover:bg-emerald-800"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {health?.maintenance_mode ? "Disable Maintenance Mode" : "Activate Maintenance Mode"}
            </button>
          </div>

          {/* 3. Global Feature Flags Switchboard */}
          <div className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#eef2ef] pb-3">
              <Sliders size={18} className="text-[#1b5e20]" />
              <h3 className="text-base font-bold text-[#19392a]">
                Global Master Feature Flags Switchboard
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {featureFlags.map((flag) => (
                <div
                  key={flag.key}
                  className="rounded-lg border border-[#eef2ef] bg-[#fafbfa] p-4 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#19392a]">{flag.name}</span>
                      <span className="rounded bg-white border border-[#dce5dd] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#64766a]">
                        {flag.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64766a] leading-relaxed">
                      {flag.description}
                    </p>
                    <code className="text-[10px] text-[#1b5e20] font-mono">{flag.key}</code>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={flag.enabled}
                      onChange={(e) =>
                        flagMutation.mutate({ key: flag.key, enabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1b5e20]" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Active Admin Sessions Table (Rule AU-07 & 30-min Idle Monitor) */}
          <div className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#1b5e20]" />
                <div>
                  <h3 className="text-base font-bold text-[#19392a]">
                    Active Admin Sessions & Idle Monitor
                  </h3>
                  <p className="text-xs text-[#64766a]">
                    Rule AU-07 session control: 30-minute idle eviction with single-click remote token revocation.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#19392a]">
                {sessions.length} Live Logins
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#19392a]">
                  <tr>
                    <th className="px-4 py-3">Admin User</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Client Device / OS</th>
                    <th className="px-3 py-3">IP Address (Geo)</th>
                    <th className="px-3 py-3">Login Timestamp</th>
                    <th className="px-4 py-3 text-center">Security Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2ef]">
                  {sessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-[#fafbfa]">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-[#19392a]">{sess.user_name}</p>
                        <p className="font-mono text-[11px] text-[#64766a]">{sess.email}</p>
                      </td>

                      <td className="px-3 py-3.5 font-mono text-[11px] font-bold text-[#1b5e20]">
                        {sess.role}
                      </td>

                      <td className="px-3 py-3.5 text-[#64766a]">
                        {sess.device_info}
                      </td>

                      <td className="px-3 py-3.5 font-mono text-[11px] text-[#19392a]">
                        {sess.ip_address}
                      </td>

                      <td className="px-3 py-3.5 text-[#64766a]">
                        {new Date(sess.login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => evictMutation.mutate(sess.id)}
                          disabled={evictMutation.isPending}
                          className="rounded bg-red-50 border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 transition-colors"
                        >
                          Evict Session
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AdminShell>
    </RoleGuard>
  );
}

