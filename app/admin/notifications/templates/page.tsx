"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCode2,
  Globe,
  Plus,
  Radio,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import {
  listNotificationTemplates,
  saveNotificationTemplate,
  sendTestNotification,
} from "@/lib/notification-api";
import type {
  NotificationChannel,
  NotificationLanguage,
  NotificationTemplate,
} from "@/types/notification";

function getChannelBadge(channel: NotificationChannel) {
  switch (channel) {
    case "WHATSAPP":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
          WhatsApp
        </span>
      );
    case "SMS":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
          <Smartphone size={10} /> DLT SMS
        </span>
      );
    case "PUSH":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200">
          <Radio size={10} /> FCM Push
        </span>
      );
    case "IN_APP":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#1b5e20]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1b5e20] border border-[#1b5e20]/20">
          In-App
        </span>
      );
  }
}

export default function NotificationTemplatesPage() {
  const queryClient = useQueryClient();
  const [selectedLang, setSelectedLang] = useState<NotificationLanguage | "ALL">("ALL");
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Test modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<NotificationTemplate | null>(null);
  const [testPhone, setTestPhone] = useState("+91 98220 12345");
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  // Queries
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["notifications-templates"],
    queryFn: () => listNotificationTemplates(),
  });

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    if (selectedLang !== "ALL" && t.language !== selectedLang) return false;
    if (selectedChannel !== "ALL" && t.channel !== selectedChannel) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCode = t.code.toLowerCase().includes(q);
      const matchName = t.name.toLowerCase().includes(q);
      const matchBody = t.body.toLowerCase().includes(q);
      const matchDlt = t.dlt_template_id?.includes(q) || false;
      return matchCode || matchName || matchBody || matchDlt;
    }
    return true;
  });

  // Test mutation
  const testMutation = useMutation({
    mutationFn: () => {
      if (!activeTemplate) throw new Error("No template selected");
      return sendTestNotification({
        template_code: activeTemplate.code,
        channel: activeTemplate.channel,
        language: activeTemplate.language,
        recipient_phone: testPhone,
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
      });
    },
    onSuccess: () => {
      setTestSuccess("Test notification delivered to queue successfully!");
      queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
      setTimeout(() => {
        setShowTestModal(false);
        setTestSuccess(null);
      }, 1500);
    },
  });

  const openTestFor = (template: NotificationTemplate) => {
    setActiveTemplate(template);
    setShowTestModal(true);
  };

  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "distributor"]}>
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Link
              href="/admin/notifications"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64766a] transition-colors hover:text-[#1b5e20]"
            >
              <ArrowLeft size={14} /> Back to Notification Logs
            </Link>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-50 p-1.5 text-blue-700">
                    <FileCode2 size={20} />
                  </span>
                  <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                    DLT & Messaging Templates
                  </h1>
                </div>
                <p className="mt-0.5 text-xs text-[#64766a]">
                  TRAI DLT registered SMS templates, Meta WhatsApp HSM templates, and localization catalogue.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  <ShieldCheck size={14} /> TRAI DLT Compliant
                </span>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
            {/* Language filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-[#87958b] mr-1 flex items-center gap-1">
                <Globe size={13} /> Lang:
              </span>
              {(["ALL", "en", "hi", "mr"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLang(lang)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedLang === lang
                      ? "bg-[#1b5e20] text-white shadow-xs"
                      : "bg-[#f1f5f1] text-[#64766a] hover:bg-[#e4ece5]"
                  }`}
                >
                  {lang === "ALL" ? "All Languages" : lang === "en" ? "English (en)" : lang === "hi" ? "हिंदी (hi)" : "मराठी (mr)"}
                </button>
              ))}
            </div>

            {/* Channel and Search */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value as any)}
                className="rounded-md border border-[#dce5dd] bg-white px-2.5 py-1.5 text-xs text-[#19392a] focus:ring-1 focus:ring-[#1b5e20]"
              >
                <option value="ALL">All Channels</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="SMS">DLT SMS</option>
                <option value="IN_APP">In-App</option>
                <option value="PUSH">FCM Push</option>
              </select>

              <div className="relative min-w-[220px]">
                <Search size={14} className="absolute left-2.5 top-2.5 text-[#87958b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search template name, DLT ID..."
                  className="w-full rounded-md border border-[#dce5dd] pl-8 pr-3 py-1.5 text-xs text-[#19392a] placeholder-[#87958b] focus:outline-none focus:ring-1 focus:ring-[#1b5e20]"
                />
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-3 py-16 text-center text-xs text-[#87958b]">
                Loading templates catalog...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="col-span-3 py-16 text-center text-xs text-[#87958b]">
                No templates matched the filters.
              </div>
            ) : (
              filteredTemplates.map((tpl) => (
                <div
                  key={`${tpl.code}-${tpl.language}`}
                  className="flex flex-col justify-between rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs hover:border-[#b4c9b6] transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-[#87958b] uppercase tracking-wider">
                          {tpl.code}
                        </span>
                        <h3 className="text-sm font-bold text-[#19392a] mt-0.5">{tpl.name}</h3>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getChannelBadge(tpl.channel)}
                        <span className="rounded bg-[#f1f5f1] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-[#64766a]">
                          {tpl.language}
                        </span>
                      </div>
                    </div>

                    {/* DLT / WA identifiers */}
                    {tpl.dlt_template_id && (
                      <div className="rounded bg-blue-50/60 border border-blue-100 p-1.5 text-[10px] text-blue-900 font-mono">
                        <span className="text-[#87958b] font-sans font-medium">TRAI DLT ID:</span> {tpl.dlt_template_id}
                      </div>
                    )}
                    {tpl.wa_template_name && (
                      <div className="rounded bg-emerald-50/60 border border-emerald-100 p-1.5 text-[10px] text-emerald-900 font-mono">
                        <span className="text-[#87958b] font-sans font-medium">Meta Template:</span> {tpl.wa_template_name}
                      </div>
                    )}

                    {/* Body Template */}
                    <div className="rounded-lg border border-[#eef2ef] bg-[#f8faf8] p-3">
                      <p className="text-[11px] font-semibold text-[#19392a] mb-1">{tpl.title}</p>
                      <p className="text-xs text-[#64766a] leading-relaxed break-words">{tpl.body}</p>
                    </div>

                    {/* Variables */}
                    {tpl.variables?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold text-[#87958b] uppercase">Placeholders:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {tpl.variables.map((v) => (
                            <span
                              key={v}
                              className="rounded bg-white border border-[#dce5dd] px-1.5 py-0.5 font-mono text-[10px] text-[#1b5e20]"
                            >
                              {`{{${v}}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-[#eef2ef] flex items-center justify-between">
                    <span className="text-[10px] text-[#87958b]">
                      {tpl.transactional ? "⚡ Transactional" : "Promotional"}
                    </span>
                    <button
                      type="button"
                      onClick={() => openTestFor(tpl)}
                      className="inline-flex items-center gap-1 rounded-md bg-[#1b5e20] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] transition-colors"
                    >
                      <Send size={11} /> Test Send
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal: Test Send for Template */}
        {showTestModal && activeTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#1b5e20]/10 p-1 text-[#1b5e20]">
                    <Send size={16} />
                  </span>
                  <h3 className="text-sm font-bold text-[#19392a]">
                    Test Send: {activeTemplate.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>

              {testSuccess && (
                <div className="rounded-md bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-semibold text-emerald-800">
                  {testSuccess}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#87958b] block mb-1">Target Channel & Language:</span>
                  <div className="flex items-center gap-2">
                    {getChannelBadge(activeTemplate.channel)}
                    <span className="font-mono text-xs uppercase font-bold text-[#19392a]">
                      [{activeTemplate.language}]
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#19392a] mb-1">
                    Send to Mobile Phone:
                  </label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full rounded-md border border-[#dce5dd] p-2 font-mono text-xs text-[#19392a]"
                  />
                </div>

                <div className="rounded-md bg-[#f8faf8] border border-[#eef2ef] p-3 text-[11px] space-y-1">
                  <p className="font-semibold text-[#19392a]">Rendered Preview:</p>
                  <p className="text-[#64766a]">
                    Simulating variables: <code className="text-[#1b5e20]">orderNo = ORD-2609-000109</code>, <code className="text-[#1b5e20]">amount = 1,45,000</code>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#eef2ef] pt-3">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="rounded-md border border-[#dce5dd] px-3 py-1.5 text-xs font-semibold text-[#64766a] hover:bg-[#f1f5f1]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => testMutation.mutate()}
                  disabled={testMutation.isPending}
                  className="rounded-md bg-[#1b5e20] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50"
                >
                  {testMutation.isPending ? "Transmitting..." : "Send Test Now"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminShell>
    </RoleGuard>
  );
}
