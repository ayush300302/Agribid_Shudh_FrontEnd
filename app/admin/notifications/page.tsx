"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCode2,
  Filter,
  Layers,
  MessageSquare,
  Moon,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldAlert,
  Smartphone,
  X,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import {
  getNotificationMetrics,
  listNotificationTemplates,
  listNotifications,
  retryNotification,
  sendTestNotification,
} from "@/lib/notification-api";
import type {
  NotificationChannel,
  NotificationLanguage,
  NotificationRecord,
  NotificationStatus,
} from "@/types/notification";

function getChannelBadge(channel: NotificationChannel) {
  switch (channel) {
    case "WHATSAPP":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
          <span className="text-[10px]">WA</span> WhatsApp
        </span>
      );
    case "SMS":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
          <Smartphone size={11} /> DLT SMS
        </span>
      );
    case "PUSH":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-200">
          <Radio size={11} /> FCM Push
        </span>
      );
    case "IN_APP":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#1b5e20]/10 px-2 py-0.5 text-[11px] font-semibold text-[#1b5e20] border border-[#1b5e20]/20">
          <Bell size={11} /> In-App
        </span>
      );
  }
}

function getStatusBadge(status: NotificationStatus) {
  switch (status) {
    case "DELIVERED":
    case "READ":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={11} /> {status}
        </span>
      );
    case "SENT":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
          <Clock size={11} /> SENT
        </span>
      );
    case "QUEUED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
          <Clock size={11} /> QUEUED (QUIET)
        </span>
      );
    case "FAILED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 border border-red-200">
          <XCircle size={11} /> FAILED
        </span>
      );
  }
}

