"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  IndianRupee,
  Layers,
  Package,
  Percent,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import { listPriceLists, listSchemes, setSchemeStatus } from "@/lib/pricing-api";
import type { PriceListStatus, Scheme, SchemeStatus } from "@/types/pricing";

function getPriceListBadge(status: PriceListStatus) {
  switch (status) {
    case "published":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending_approval":
      return "bg-amber-50 text-amber-700 border-amber-200 animate-pulse";
    case "draft":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "archived":
      return "bg-gray-50 text-gray-700 border-gray-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function getTierBadge(tier: string) {
  switch (tier) {
    case "state_stockist":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "distributor":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "sub_distributor":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "retailer":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function formatTierName(tier: string) {
  return tier
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function PricingConsolePage() {
  const [activeTab, setActiveTab] = useState<"price_lists" | "schemes">("price_lists");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [schemeStatusFilter, setSchemeStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const priceListsQuery = useQuery({
    queryKey: ["admin-price-lists", selectedState, selectedTier, selectedStatus],
    queryFn: () =>
      listPriceLists({
        state_code: selectedState,
        tier: selectedTier,
        status: selectedStatus,
      }),
  });

  const schemesQuery = useQuery({
    queryKey: ["admin-schemes", schemeStatusFilter],
    queryFn: () => listSchemes({ status: schemeStatusFilter }),
  });

  const priceLists = priceListsQuery.data || [];
  const schemes = schemesQuery.data || [];

  // Filter schemes client-side
  const filteredSchemes = schemes.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      q === "" ||
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    );
  });

  async function handleToggleScheme(scheme: Scheme) {
    const newStatus: SchemeStatus = scheme.status === "active" ? "paused" : "active";
    try {
      await setSchemeStatus(scheme.id, newStatus);
      schemesQuery.refetch();
    } catch {
      alert("Failed to update scheme status");
    }
  }

  return (
    <RoleGuard
      allowedRoles={[
        "ADM_SUPER",
        "ADM_FINANCE",
        "ADM_SALES_OPS",
        "ADM_STATE_MGR",
      ]}
    >
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <IndianRupee size={20} />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                  Pricing Rules & Schemes
                </h1>
              </div>
              <p className="mt-1 text-sm text-[#64766a]">
                Manage state-wise tier wholesale margins, maker-checker approval workflows, and trade promotional schemes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/pricing/pl-003"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
              >
                <Clock size={14} className="text-amber-600" />
                Review Pending (Gujarat v2)
              </Link>
            </div>
          </div>

          {/* Master Tabs */}
          <div className="flex border-b border-[#dce5dd]">
            <button
              onClick={() => setActiveTab("price_lists")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === "price_lists"
                  ? "border-[#1b5e20] text-[#1b5e20]"
                  : "border-transparent text-[#64766a] hover:text-[#19392a]"
              }`}
            >
              <Layers size={16} />
              State Price Lists
              <span className="rounded-full bg-[#e9f1e9] px-2 py-0.5 text-xs font-bold text-[#1b5e20]">
                {priceLists.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("schemes")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === "schemes"
                  ? "border-[#1b5e20] text-[#1b5e20]"
                  : "border-transparent text-[#64766a] hover:text-[#19392a]"
              }`}
            >
              <Percent size={16} />
              Trade Schemes & Offers
              <span className="rounded-full bg-[#e9f1e9] px-2 py-0.5 text-xs font-bold text-[#1b5e20]">
                {schemes.length}
              </span>
            </button>
          </div>

          {/* TAB 1: State Price Lists */}
          {activeTab === "price_lists" ? (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col gap-3 rounded-lg border border-[#dce5dd] bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#64766a]">
                    <Filter size={14} /> State:
                  </div>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="h-9 rounded-md border border-[#cbd8ce] bg-white px-3 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                  >
                    <option value="all">All States</option>
                    <option value="27">Maharashtra (27)</option>
                    <option value="24">Gujarat (24)</option>
                    <option value="23">Madhya Pradesh (23)</option>
                  </select>

                  <div className="flex items-center gap-2 text-xs font-semibold text-[#64766a]">
                    Tier:
                  </div>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="h-9 rounded-md border border-[#cbd8ce] bg-white px-3 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                  >
                    <option value="all">All Tiers</option>
                    <option value="state_stockist">State Stockist</option>
                    <option value="distributor">Distributor</option>
                    <option value="retailer">Retailer</option>
                  </select>

                  <div className="flex items-center gap-2 text-xs font-semibold text-[#64766a]">
                    Status:
                  </div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="h-9 rounded-md border border-[#cbd8ce] bg-white px-3 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="text-xs text-[#64766a]">
                  Showing <span className="font-semibold text-[#19392a]">{priceLists.length}</span> price lists
                </div>
              </div>

              {/* Price Lists Table */}
              <div className="overflow-hidden rounded-lg border border-[#dce5dd] bg-white shadow-xs">
                {priceListsQuery.isLoading ? (
                  <div className="flex h-64 flex-col items-center justify-center gap-3">
                    <div className="size-8 animate-spin rounded-full border-3 border-[#1b5e20] border-t-transparent" />
                    <p className="text-sm text-[#64766a]">Loading state price lists...</p>
                  </div>
                ) : priceLists.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center gap-2 p-6 text-center">
                    <IndianRupee size={36} className="text-[#cbd8ce]" />
                    <p className="text-sm font-semibold text-[#19392a]">No price lists found</p>
                    <p className="text-xs text-[#64766a]">
                      No price lists match the selected State and Tier filter.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-[#dce5dd] bg-[#f9fbf9] text-xs font-semibold uppercase tracking-wider text-[#64766a]">
                        <tr>
                          <th className="px-5 py-3.5">State & Region</th>
                          <th className="px-5 py-3.5">Buyer Tier</th>
                          <th className="px-5 py-3.5">Version</th>
                          <th className="px-5 py-3.5">Effective Window</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5">Maker / Checker Audit</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e8eee9]">
                        {priceLists.map((pl) => (
                          <tr key={pl.id} className="transition-colors hover:bg-[#f9fbf9]">
                            {/* State */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#1b5e20] bg-[#e9f1e9] px-2 py-0.5 rounded">
                                  State {pl.state_code}
                                </span>
                                <span className="font-semibold text-[#19392a]">
                                  {pl.state_name}
                                </span>
                              </div>
                            </td>

                            {/* Tier */}
                            <td className="px-5 py-4">
                              <span
                                className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getTierBadge(
                                  pl.tier,
                                )}`}
                              >
                                {formatTierName(pl.tier)}
                              </span>
                            </td>

                            {/* Version */}
                            <td className="px-5 py-4">
                              <span className="font-mono text-xs font-bold text-[#19392a]">
                                v{pl.version}.0
                              </span>
                              <span className="block text-[11px] text-[#64766a]">
                                {pl.items_count} SKUs mapped
                              </span>
                            </td>

                            {/* Dates */}
                            <td className="px-5 py-4 text-xs text-[#31483a]">
                              <div className="flex items-center gap-1.5 font-medium">
                                <Calendar size={13} className="text-[#87958b]" />
                                From: {new Date(pl.effective_from).toLocaleDateString("en-IN")}
                              </div>
                              {pl.effective_to ? (
                                <span className="text-[11px] text-[#87958b] block mt-0.5">
                                  To: {new Date(pl.effective_to).toLocaleDateString("en-IN")}
                                </span>
                              ) : (
                                <span className="text-[11px] text-emerald-700 block mt-0.5 font-medium">
                                  Ongoing / Indefinite
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4">
                              <span
                                className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold capitalize ${getPriceListBadge(
                                  pl.status,
                                )}`}
                              >
                                {pl.status.replace("_", " ")}
                              </span>
                            </td>

                            {/* Maker Checker */}
                            <td className="px-5 py-4 text-xs">
                              {pl.status === "pending_approval" ? (
                                <div className="rounded bg-amber-50 p-2 border border-amber-200">
                                  <p className="font-semibold text-amber-800 flex items-center gap-1">
                                    <Clock size={12} /> Awaiting Approval
                                  </p>
                                  <p className="text-[11px] text-amber-700 mt-0.5">
                                    Maker: {pl.created_by || "Pricing Team"}
                                  </p>
                                </div>
                              ) : pl.approved_by ? (
                                <div>
                                  <p className="font-medium text-[#19392a] flex items-center gap-1 text-[11px]">
                                    <CheckCircle2 size={12} className="text-emerald-600" />
                                    {pl.approved_by}
                                  </p>
                                  <p className="text-[11px] text-[#87958b]">
                                    Rule PR-07: Immutable
                                  </p>
                                </div>
                              ) : (
                                <span className="text-[#87958b] text-[11px]">Draft Phase</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 text-right">
                              <Link
                                href={`/admin/pricing/${pl.id}`}
                                className="rounded-md border border-[#cbd8ce] bg-white px-3 py-1.5 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
                              >
                                {pl.status === "pending_approval" ? "Review & Matrix" : "View Matrix"}
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 2: Trade Schemes & Promotional Offers */
            <div className="space-y-4">
              {/* Search & Status Filter */}
              <div className="flex flex-col gap-3 rounded-lg border border-[#dce5dd] bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#87958b]"
                  />
                  <input
                    type="text"
                    placeholder="Search schemes by Code, Name, or Description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full rounded-md border border-[#cbd8ce] bg-white pl-9 pr-4 text-xs text-[#19392a] outline-none transition-colors placeholder:text-[#87958b] focus:border-[#1b5e20]"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#64766a]">Status:</span>
                  <select
                    value={schemeStatusFilter}
                    onChange={(e) => setSchemeStatusFilter(e.target.value)}
                    className="h-9 rounded-md border border-[#cbd8ce] bg-white px-3 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                  >
                    <option value="all">All Schemes</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              </div>

              {/* Schemes Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSchemes.map((scheme) => {
                  const budgetPct = scheme.budget_amount
                    ? Math.round(((scheme.budget_used || 0) / scheme.budget_amount) * 100)
                    : 0;

                  return (
                    <div
                      key={scheme.id}
                      className="flex flex-col justify-between rounded-lg border border-[#dce5dd] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-[#1b5e20] bg-[#e9f1e9] px-2 py-0.5 rounded">
                            {scheme.code}
                          </span>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize ${
                              scheme.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {scheme.status}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-semibold text-base text-[#19392a]">
                            {scheme.name}
                          </h3>
                          <p className="mt-1 text-xs text-[#64766a] line-clamp-2">
                            {scheme.description || "Active promotional scheme"}
                          </p>
                        </div>

                        {/* Scheme Type & Mechanics */}
                        <div className="rounded-md bg-[#f9fbf9] p-3 border border-[#e8eee9] text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-[#31483a]">
                            <span className="font-medium text-[#64766a]">Scheme Type:</span>
                            <span className="font-semibold capitalize text-[#19392a]">
                              {scheme.type.replace("_", " ")}
                            </span>
                          </div>

                          {scheme.type === "slab_pct" && scheme.slabs ? (
                            <div className="space-y-1 pt-1 border-t border-[#e8eee9]">
                              <p className="text-[11px] font-medium text-[#64766a]">Slab Tiers:</p>
                              {scheme.slabs.map((slab, i) => (
                                <div
                                  key={i}
                                  className="flex justify-between text-[11px] text-[#19392a]"
                                >
                                  <span>&ge; {slab.min_qty} Bags:</span>
                                  <span className="font-semibold text-emerald-700">
                                    {slab.discount_pct}% Discount
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : scheme.type === "flat" ? (
                            <div className="flex justify-between text-[11px] text-[#19392a] pt-1 border-t border-[#e8eee9]">
                              <span className="text-[#64766a]">Flat Deduction:</span>
                              <span className="font-semibold text-emerald-700">
                                ₹{scheme.discount_value} per unit
                              </span>
                            </div>
                          ) : scheme.type === "buy_x_get_y" ? (
                            <div className="flex justify-between text-[11px] text-[#19392a] pt-1 border-t border-[#e8eee9]">
                              <span className="text-[#64766a]">Free Goods:</span>
                              <span className="font-semibold text-emerald-700">
                                Buy {scheme.buy_qty} &rarr; Get {scheme.get_qty} Free
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {/* Budget Burn Progress Bar */}
                        {scheme.budget_amount ? (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[#64766a]">Promotional Subsidy:</span>
                              <span className="font-semibold text-[#19392a]">
                                ₹{(scheme.budget_used || 0).toLocaleString("en-IN")} / ₹
                                {scheme.budget_amount.toLocaleString("en-IN")} ({budgetPct}%)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[#e8eee9] overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  budgetPct > 80 ? "bg-red-500" : "bg-[#1b5e20]"
                                }`}
                                style={{ width: `${Math.min(100, budgetPct)}%` }}
                              />
                            </div>
                          </div>
                        ) : null}

                        {/* Validity Dates */}
                        <div className="flex items-center gap-1.5 text-[11px] text-[#87958b]">
                          <Calendar size={12} />
                          Valid: {new Date(scheme.valid_from).toLocaleDateString("en-IN")} &ndash;{" "}
                          {new Date(scheme.valid_to).toLocaleDateString("en-IN")}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-[#e8eee9] flex items-center justify-between">
                        <span className="text-[11px] text-[#64766a]">
                          Stackable: {scheme.is_exclusive ? "No (Exclusive)" : "Yes"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleScheme(scheme)}
                          className={`rounded-md px-3 py-1 text-xs font-semibold border transition-colors ${
                            scheme.status === "active"
                              ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                              : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          }`}
                        >
                          {scheme.status === "active" ? "Pause Scheme" : "Activate Scheme"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </AdminShell>
    </RoleGuard>
  );
}

