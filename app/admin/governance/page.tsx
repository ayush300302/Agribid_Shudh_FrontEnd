"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  Filter,
  Layers,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import {
  decideChangeRequest,
  listChangeRequests,
} from "@/lib/admin-console-api";
import type {
  ChangeRequest,
  ChangeRequestEntityType,
  ChangeRequestStatus,
} from "@/types/admin-console";

function getEntityBadge(type: ChangeRequestEntityType) {
  switch (type) {
    case "PRICE_LIST":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "CREDIT_LIMIT":
      return "bg-purple-50 text-purple-800 border-purple-200";
    case "TRADE_SCHEME":
      return "bg-blue-50 text-blue-800 border-blue-200";
    case "PARTNER_ONBOARDING":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "GST_RATE_OVERRIDE":
      return "bg-rose-50 text-rose-800 border-rose-200";
    default:
      return "bg-gray-50 text-gray-800 border-gray-200";
  }
}

function getStatusBadge(status: ChangeRequestStatus) {
  switch (status) {
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 animate-pulse">
          <Clock size={11} /> PENDING REVIEW
        </span>
      );
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
          <CheckCircle2 size={11} /> APPROVED
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-800 border border-red-200">
          <XCircle size={11} /> REJECTED
        </span>
      );
  }
}

export default function GovernancePage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<ChangeRequestStatus | "ALL">("ALL");
  const [selectedEntity, setSelectedEntity] = useState<ChangeRequestEntityType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Review modal
  const [activeReviewRequest, setActiveReviewRequest] = useState<ChangeRequest | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Queries
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["change-requests", selectedStatus, selectedEntity, searchQuery],
    queryFn: () =>
      listChangeRequests({
        status: selectedStatus,
        entity_type: selectedEntity,
        search: searchQuery,
      }),
  });

  // Decision Mutation
  const decisionMutation = useMutation({
    mutationFn: (action: "APPROVE" | "REJECT") => {
      if (!activeReviewRequest) throw new Error("No request selected");
      if (!reviewComments.trim()) {
        throw new Error("Mandatory checker review comment is required");
      }
      return decideChangeRequest(activeReviewRequest.id, {
        action,
        comments: reviewComments,
      });
    },
    onSuccess: () => {
      setActiveReviewRequest(null);
      setReviewComments("");
      setReviewError(null);
      queryClient.invalidateQueries({ queryKey: ["change-requests"] });
    },
    onError: (err: any) => {
      setReviewError(err.message || "Failed to submit decision");
    },
  });

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <RoleGuard allowedRoles={["admin", "ADM_SUPER", "state_stockist"]}>
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <FileCheck2 size={20} />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                  Maker-Checker Governance Desk
                </h1>
              </div>
              <p className="mt-0.5 text-xs text-[#64766a]">
                Section 10.6 & Rule M15.3 four-eyes governance: independent dual-authorization for price lists, schemes, and credit caps.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/operations"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
              >
                <Server size={14} className="text-[#1b5e20]" /> Platform Operations & Health →
              </Link>
            </div>
          </div>

          {/* Rule M15.3 Banner */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={20} className="text-indigo-700 shrink-0" />
              <div>
                <p className="font-bold text-indigo-950">
                  Four-Eyes Governance Policy Enforced (Rule M15.3)
                </p>
                <p className="text-indigo-800 text-[11px] mt-0.5">
                  The admin who creates a change request (Maker) cannot approve it. A different verified admin (Checker) must review and authorize.
                </p>
              </div>
            </div>
            <span className="rounded-md bg-white border border-indigo-200 px-3 py-1 font-mono font-bold text-indigo-900 shrink-0 text-center">
              {pendingCount} Pending Approvals
            </span>
          </div>

          {/* Filters & Search */}
          <div className="space-y-3 rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Status pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                      selectedStatus === st
                        ? "bg-[#1b5e20] text-white shadow-xs"
                        : "bg-[#f1f5f1] text-[#64766a] hover:bg-[#e4ece5]"
                    }`}
                  >
                    {st === "ALL" ? "All Change Requests" : st}
                  </button>
                ))}
              </div>

              {/* Entity & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value as any)}
                  className="rounded-md border border-[#dce5dd] bg-white px-2.5 py-1.5 text-xs text-[#19392a] focus:ring-1 focus:ring-[#1b5e20]"
                >
                  <option value="ALL">All Entity Types</option>
                  <option value="PRICE_LIST">Price Lists</option>
                  <option value="CREDIT_LIMIT">Credit Caps</option>
                  <option value="TRADE_SCHEME">Trade Schemes</option>
                  <option value="PARTNER_ONBOARDING">Partner Onboarding</option>
                </select>

                <div className="relative min-w-[200px]">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-[#87958b]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search request #, title, maker..."
                    className="w-full rounded-md border border-[#dce5dd] pl-8 pr-3 py-1.5 text-xs text-[#19392a] placeholder-[#87958b] focus:outline-none focus:ring-1 focus:ring-[#1b5e20]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Change Requests Queue Table */}
          <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#19392a]">
                  <tr>
                    <th className="px-4 py-3">Request Ref</th>
                    <th className="px-3 py-3">Entity Type</th>
                    <th className="px-4 py-3">Title & Summary</th>
                    <th className="px-4 py-3">Maker (Author)</th>
                    <th className="px-4 py-3">Checker (Auditor)</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2ef]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-[#87958b]">
                        Loading change requests...
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-[#87958b]">
                        No change requests match the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    requests.map((cr) => (
                      <tr key={cr.id} className="hover:bg-[#fafbfa]">
                        {/* Ref */}
                        <td className="px-4 py-3.5 font-mono font-bold text-[#1b5e20]">
                          {cr.request_number}
                          <p className="font-sans text-[10px] text-[#87958b] font-normal">
                            {new Date(cr.created_at).toLocaleDateString()}
                          </p>
                        </td>

                        {/* Entity */}
                        <td className="px-3 py-3.5">
                          <span
                            className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${getEntityBadge(
                              cr.entity_type,
                            )}`}
                          >
                            {cr.entity_type.replace("_", " ")}
                          </span>
                        </td>

                        {/* Title */}
                        <td className="px-4 py-3.5 max-w-xs">
                          <p className="font-bold text-[#19392a]">{cr.entity_title}</p>
                          <p className="mt-0.5 text-[11px] text-[#64766a] line-clamp-2">
                            {cr.description}
                          </p>
                          {cr.comments && (
                            <p className="mt-1 text-[10px] text-gray-500 italic bg-gray-50 p-1 rounded">
                              Checker Note: "{cr.comments}"
                            </p>
                          )}
                        </td>

                        {/* Maker */}
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-[#19392a]">{cr.maker_name}</p>
                          <span className="font-mono text-[10px] text-[#87958b]">
                            {cr.maker_role}
                          </span>
                        </td>

                        {/* Checker */}
                        <td className="px-4 py-3.5">
                          {cr.checker_name ? (
                            <div>
                              <p className="font-semibold text-[#19392a]">{cr.checker_name}</p>
                              <span className="font-mono text-[10px] text-[#87958b]">
                                {cr.checker_role}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#87958b] italic">Pending audit</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3.5 text-center">
                          {getStatusBadge(cr.status)}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReviewRequest(cr);
                              setReviewComments(cr.comments || "");
                              setReviewError(null);
                            }}
                            className={`rounded-md px-3 py-1 text-xs font-semibold shadow-xs transition-colors ${
                              cr.status === "PENDING"
                                ? "bg-[#1b5e20] text-white hover:bg-[#154a19]"
                                : "border border-[#dce5dd] bg-white text-[#19392a] hover:bg-[#f1f5f1]"
                            }`}
                          >
                            {cr.status === "PENDING" ? "Review & Decide" : "Inspect Diff"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal: Review & Decide Change Request */}
        {activeReviewRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-[#1b5e20]">
                    {activeReviewRequest.request_number} · {activeReviewRequest.entity_type}
                  </span>
                  <h3 className="text-base font-bold text-[#19392a]">
                    {activeReviewRequest.entity_title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReviewRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              {reviewError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-2.5 text-xs font-semibold text-red-800 flex items-center gap-1.5">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* Maker vs Checker Info */}
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#f8faf8] border border-[#eef2ef] p-3 text-xs">
                <div>
                  <span className="text-[#87958b] block font-medium">Proposed by (Maker):</span>
                  <p className="font-bold text-[#19392a]">{activeReviewRequest.maker_name}</p>
                  <span className="font-mono text-[11px] text-[#64766a]">
                    Role: {activeReviewRequest.maker_role}
                  </span>
                </div>
                <div>
                  <span className="text-[#87958b] block font-medium">Authorizing Admin (Checker):</span>
                  <p className="font-bold text-[#19392a]">Ayush Patil (You)</p>
                  <span className="font-mono text-[11px] text-[#1b5e20]">Role: ADM_SUPER</span>
                </div>
              </div>

              {/* Payload Diff (Before vs. After) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#19392a]">Payload Delta (Before vs. Proposed):</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Before */}
                  <div className="rounded-lg border border-red-200 bg-red-50/40 p-3">
                    <span className="font-mono text-[10px] font-bold uppercase text-red-700 block mb-1">
                      Current State (Before)
                    </span>
                    <pre className="font-mono text-[11px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(activeReviewRequest.payload_before, null, 2)}
                    </pre>
                  </div>

                  {/* After */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                    <span className="font-mono text-[10px] font-bold uppercase text-emerald-700 block mb-1">
                      Proposed State (After)
                    </span>
                    <pre className="font-mono text-[11px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(activeReviewRequest.payload_after, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Review Comments Textarea */}
              {activeReviewRequest.status === "PENDING" && (
                <div className="space-y-1 text-xs">
                  <label className="block font-semibold text-[#19392a]">
                    Mandatory Audit Comments (Rule M15.3):
                  </label>
                  <textarea
                    rows={2}
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Provide justification or rejection reason for permanent audit trail..."
                    className="w-full rounded-md border border-[#dce5dd] p-2 text-xs focus:ring-1 focus:ring-[#1b5e20]"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-[#eef2ef] pt-3">
                <span className="text-[11px] text-[#87958b]">
                  Status: <strong>{activeReviewRequest.status}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveReviewRequest(null)}
                    className="rounded-md border border-[#dce5dd] px-3.5 py-1.5 text-xs font-semibold text-[#64766a] hover:bg-[#f1f5f1]"
                  >
                    Close
                  </button>

                  {activeReviewRequest.status === "PENDING" && (
                    <>
                      <button
                        type="button"
                        onClick={() => decisionMutation.mutate("REJECT")}
                        disabled={decisionMutation.isPending}
                        className="rounded-md bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject Change
                      </button>

                      <button
                        type="button"
                        onClick={() => decisionMutation.mutate("APPROVE")}
                        disabled={decisionMutation.isPending}
                        className="rounded-md bg-[#1b5e20] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50"
                      >
                        Approve & Apply
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminShell>
    </RoleGuard>
  );
}