export default function NotificationsConsolePage() {
  const queryClient = useQueryClient();
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<NotificationStatus | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Test modal state
  const [showTestModal, setShowTestModal] = useState(false);
  const [testTemplateCode, setTestTemplateCode] = useState("ORDER_PLACED_SELLER");
  const [testChannel, setTestChannel] = useState<NotificationChannel>("WHATSAPP");
  const [testLang, setTestLang] = useState<NotificationLanguage>("en");
  const [testPhone, setTestPhone] = useState("+91 98220 12345");
  const [testName, setTestName] = useState("MahaAgro State Stockist");
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  // Queries
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications-list", selectedChannel, selectedStatus, selectedCategory, searchQuery],
    queryFn: () =>
      listNotifications({
        channel: selectedChannel,
        status: selectedStatus,
        category: selectedCategory,
        search: searchQuery,
      }),
  });

  const { data: metrics } = useQuery({
    queryKey: ["notifications-metrics"],
    queryFn: () => getNotificationMetrics(),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["notifications-templates"],
    queryFn: () => listNotificationTemplates(),
  });

  // Mutations
  const retryMutation = useMutation({
    mutationFn: (id: string) => retryNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-metrics"] });
    },
  });

  const sendTestMutation = useMutation({
    mutationFn: () =>
      sendTestNotification({
        template_code: testTemplateCode,
        channel: testChannel,
        language: testLang,
        recipient_phone: testPhone,
        recipient_name: testName,
        variables: {
          orderNo: "ORD-2609-000109",
          buyerName: "Sahyadri Agro Hub",
          amount: "1,45,000",
          otp: "542109",
          vehicleNo: "MH-14-GH-8812",
          driverName: "Sanjay Shinde",
          driverPhone: "+91 98231 00011",
          ewayBill: "241009849921",
        },
      }),
    onSuccess: () => {
      setTestFeedback("Notification successfully dispatched to gateway queue!");
      queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-metrics"] });
      setTimeout(() => {
        setShowTestModal(false);
        setTestFeedback(null);
      }, 1500);
    },
  });

  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "distributor"]}>
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <Bell size={20} />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                  Notifications & Alert Engine
                </h1>
              </div>
              <p className="mt-0.5 text-xs text-[#64766a]">
                Multi-channel dispatch logs (WhatsApp, DLT SMS, Push, In-App) and TRAI compliance engine.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/notifications/templates"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
              >
                <FileCode2 size={14} className="text-[#1b5e20]" /> DLT Templates
              </Link>
              <Link
                href="/admin/notifications/settings"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
              >
                <Settings size={14} className="text-[#64766a]" /> Gateway Settings
              </Link>
              <button
                type="button"
                onClick={() => setShowTestModal(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] transition-colors"
              >
                <Send size={14} /> Send Broadcast / Test Alert
              </button>
            </div>
          </div>

          {/* Metrics Banner */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase">
                Total Dispatches
              </span>
              <p className="mt-1 text-2xl font-black text-[#19392a]">
                {metrics?.total_dispatched ?? notifications.length}
              </p>
              <span className="text-[10px] text-[#64766a]">Across all 4 channels</span>
            </div>

            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase">
                Delivery Success
              </span>
              <p className="mt-1 text-2xl font-black text-emerald-700">
                {metrics?.delivered_percentage ?? 95}%
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Gateway Ack received</span>
            </div>

            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase">
                Failed / Retryable
              </span>
              <p className="mt-1 text-2xl font-black text-red-600">
                {metrics?.failed_count ?? 1}
              </p>
              <span className="text-[10px] text-red-600 font-medium">DLT / Telco errors</span>
            </div>

            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase">
                Unread In-App
              </span>
              <p className="mt-1 text-2xl font-black text-[#1b5e20]">
                {metrics?.unread_inbox_count ?? 1}
              </p>
              <span className="text-[10px] text-[#64766a]">Admin inbox queue</span>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#87958b] uppercase">
                  Quiet Hours
                </span>
                <Moon size={14} className={metrics?.is_quiet_hours_active ? "text-indigo-600" : "text-gray-400"} />
              </div>
              <p className="mt-1 text-sm font-bold text-[#19392a]">
                {metrics?.is_quiet_hours_active ? (
                  <span className="text-amber-700">ACTIVE (Queuing)</span>
                ) : (
                  <span className="text-emerald-700">NORMAL (Instant)</span>
                )}
              </p>
              <span className="text-[10px] text-[#64766a]">21:00 - 08:00 IST Policy</span>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="space-y-3 rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Channel Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 border-b lg:border-b-0 pb-2 lg:pb-0 border-[#eef2ef]">
                {(["ALL", "WHATSAPP", "SMS", "IN_APP", "PUSH"] as const).map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => setSelectedChannel(channel)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                      selectedChannel === channel
                        ? "bg-[#1b5e20] text-white shadow-xs"
                        : "bg-[#f1f5f1] text-[#64766a] hover:bg-[#e4ece5]"
                    }`}
                  >
                    {channel === "ALL" ? "All Channels" : channel}
                  </button>
                ))}
              </div>

              {/* Status & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-md border border-[#dce5dd] bg-white px-2.5 py-1.5 text-xs text-[#19392a] focus:outline-none focus:ring-1 focus:ring-[#1b5e20]"
                >
                  <option value="ALL">All Categories</option>
                  <option value="ORDERS">Orders</option>
                  <option value="DELIVERY">Delivery & OTP</option>
                  <option value="PAYMENTS">Payments & Credit</option>
                  <option value="CLAIMS">Claims & Returns</option>
                  <option value="STOCK">Stock Alerts</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="rounded-md border border-[#dce5dd] bg-white px-2.5 py-1.5 text-xs text-[#19392a] focus:outline-none focus:ring-1 focus:ring-[#1b5e20]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="SENT">Sent</option>
                  <option value="QUEUED">Queued</option>
                  <option value="FAILED">Failed</option>
                  <option value="READ">Read</option>
                </select>

                <div className="relative min-w-[200px]">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-[#87958b]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search phone, recipient, text..."
                    className="w-full rounded-md border border-[#dce5dd] pl-8 pr-3 py-1.5 text-xs text-[#19392a] placeholder-[#87958b] focus:outline-none focus:ring-1 focus:ring-[#1b5e20]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dispatch Logs Table */}
          <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#19392a]">
                  <tr>
                    <th className="px-4 py-3">Recipient & Contact</th>
                    <th className="px-3 py-3 text-center">Channel</th>
                    <th className="px-3 py-3">Category / Template</th>
                    <th className="px-4 py-3">Rendered Message Content</th>
                    <th className="px-3 py-3 text-center">DLT / Provider ID</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-right">Timestamp</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2ef]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-[#87958b]">
                        <div className="inline-block size-5 animate-spin rounded-full border-2 border-[#1b5e20] border-t-transparent" />
                        <p className="mt-2 font-medium">Loading notification logs...</p>
                      </td>
                    </tr>
                  ) : notifications.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-[#87958b]">
                        No notification records match the specified filters.
                      </td>
                    </tr>
                  ) : (
                    notifications.map((item) => (
                      <tr key={item.id} className="hover:bg-[#fafbfa]">
                        {/* Recipient */}
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-[#19392a]">{item.recipient_name}</p>
                          <p className="font-mono text-[11px] text-[#64766a]">{item.recipient_phone}</p>
                          <span className="text-[10px] uppercase font-semibold text-[#87958b]">
                            {item.recipient_role}
                          </span>
                        </td>

                        {/* Channel */}
                        <td className="px-3 py-3.5 text-center">
                          {getChannelBadge(item.channel)}
                        </td>

                        {/* Category / Template */}
                        <td className="px-3 py-3.5">
                          <span className="rounded bg-[#f1f5f1] px-1.5 py-0.5 text-[10px] font-bold text-[#19392a]">
                            {item.category}
                          </span>
                          <p className="font-mono text-[11px] text-[#87958b] mt-1">
                            {item.template_code}
                          </p>
                        </td>

                        {/* Message Preview */}
                        <td className="px-4 py-3.5 max-w-sm">
                          <p className="font-semibold text-[#19392a]">{item.title}</p>
                          <p className="mt-0.5 text-[11px] text-[#64766a] line-clamp-2">
                            {item.body}
                          </p>
                          {item.failed_reason && (
                            <p className="mt-1 text-[11px] font-medium text-red-600 bg-red-50 p-1.5 rounded border border-red-200">
                              Error: {item.failed_reason}
                            </p>
                          )}
                          {item.payload?.actionUrl && (
                            <Link
                              href={item.payload.actionUrl}
                              className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#1b5e20] hover:underline"
                            >
                              Deep Link <ExternalLink size={10} />
                            </Link>
                          )}
                        </td>

                        {/* DLT / Provider ID */}
                        <td className="px-3 py-3.5 text-center font-mono text-[11px] text-[#64766a]">
                          {item.dlt_template_id ? (
                            <div>
                              <span className="text-[9px] text-gray-400 block uppercase">DLT ID</span>
                              {item.dlt_template_id}
                            </div>
                          ) : item.provider_message_id ? (
                            <div>
                              <span className="text-[9px] text-gray-400 block uppercase">GATEWAY</span>
                              {item.provider_message_id}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3.5 text-center">
                          {getStatusBadge(item.status)}
                          {item.retry_count > 0 && (
                            <p className="mt-0.5 text-[10px] text-[#87958b]">
                              Retry #{item.retry_count}
                            </p>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="px-3 py-3.5 text-right font-mono text-[11px] text-[#64766a]">
                          <p>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-[10px] text-[#87958b]">{new Date(item.created_at).toLocaleDateString()}</p>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5 text-center">
                          {item.status === "FAILED" ? (
                            <button
                              type="button"
                              onClick={() => retryMutation.mutate(item.id)}
                              disabled={retryMutation.isPending}
                              className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-red-700 transition-colors"
                            >
                              <RotateCcw size={11} /> Retry
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal: Send Test Notification */}
        {showTestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#1b5e20]/10 p-1 text-[#1b5e20]">
                    <Send size={18} />
                  </span>
                  <h3 className="text-base font-bold text-[#19392a]">
                    Send Test Alert / Notification
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              {testFeedback && (
                <div className="rounded-md bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-semibold text-emerald-800">
                  {testFeedback}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#19392a] mb-1">
                    Select Event Template:
                  </label>
                  <select
                    value={testTemplateCode}
                    onChange={(e) => setTestTemplateCode(e.target.value)}
                    className="w-full rounded-md border border-[#dce5dd] p-2 text-xs text-[#19392a]"
                  >
                    {templates.map((tpl) => (
                      <option key={`${tpl.code}-${tpl.language}`} value={tpl.code}>
                        [{tpl.channel}] {tpl.name} ({tpl.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#19392a] mb-1">
                      Dispatch Channel:
                    </label>
                    <select
                      value={testChannel}
                      onChange={(e) => setTestChannel(e.target.value as any)}
                      className="w-full rounded-md border border-[#dce5dd] p-2 text-xs text-[#19392a]"
                    >
                      <option value="WHATSAPP">WhatsApp (Meta BSP)</option>
                      <option value="SMS">DLT SMS (Telecom)</option>
                      <option value="IN_APP">In-App Web Alert</option>
                      <option value="PUSH">FCM Mobile Push</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#19392a] mb-1">
                      Language:
                    </label>
                    <select
                      value={testLang}
                      onChange={(e) => setTestLang(e.target.value as any)}
                      className="w-full rounded-md border border-[#dce5dd] p-2 text-xs text-[#19392a]"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी (Hindi)</option>
                      <option value="mr">मराठी (Marathi)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#19392a] mb-1">
                    Recipient Mobile Number (E.164 format):
                  </label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+91 98220 12345"
                    className="w-full rounded-md border border-[#dce5dd] p-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#19392a] mb-1">
                    Recipient Name:
                  </label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="MahaAgro State Stockist"
                    className="w-full rounded-md border border-[#dce5dd] p-2 text-xs"
                  />
                </div>

                <div className="rounded-md bg-[#f8faf8] border border-[#eef2ef] p-2.5 text-[11px] text-[#64766a]">
                  <p className="font-semibold text-[#19392a]">Live Simulator Context:</p>
                  <p>Injected mock PO #ORD-2609-000109, OTP 542109, Vehicle MH-14-GH-8812.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#eef2ef] pt-3">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="rounded-md border border-[#dce5dd] px-3.5 py-1.5 text-xs font-semibold text-[#64766a] hover:bg-[#f1f5f1]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => sendTestMutation.mutate()}
                  disabled={sendTestMutation.isPending}
                  className="rounded-md bg-[#1b5e20] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50"
                >
                  {sendTestMutation.isPending ? "Transmitting..." : "Send Test Broadcast"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminShell>
    </RoleGuard>
  );
}
