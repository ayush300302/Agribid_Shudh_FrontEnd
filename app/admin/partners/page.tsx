"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import {RoleGuard} from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import { listPartners } from "@/lib/partner-api";
import type { KYCStatus, Partner, PartnerStatus, PartnerType } from "@/types/partner";

const TIERS: { label: string; value: string }[] = [
  { label: "All Tiers", value: "all" },
  { label: "State Stockists", value: "state_stockist" },
  { label: "Distributors", value: "distributor" },
  { label: "Sub-Distributors", value: "sub_distributor" },
  { label: "Retailers", value: "retailer" },
  { label: "Manufacturers", value: "manufacturer" },
];

function getTierBadge(type: PartnerType) {
  switch (type) {
    case "state_stockist":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "distributor":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "sub_distributor":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "retailer":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "manufacturer":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getKycBadge(status: KYCStatus) {
  switch (status) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} /> Approved
        </span>
      );
    case "submitted":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
          <Clock size={12} /> Pending Review
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 border border-red-200">
          <XCircle size={12} /> Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 border border-gray-200">
          Not Submitted
        </span>
      );
  }
}

function getStatusBadge(status: PartnerStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "blocked":
      return "bg-red-50 text-red-700 border-red-200";
    case "suspended":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

export default function PartnersDirectoryPage() {
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["partners", selectedTier],
    queryFn: () => listPartners({ type: selectedTier }),
  });

  const partners: Partner[] = data?.partners || [];

  // Filter client-side for search query and status filter
  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      searchQuery === "" ||
      partner.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (partner.gstin && partner.gstin.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || partner.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <RoleGuard
      allowedRoles={[
        "ADM_SUPER",
        "ADM_SALES_OPS",
        "ADM_STATE_MGR",
        "ADM_SUPPORT",
        "ADM_FINANCE",
      ]}
    >
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <Building2 size={20} />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                  Partner Directory
                </h1>
              </div>
              <p className="mt-1 text-sm text-[#64766a]">
                Manage supply chain partners, track KYC compliance, and inspect hierarchy mappings.
              </p>
            </div>

            <Link
              href="/admin/partners/new"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1b5e20] px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#154a19] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b5e20]"
            >
              <Plus size={16} />
              Add Partner
            </Link>
          </div>

          {/* Tier Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#dce5dd] pb-3">
            {TIERS.map((tier) => (
              <button
                key={tier.value}
                onClick={() => setSelectedTier(tier.value)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  selectedTier === tier.value
                    ? "bg-[#1b5e20] text-white shadow-xs"
                    : "bg-white text-[#64766a] border border-[#dce5dd] hover:bg-[#f1f5f1] hover:text-[#19392a]"
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>

          {/* Search & Secondary Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#87958b]"
              />
              <input
                type="text"
                placeholder="Search by Code, Name, or GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-md border border-[#cbd8ce] bg-white pl-9 pr-4 text-sm text-[#19392a] outline-none transition-colors placeholder:text-[#87958b] focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#64766a]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="blocked">Blocked</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-lg border border-[#dce5dd] bg-white shadow-xs">
            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3">
                <div className="size-8 animate-spin rounded-full border-3 border-[#1b5e20] border-t-transparent" />
                <p className="text-sm text-[#64766a]">Loading partners...</p>
              </div>
            ) : isError ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-center p-6">
                <ShieldAlert size={32} className="text-[#842029]" />
                <p className="font-semibold text-[#842029]">Failed to load partners</p>
                <p className="text-xs text-[#64766a]">{(error as Error)?.message}</p>
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 p-6 text-center">
                <Building2 size={36} className="text-[#cbd8ce]" />
                <p className="text-sm font-semibold text-[#19392a]">No partners found</p>
                <p className="text-xs text-[#64766a]">
                  Try adjusting your search criteria or tier filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#dce5dd] bg-[#f9fbf9] text-xs font-semibold uppercase tracking-wider text-[#64766a]">
                    <tr>
                      <th className="px-5 py-3.5">Partner</th>
                      <th className="px-5 py-3.5">Tier</th>
                      <th className="px-5 py-3.5">Location / Tax</th>
                      <th className="px-5 py-3.5">Parent Entity</th>
                      <th className="px-5 py-3.5">KYC Compliance</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8eee9]">
                    {filteredPartners.map((partner) => (
                      <tr
                        key={partner.id}
                        className="transition-colors hover:bg-[#f9fbf9]"
                      >
                        {/* Partner Name & Code */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-[#19392a]">
                              {partner.business_name}
                            </p>
                            {partner.trade_name ? (
                              <p className="text-xs text-[#64766a]">
                                {partner.trade_name}
                              </p>
                            ) : null}
                            <span className="mt-1 inline-block font-mono text-[11px] font-medium text-[#1b5e20]">
                              {partner.code}
                            </span>
                          </div>
                        </td>

                        {/* Tier Badge */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${getTierBadge(
                              partner.type,
                            )}`}
                          >
                            {partner.type.replace("_", " ")}
                          </span>
                        </td>

                        {/* Location / Tax */}
                        <td className="px-5 py-4 text-xs">
                          <p className="font-medium text-[#19392a]">
                            {partner.address?.city}, {partner.address?.state}
                          </p>
                          <p className="font-mono text-[11px] text-[#64766a]">
                            GST: {partner.gstin || "—"}
                          </p>
                        </td>

                        {/* Parent Partner */}
                        <td className="px-5 py-4 text-xs">
                          {partner.parent_name ? (
                            <span className="font-medium text-[#31483a]">
                              {partner.parent_name}
                            </span>
                          ) : (
                            <span className="text-[#87958b] italic">Root / Manufacturer</span>
                          )}
                        </td>

                        {/* KYC Status */}
                        <td className="px-5 py-4">{getKycBadge(partner.kyc_status)}</td>

                        {/* Partner Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${getStatusBadge(
                              partner.status,
                            )}`}
                          >
                            {partner.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {partner.kyc_status === "submitted" ? (
                              <Link
                                href={`/admin/partners/${partner.id}?tab=kyc`}
                                className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-amber-600 transition-colors"
                              >
                                Review KYC
                              </Link>
                            ) : null}

                            <Link
                              href={`/admin/partners/${partner.id}`}
                              className="rounded-md border border-[#cbd8ce] bg-white px-2.5 py-1 text-xs font-medium text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
                            >
                              View 360
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminShell>
    </RoleGuard>
  );
}