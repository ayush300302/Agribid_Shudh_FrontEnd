"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  History,
  Info,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  TrendingDown,
  Unlock,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import {
  getAgingReport,
  listCreditAccounts,
  listLedger,
  overrideCredit,
  updateCreditTerms,
} from "@/lib/payment-api";
import type {
  AgingBucket,
  CreditAccount,
  CreditOverrideRequest,
  LedgerEntry,
  UpdateCreditTermsRequest,
} from "@/types/payment";

function formatINR(val: number) {
  return "₹" + Number(val || 0).toLocaleString("en-IN");
}

function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "HOLD":
      return "bg-rose-50 text-rose-700 border-rose-200 font-bold";
    case "CLOSED":
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export default function CreditAndLedgerPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selected for modals
  const [selectedAccountForLedger, setSelectedAccountForLedger] = useState<CreditAccount | null>(null);
  const [editingTermsAccount, setEditingTermsAccount] = useState<CreditAccount | null>(null);
  const [overrideAccount, setOverrideAccount] = useState<CreditAccount | null>(null);

  // Forms state
  const [editLimit, setEditLimit] = useState<string>("");
  const [editDays, setEditDays] = useState<string>("");
  const [editGrace, setEditGrace] = useState<string>("");
  const [editError, setEditError] = useState<string | null>(null);

  const [overrideUntil, setOverrideUntil] = useState<string>("");
  const [overrideLimit, setOverrideLimit] = useState<string>("");
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // Queries
  const { data: accounts = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["credit-accounts-all"],
    queryFn: () => listCreditAccounts(),
  });

  const { data: agingBuckets = [] } = useQuery({
    queryKey: ["credit-aging-report"],
    queryFn: () => getAgingReport(),
  });

  const { data: ledgerEntries = [], isLoading: isLoadingLedger } = useQuery({
    queryKey: ["partner-ledger", selectedAccountForLedger?.buyer_id],
    queryFn: () =>
      listLedger({
        partnerId: selectedAccountForLedger?.buyer_id,
      }),
    enabled: !!selectedAccountForLedger,
  });

  // Mutations
  const updateTermsMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCreditTermsRequest }) =>
      updateCreditTerms(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-accounts-all"] });
      setEditingTermsAccount(null);
      setEditError(null);
    },
    onError: (err: any) => {
      setEditError(err.message || "Failed to update credit terms");
    },
  });

  const overrideMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreditOverrideRequest }) =>
      overrideCredit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-accounts-all"] });
      setOverrideAccount(null);
      setOverrideError(null);
    },
    onError: (err: any) => {
      setOverrideError(err.message || "Failed to override credit hold");
    },
  });

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalExtended = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;
    let holdCount = 0;

    accounts.forEach((acc) => {
      totalExtended += acc.credit_limit;
      totalOutstanding += acc.outstanding;
      totalOverdue += acc.overdue_amount;
      if (acc.status === "HOLD") holdCount++;
    });

    return {
      totalExtended,
      totalOutstanding,
      totalOverdue,
      holdCount,
      accountsCount: accounts.length,
    };
  }, [accounts]);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (statusFilter !== "ALL" && acc.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBuyer = acc.buyer_name.toLowerCase().includes(q);
        const matchSeller = acc.seller_name.toLowerCase().includes(q);
        const matchTier = acc.buyer_tier.toLowerCase().includes(q);
        if (!matchBuyer && !matchSeller && !matchTier) return false;
      }
      return true;
    });
  }, [accounts, statusFilter, searchQuery]);

  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "distributor", "finance_manager"]}>
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#64766a]">
                <Link
                  href="/admin/payments"
                  className="inline-flex items-center gap-1 hover:text-[#1b5e20] transition-colors"
                >
                  <ArrowLeft size={13} />
                  Payments & Collections
                </Link>
                <span>/</span>
                <span className="text-[#19392a] font-semibold">Credit & Ledger</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="rounded-md bg-[#1b5e20]/10 p-2 text-[#1b5e20]">
                  <Wallet size={22} />
                </span>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                    Credit Accounts & Ledger Management
                  </h1>
                  <p className="mt-0.5 text-sm text-[#64766a]">
                    Downline credit limits, automated overdue HOLD enforcement (Rule PY-06), temporary overrides, and double-entry ledger.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={isRefetching ? "animate-spin text-[#1b5e20]" : "text-[#64766a]"} />
                Refresh Accounts
              </button>
            </div>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#64766a]">Total Credit Extended</span>
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <Wallet size={16} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-[#19392a]">
                {formatINR(metrics.totalExtended)}
              </p>
              <p className="mt-1 text-xs text-[#64766a]">
                Across {metrics.accountsCount} active partner accounts
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-800">Total Outstanding Debt</span>
                <span className="rounded-md bg-blue-100 p-1.5 text-blue-700">
                  <CreditCard size={16} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-blue-900">
                {formatINR(metrics.totalOutstanding)}
              </p>
              <p className="mt-1 text-xs text-blue-700">
                Current total trade receivable balance
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-800">Overdue at Risk</span>
                <span className="rounded-md bg-amber-100 p-1.5 text-amber-700">
                  <AlertTriangle size={16} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-amber-900">
                {formatINR(metrics.totalOverdue)}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Invoices past designated payment terms
              </p>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-rose-800">Accounts on HOLD</span>
                <span className="rounded-md bg-rose-100 p-1.5 text-rose-700">
                  <Lock size={16} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-rose-900">
                {metrics.holdCount}
              </p>
              <p className="mt-1 text-xs text-rose-700">
                Credit checkout locked per Rule PY-06
              </p>
            </div>
          </div>

          {/* Aging Buckets Card */}
          <div className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#dce5dd] pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#19392a]">
                  Trade Receivables Aging Schedule
                </h2>
                <p className="text-xs text-[#64766a]">
                  Days past due classification for credit risk management
                </p>
              </div>
              <span className="text-xs font-semibold text-[#1b5e20]">
                Total Overdue: {formatINR(metrics.totalOverdue)}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {agingBuckets.map((b) => (
                <div
                  key={b.bucket}
                  className={`rounded-lg border p-3 ${
                    b.bucket === "0-30"
                      ? "border-emerald-200 bg-emerald-50/30"
                      : b.bucket === "31-60"
                      ? "border-amber-200 bg-amber-50/30"
                      : "border-rose-200 bg-rose-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#64766a]">
                      {b.bucket} Days
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold border border-[#dce5dd]">
                      {b.count} inv
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-bold font-mono text-[#19392a]">
                    {formatINR(b.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "ALL", label: `All Accounts (${accounts.length})` },
                  { id: "ACTIVE", label: "Active" },
                  { id: "HOLD", label: `On HOLD (${metrics.holdCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      statusFilter === tab.id
                        ? "bg-[#1b5e20] text-white shadow-xs"
                        : "text-[#64766a] hover:bg-[#f1f5f1] hover:text-[#19392a]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64766a]"
                />
                <input
                  type="text"
                  placeholder="Search buyer partner or creditor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-[#dce5dd] bg-white py-1.5 pl-8 pr-3 text-xs text-[#19392a] placeholder-[#64766a]/60 focus:border-[#1b5e20] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Credit Accounts Table */}
          <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
            <div className="border-b border-[#dce5dd] bg-[#f8faf8] px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#19392a]">
                  Partner Credit Accounts ({filteredAccounts.length})
                </h2>
                <span className="text-xs text-[#64766a]">
                  Rule PY-01: Available = Limit - Outstanding
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <RefreshCw size={24} className="animate-spin text-[#1b5e20]" />
                <p className="mt-3 text-xs font-medium text-[#64766a]">Loading credit accounts...</p>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Wallet size={36} className="text-[#64766a]/40" />
                <h3 className="mt-3 text-sm font-bold text-[#19392a]">No accounts found</h3>
                <p className="mt-1 text-xs text-[#64766a]">
                  Try modifying your search query or filter selection.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#dce5dd] bg-[#f1f5f1]/60 text-[11px] font-semibold tracking-wider text-[#64766a] uppercase">
                    <tr>
                      <th scope="col" className="px-4 py-3 sm:px-6">Buyer Partner</th>
                      <th scope="col" className="px-4 py-3">Creditor / Seller</th>
                      <th scope="col" className="px-4 py-3 text-right">Credit Limit</th>
                      <th scope="col" className="px-4 py-3 text-right">Outstanding</th>
                      <th scope="col" className="px-4 py-3 text-right">Available</th>
                      <th scope="col" className="px-4 py-3">Overdue & Grace</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dce5dd]">
                    {filteredAccounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-[#f8faf8] transition-colors">
                        {/* Buyer Partner */}
                        <td className="px-4 py-3.5 sm:px-6">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#19392a]">
                              {acc.buyer_name}
                            </span>
                            <span className="text-[10px] uppercase font-mono text-[#64766a]">
                              {acc.buyer_tier.replace("_", " ")}
                            </span>
                          </div>
                        </td>

                        {/* Creditor / Seller */}
                        <td className="px-4 py-3.5">
                          <span className="text-[#64766a]">{acc.seller_name}</span>
                        </td>

                        {/* Credit Limit */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className="font-mono font-bold text-[#19392a]">
                            {formatINR(acc.credit_limit)}
                          </span>
                          <div className="text-[10px] text-[#64766a]">
                            Terms: {acc.credit_days}d · Cap: {formatINR(acc.tier_cap)}
                          </div>
                        </td>

                        {/* Outstanding */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className="font-mono font-bold text-amber-900">
                            {formatINR(acc.outstanding)}
                          </span>
                        </td>

                        {/* Available */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className="font-mono font-bold text-[#1b5e20]">
                            {formatINR(acc.available_credit)}
                          </span>
                        </td>

                        {/* Overdue */}
                        <td className="px-4 py-3.5">
                          {acc.overdue_amount > 0 ? (
                            <div className="flex flex-col">
                              <span className="font-mono font-bold text-rose-700">
                                {formatINR(acc.overdue_amount)}
                              </span>
                              <span className="text-[10px] text-rose-600">
                                {acc.days_past_due}d overdue (Grace: {acc.grace_days}d)
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-medium">
                              On Track (₹0)
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(
                                acc.status,
                              )}`}
                            >
                              {acc.status === "HOLD" && <Lock size={10} />}
                              {acc.status}
                            </span>
                            {acc.override_until && (
                              <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                Override active
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 sm:px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Ledger */}
                            <button
                              type="button"
                              onClick={() => setSelectedAccountForLedger(acc)}
                              className="inline-flex items-center gap-1 rounded-md border border-[#dce5dd] bg-white px-2 py-1 text-[11px] font-medium text-[#19392a] hover:bg-[#f1f5f1]"
                              title="View Running Ledger"
                            >
                              <BookOpen size={12} className="text-[#1b5e20]" />
                              Ledger
                            </button>

                            {/* Edit Terms */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTermsAccount(acc);
                                setEditLimit(String(acc.credit_limit));
                                setEditDays(String(acc.credit_days));
                                setEditGrace(String(acc.grace_days));
                                setEditError(null);
                              }}
                              className="inline-flex items-center gap-1 rounded-md border border-[#dce5dd] bg-white px-2 py-1 text-[11px] font-medium text-[#19392a] hover:bg-[#f1f5f1]"
                              title="Edit Terms"
                            >
                              <Edit size={12} />
                              Terms
                            </button>

                            {/* Admin Override */}
                            {acc.status === "HOLD" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOverrideAccount(acc);
                                  setOverrideUntil(
                                    new Date(Date.now() + 7 * 86400000)
                                      .toISOString()
                                      .split("T")[0],
                                  );
                                  setOverrideLimit(String(acc.credit_limit));
                                  setOverrideReason("");
                                  setOverrideError(null);
                                }}
                                className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-amber-700"
                                title="Temporary Override"
                              >
                                <Unlock size={12} />
                                Override
                              </button>
                            )}
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

        {/* Running Ledger Drawer */}
        {selectedAccountForLedger && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <div className="relative h-full w-full max-w-2xl bg-white p-6 shadow-2xl flex flex-col overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedAccountForLedger(null)}
                className="absolute right-4 top-4 text-[#64766a] hover:text-[#19392a]"
              >
                <X size={18} />
              </button>

              <div className="border-b border-[#dce5dd] pb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#1b5e20]/10 p-2 text-[#1b5e20]">
                    <BookOpen size={20} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#19392a]">
                      Partner Running Ledger
                    </h3>
                    <p className="text-xs text-[#64766a]">
                      {selectedAccountForLedger.buyer_name} ({selectedAccountForLedger.buyer_tier})
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-[#f8faf8] p-3 text-xs border border-[#dce5dd]">
                  <div>
                    <span className="text-[#64766a]">Credit Limit:</span>
                    <p className="font-mono font-bold text-[#19392a]">
                      {formatINR(selectedAccountForLedger.credit_limit)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#64766a]">Current Outstanding:</span>
                    <p className="font-mono font-bold text-amber-900">
                      {formatINR(selectedAccountForLedger.outstanding)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#64766a]">Available Credit:</span>
                    <p className="font-mono font-bold text-[#1b5e20]">
                      {formatINR(selectedAccountForLedger.available_credit)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ledger entries list */}
              <div className="mt-4 flex-1">
                <h4 className="text-xs font-bold text-[#19392a] uppercase tracking-wider mb-2">
                  Double-Entry Ledger Lines
                </h4>

                {isLoadingLedger ? (
                  <div className="flex justify-center p-8">
                    <RefreshCw size={20} className="animate-spin text-[#1b5e20]" />
                  </div>
                ) : ledgerEntries.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#64766a]">
                    No ledger transactions recorded for this account.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ledgerEntries.map((entry) => {
                      const isDr = entry.debit > 0;
                      const formattedDate = new Date(entry.created_at).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      );

                      return (
                        <div
                          key={entry.id}
                          className="rounded-lg border border-[#dce5dd] p-3 hover:bg-[#f8faf8] transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                  isDr
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {entry.entry_type} ({isDr ? "Dr" : "Cr"})
                              </span>
                              {entry.ref_id && (
                                <span className="font-mono text-xs font-semibold text-[#19392a]">
                                  {entry.ref_id}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#64766a]">{formattedDate}</span>
                          </div>

                          <p className="mt-1.5 text-xs text-[#19392a]">{entry.narration}</p>

                          <div className="mt-2 flex items-center justify-between border-t border-[#dce5dd] pt-2 text-xs">
                            <div className="flex items-center gap-3">
                              {isDr ? (
                                <span className="font-mono text-rose-700 font-bold">
                                  Debit: +{formatINR(entry.debit)}
                                </span>
                              ) : (
                                <span className="font-mono text-emerald-700 font-bold">
                                  Credit: -{formatINR(entry.credit)}
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[#64766a]">
                              Balance: <strong>{formatINR(entry.balance_after)}</strong>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#dce5dd]">
                <button
                  type="button"
                  onClick={() => setSelectedAccountForLedger(null)}
                  className="w-full rounded-md border border-[#dce5dd] py-2 text-xs font-semibold text-[#19392a] hover:bg-[#f1f5f1]"
                >
                  Close Ledger
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Credit Terms Modal */}
        {editingTermsAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl">
              <button
                type="button"
                onClick={() => setEditingTermsAccount(null)}
                className="absolute right-4 top-4 text-[#64766a] hover:text-[#19392a]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <Sliders size={18} />
                </span>
                <h3 className="text-lg font-bold text-[#19392a]">
                  Edit Credit Terms
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#64766a]">
                {editingTermsAccount.buyer_name} · Tier Cap: {formatINR(editingTermsAccount.tier_cap)}
              </p>

              {editError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 flex items-start gap-1.5">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateTermsMutation.mutate({
                    id: editingTermsAccount.id,
                    data: {
                      credit_limit: parseFloat(editLimit),
                      credit_days: parseInt(editDays),
                      grace_days: parseInt(editGrace),
                    },
                  });
                }}
                className="mt-4 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#19392a]">
                    Credit Limit (₹) *
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={editLimit}
                    onChange={(e) => setEditLimit(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-mono font-semibold text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                  />
                  <p className="mt-1 text-[11px] text-[#64766a]">
                    Cannot exceed authorized tier cap of {formatINR(editingTermsAccount.tier_cap)} (Rule PY-07).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#19392a]">
                      Credit Terms (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={editDays}
                      onChange={(e) => setEditDays(e.target.value)}
                      required
                      className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-mono text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#19392a]">
                      Grace Period (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={editGrace}
                      onChange={(e) => setEditGrace(e.target.value)}
                      required
                      className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-mono text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#dce5dd]">
                  <button
                    type="button"
                    onClick={() => setEditingTermsAccount(null)}
                    className="rounded-md border border-[#dce5dd] px-3.5 py-2 text-xs font-semibold text-[#64766a] hover:bg-[#f1f5f1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateTermsMutation.isPending}
                    className="rounded-md bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50"
                  >
                    {updateTermsMutation.isPending ? "Saving..." : "Save Terms"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Temporary Credit Override Modal */}
        {overrideAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-xl border border-amber-200 bg-white p-6 shadow-xl">
              <button
                type="button"
                onClick={() => setOverrideAccount(null)}
                className="absolute right-4 top-4 text-[#64766a] hover:text-[#19392a]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-100 p-1.5 text-amber-700">
                  <Unlock size={18} />
                </span>
                <h3 className="text-lg font-bold text-[#19392a]">
                  Temporary Credit Override
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#64766a]">
                Temporarily lift credit HOLD on {overrideAccount.buyer_name} for order processing.
              </p>

              {overrideError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 flex items-start gap-1.5">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{overrideError}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!overrideReason.trim()) {
                    setOverrideError("Justification reason is required.");
                    return;
                  }
                  overrideMutation.mutate({
                    id: overrideAccount.id,
                    data: {
                      override_until: overrideUntil,
                      temporary_limit: overrideLimit ? parseFloat(overrideLimit) : undefined,
                      reason: overrideReason.trim(),
                    },
                  });
                }}
                className="mt-4 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#19392a]">
                    Override Valid Until *
                  </label>
                  <input
                    type="date"
                    value={overrideUntil}
                    onChange={(e) => setOverrideUntil(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#19392a]">
                    Temporary Limit Boost (Optional)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    placeholder={`Current limit: ${overrideAccount.credit_limit}`}
                    value={overrideLimit}
                    onChange={(e) => setOverrideLimit(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-mono text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#19392a]">
                    Administrative Justification Reason *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Managing Director seasonal authorization / Pending payment in RTGS transit"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white p-2 text-xs text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#dce5dd]">
                  <button
                    type="button"
                    onClick={() => setOverrideAccount(null)}
                    className="rounded-md border border-[#dce5dd] px-3.5 py-2 text-xs font-semibold text-[#64766a] hover:bg-[#f1f5f1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={overrideMutation.isPending}
                    className="rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50"
                  >
                    {overrideMutation.isPending ? "Applying..." : "Apply Temporary Override"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminShell>
    </RoleGuard>
  );
}

