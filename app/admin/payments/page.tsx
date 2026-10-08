"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileCheck,
  Filter,
  History,
  Landmark,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  Smartphone,
  User,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import {
  getCashReconciliation,
  listCreditAccounts,
  listPayments,
  recordPayment,
  reversePayment,
  updateChequeStatus,
} from "@/lib/payment-api";
import type {
  ChequeStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
  RecordPaymentRequest,
} from "@/types/payment";

function formatINR(val: number) {
  return "₹" + Number(val || 0).toLocaleString("en-IN");
}

function getPaymentModeBadge(mode: PaymentMethod) {
  switch (mode) {
    case "CASH":
      return {
        label: "Cash Collection",
        className: "bg-amber-50 text-amber-800 border-amber-200",
        icon: Banknote,
      };
    case "UPI":
      return {
        label: "UPI Instant",
        className: "bg-emerald-50 text-emerald-800 border-emerald-200",
        icon: Smartphone,
      };
    case "BANK_TRANSFER":
      return {
        label: "NEFT / RTGS",
        className: "bg-blue-50 text-blue-800 border-blue-200",
        icon: Landmark,
      };
    case "CHEQUE":
      return {
        label: "Cheque Deposit",
        className: "bg-purple-50 text-purple-800 border-purple-200",
        icon: FileCheck,
      };
    case "ONLINE_PG":
    default:
      return {
        label: "Online Gateway",
        className: "bg-cyan-50 text-cyan-800 border-cyan-200",
        icon: CreditCard,
      };
  }
}

function getPaymentStatusBadge(status: PaymentStatus) {
  switch (status) {
    case "SUCCESS":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "REVERSED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "FAILED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export default function PaymentsConsolePage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedMode, setSelectedMode] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showCashReconDrawer, setShowCashReconDrawer] = useState(false);
  const [inspectingPayment, setInspectingPayment] = useState<Payment | null>(null);
  const [chequeActionPayment, setChequeActionPayment] = useState<Payment | null>(null);
  const [reversalPayment, setReversalPayment] = useState<Payment | null>(null);

  // Form states for Record Payment
  const [formPayerId, setFormPayerId] = useState<string>("");
  const [formAmount, setFormAmount] = useState<string>("");
  const [formMode, setFormMode] = useState<PaymentMethod>("UPI");
  const [formRefNo, setFormRefNo] = useState<string>("");
  const [formChequeBank, setFormChequeBank] = useState<string>("");
  const [formChequeDate, setFormChequeDate] = useState<string>("");
  const [formCollectorName, setFormCollectorName] = useState<string>("");
  const [formRemarks, setFormRemarks] = useState<string>("");
  const [recordError, setRecordError] = useState<string | null>(null);

  // Form state for Reversal
  const [reversalReason, setReversalReason] = useState<string>("");
  const [reversalError, setReversalError] = useState<string | null>(null);

  // Queries
  const { data: payments = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["payments-list"],
    queryFn: () => listPayments(),
  });

  const { data: creditAccounts = [] } = useQuery({
    queryKey: ["credit-accounts-summary"],
    queryFn: () => listCreditAccounts(),
  });

  const { data: cashRecon = [] } = useQuery({
    queryKey: ["cash-reconciliation"],
    queryFn: () => getCashReconciliation(),
    enabled: showCashReconDrawer,
  });

  // Mutations
  const recordMutation = useMutation({
    mutationFn: recordPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments-list"] });
      queryClient.invalidateQueries({ queryKey: ["credit-accounts-summary"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      setShowRecordModal(false);
      resetRecordForm();
    },
    onError: (err: any) => {
      setRecordError(err.message || "Failed to record payment");
    },
  });

  const chequeMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ChequeStatus }) =>
      updateChequeStatus(id, { cheque_status: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments-list"] });
      queryClient.invalidateQueries({ queryKey: ["credit-accounts-summary"] });
      setChequeActionPayment(null);
    },
  });

  const reverseMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reversePayment(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments-list"] });
      queryClient.invalidateQueries({ queryKey: ["credit-accounts-summary"] });
      setReversalPayment(null);
      setReversalReason("");
    },
    onError: (err: any) => {
      setReversalError(err.message || "Failed to reverse payment");
    },
  });

  function resetRecordForm() {
    setFormPayerId("");
    setFormAmount("");
    setFormMode("UPI");
    setFormRefNo("");
    setFormChequeBank("");
    setFormChequeDate("");
    setFormCollectorName("");
    setFormRemarks("");
    setRecordError(null);
  }

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (activeTab === "SUCCESS" && p.status !== "SUCCESS") return false;
      if (activeTab === "PENDING" && p.status !== "PENDING") return false;
      if (activeTab === "REVERSED" && p.status !== "REVERSED") return false;

      if (selectedMode !== "ALL" && p.mode !== selectedMode) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesReceipt = p.receipt_no.toLowerCase().includes(q);
        const matchesPayer = p.payer_name.toLowerCase().includes(q);
        const matchesRef = p.reference_no?.toLowerCase().includes(q);
        const matchesRemarks = p.remarks?.toLowerCase().includes(q);
        if (!matchesReceipt && !matchesPayer && !matchesRef && !matchesRemarks) {
          return false;
        }
      }

      return true;
    });
  }, [payments, activeTab, selectedMode, searchQuery]);

  // Financial Metrics
  const metrics = useMemo(() => {
    let totalCollections = 0;
    let bankUpiAmount = 0;
    let cashAmount = 0;
    let pendingChequesCount = 0;
    let pendingChequesAmount = 0;

    payments.forEach((p) => {
      if (p.status === "SUCCESS") {
        totalCollections += p.amount;
        if (p.mode === "UPI" || p.mode === "BANK_TRANSFER" || p.mode === "ONLINE_PG") {
          bankUpiAmount += p.amount;
        }
        if (p.mode === "CASH") {
          cashAmount += p.amount;
        }
      }
      if (p.mode === "CHEQUE" && p.status === "PENDING") {
        pendingChequesCount++;
        pendingChequesAmount += p.amount;
      }
    });

    return {
      totalCollections,
      bankUpiAmount,
      cashAmount,
      pendingChequesCount,
      pendingChequesAmount,
    };
  }, [payments]);

  // Handler for Record Form Submit
  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecordError(null);

    const amountNum = parseFloat(formAmount);
    if (!formPayerId) {
      setRecordError("Please select a partner / payer.");
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setRecordError("Please enter a valid amount greater than ₹0.");
      return;
    }

    // Rule PY-03: s.269ST check
    if (formMode === "CASH" && amountNum > 199999) {
      setRecordError(
        "Cash payment exceeds ₹1,99,999 limit per Income Tax Act section 269ST. Please use Bank Transfer, UPI, or Cheque.",
      );
      return;
    }

    if ((formMode === "UPI" || formMode === "BANK_TRANSFER") && !formRefNo.trim()) {
      setRecordError("Reference / UTR number is mandatory for UPI and Bank Transfers (Rule PY-04).");
      return;
    }

    recordMutation.mutate({
      payer_id: formPayerId,
      amount: amountNum,
      mode: formMode,
      reference_no: formRefNo.trim() || undefined,
      cheque_bank: formMode === "CHEQUE" ? formChequeBank : undefined,
      cheque_date: formMode === "CHEQUE" ? formChequeDate : undefined,
      collected_by_name: formMode === "CASH" ? formCollectorName : undefined,
      remarks: formRemarks.trim() || undefined,
    });
  };

  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "distributor", "finance_manager"]}>
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-[#1b5e20]/10 p-2 text-[#1b5e20]">
                  <CreditCard size={22} />
                </span>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                    Payments & Collections Desk
                  </h1>
                  <p className="mt-0.5 text-sm text-[#64766a]">
                    B2B receipts, RTGS/NEFT matching, instant UPI settlements, cheque clearing, and s.269ST cash compliance.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/credit"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5dd] bg-white px-3.5 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
              >
                <Wallet size={14} className="text-[#1b5e20]" />
                Credit & Ledger
              </Link>

              <button
                type="button"
                onClick={() => setShowCashReconDrawer(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5dd] bg-white px-3.5 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
              >
                <Banknote size={14} className="text-amber-700" />
                Cash Reconciliation
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormPayerId(creditAccounts[0]?.buyer_id || "p-002");
                  setShowRecordModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] transition-colors"
              >
                <Plus size={14} /> Record Payment Receipt
              </button>
            </div>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#64766a]">Total Collections (Month)</span>
                <span className="rounded-md bg-emerald-100 p-1.5 text-emerald-800">
                  <CheckCircle2 size={16} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-[#19392a]">
                {formatINR(metrics.totalCollections)}
              </p>
              <p className="mt-1 text-xs text-[#64766a]">
                Settled across all payment modes
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-800">Bank & UPI Settlements</span>
                <span className="rounded-md bg-blue-100 p-1.5 text-blue-700">
                  <Landmark size={16} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-blue-900">
                {formatINR(metrics.bankUpiAmount)}
              </p>
              <p className="mt-1 text-xs text-blue-700">
                Direct bank UTR & QR collections
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-800">Cash In Hand (Routes)</span>
                <span className="rounded-md bg-amber-100 p-1.5 text-amber-700">
                  <Banknote size={16} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-amber-900">
                {formatINR(metrics.cashAmount)}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Complies with Section 269ST limit
              </p>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-purple-800">Cheques In Clearing</span>
                <span className="rounded-md bg-purple-100 p-1.5 text-purple-700">
                  <FileCheck size={16} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-purple-900">
                {formatINR(metrics.pendingChequesAmount)}
              </p>
              <p className="mt-1 text-xs text-purple-700">
                {metrics.pendingChequesCount} pending clearance
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Tab Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "ALL", label: `All (${payments.length})` },
                  { id: "SUCCESS", label: "Settled" },
                  { id: "PENDING", label: `Pending Cheques (${metrics.pendingChequesCount})` },
                  { id: "REVERSED", label: "Reversals" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeTab === tab.id
                        ? "bg-[#1b5e20] text-white shadow-xs"
                        : "text-[#64766a] hover:bg-[#f1f5f1] hover:text-[#19392a]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Mode filter and Search */}
              <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
                <div className="w-full sm:w-auto min-w-[160px]">
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="w-full rounded-md border border-[#dce5dd] bg-white px-3 py-1.5 text-xs font-medium text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                  >
                    <option value="ALL">All Payment Modes</option>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="ONLINE_PG">Online Gateway</option>
                  </select>
                </div>

                <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64766a]"
                  />
                  <input
                    type="text"
                    placeholder="Search receipt #, ref, partner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-[#dce5dd] bg-white py-1.5 pl-8 pr-3 text-xs text-[#19392a] placeholder-[#64766a]/60 focus:border-[#1b5e20] focus:outline-hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="inline-flex items-center gap-1 rounded-md border border-[#dce5dd] bg-white p-2 text-xs text-[#64766a] hover:bg-[#f1f5f1]"
                  title="Refresh"
                >
                  <RefreshCw size={14} className={isRefetching ? "animate-spin text-[#1b5e20]" : ""} />
                </button>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
            <div className="border-b border-[#dce5dd] bg-[#f8faf8] px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#19392a]">
                  Recorded Payment Receipts ({filteredPayments.length})
                </h2>
                <span className="text-xs text-[#64766a]">
                  Showing chronological ledger collections
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <RefreshCw size={24} className="animate-spin text-[#1b5e20]" />
                <p className="mt-3 text-xs font-medium text-[#64766a]">Loading payment records...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <CreditCard size={36} className="text-[#64766a]/40" />
                <h3 className="mt-3 text-sm font-bold text-[#19392a]">No payment receipts found</h3>
                <p className="mt-1 text-xs text-[#64766a]">
                  {searchQuery || selectedMode !== "ALL" || activeTab !== "ALL"
                    ? "Try adjusting your search criteria or mode filters."
                    : "No payments have been recorded yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#dce5dd] bg-[#f1f5f1]/60 text-[11px] font-semibold tracking-wider text-[#64766a] uppercase">
                    <tr>
                      <th scope="col" className="px-4 py-3 sm:px-6">Receipt # & Date</th>
                      <th scope="col" className="px-4 py-3">Payer Partner</th>
                      <th scope="col" className="px-4 py-3 text-right">Amount</th>
                      <th scope="col" className="px-4 py-3">Payment Mode</th>
                      <th scope="col" className="px-4 py-3">Ref # / UTR</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dce5dd]">
                    {filteredPayments.map((p) => {
                      const modeBadge = getPaymentModeBadge(p.mode);
                      const ModeIcon = modeBadge.icon;
                      const formattedDate = new Date(p.received_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr key={p.id} className="hover:bg-[#f8faf8] transition-colors">
                          {/* Receipt & Date */}
                          <td className="px-4 py-3.5 sm:px-6">
                            <div className="flex flex-col">
                              <span className="font-mono font-bold text-[#19392a]">
                                {p.receipt_no}
                              </span>
                              <div className="mt-1 flex items-center gap-1 text-[11px] text-[#64766a]">
                                <Clock size={11} />
                                <span>{formattedDate}</span>
                              </div>
                            </div>
                          </td>

                          {/* Payer Partner */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#19392a]">
                                {p.payer_name}
                              </span>
                              <span className="text-[10px] uppercase font-mono text-[#64766a]">
                                {p.payer_tier.replace("_", " ")}
                              </span>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <span className="font-bold font-mono text-sm text-[#19392a]">
                              {formatINR(p.amount)}
                            </span>
                            {p.allocations && p.allocations.length > 0 && (
                              <div className="text-[10px] text-[#64766a]">
                                {p.allocations[0].invoice_number}
                              </div>
                            )}
                          </td>

                          {/* Payment Mode */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${modeBadge.className}`}
                            >
                              <ModeIcon size={12} />
                              {modeBadge.label}
                            </span>
                          </td>

                          {/* Reference Number */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col">
                              {p.reference_no ? (
                                <span className="font-mono text-[11px] text-[#19392a] font-semibold">
                                  {p.reference_no}
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#64766a] italic">None</span>
                              )}
                              {p.collected_by_name && (
                                <span className="text-[10px] text-[#64766a] truncate max-w-[160px]">
                                  Coll: {p.collected_by_name}
                                </span>
                              )}
                              {p.cheque_bank && (
                                <span className="text-[10px] text-[#64766a] truncate max-w-[160px]">
                                  Bank: {p.cheque_bank}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col gap-1 items-start">
                              <span
                                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getPaymentStatusBadge(
                                  p.status,
                                )}`}
                              >
                                {p.status}
                              </span>
                              {p.mode === "CHEQUE" && p.cheque_status && (
                                <span
                                  className={`text-[10px] font-semibold ${
                                    p.cheque_status === "CLEARED"
                                      ? "text-emerald-700"
                                      : p.cheque_status === "BOUNCED"
                                      ? "text-red-700 font-bold"
                                      : "text-amber-700"
                                  }`}
                                >
                                  CHQ: {p.cheque_status}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 sm:px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inspect details */}
                              <button
                                type="button"
                                onClick={() => setInspectingPayment(p)}
                                className="inline-flex items-center gap-1 rounded-md border border-[#dce5dd] bg-white px-2 py-1 text-[11px] font-medium text-[#19392a] hover:bg-[#f1f5f1]"
                                title="View Receipt"
                              >
                                <Eye size={12} />
                                View
                              </button>

                              {/* Cheque Actions */}
                              {p.mode === "CHEQUE" && p.status === "PENDING" && (
                                <button
                                  type="button"
                                  onClick={() => setChequeActionPayment(p)}
                                  className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-purple-700"
                                >
                                  <FileCheck size={12} />
                                  Clear/Bounce
                                </button>
                              )}

                              {/* Reversal Action */}
                              {p.status === "SUCCESS" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReversalPayment(p);
                                    setReversalReason("");
                                    setReversalError(null);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                                  title="Finance Reversal"
                                >
                                  <RotateCcw size={12} />
                                  Reverse
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Record Payment Receipt Modal */}
        {showRecordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-xl rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setShowRecordModal(false);
                  resetRecordForm();
                }}
                className="absolute right-4 top-4 text-[#64766a] hover:text-[#19392a]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <CreditCard size={18} />
                </span>
                <h3 className="text-lg font-bold text-[#19392a]">
                  Record Payment Receipt
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#64766a]">
                Post collection receipt against debtor account. Automatically allocates FIFO to open invoices.
              </p>

              {recordError && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{recordError}</p>
                </div>
              )}

              <form onSubmit={handleRecordSubmit} className="mt-4 space-y-4">
                {/* Partner selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#19392a]">
                    Payer Partner (Debtor) *
                  </label>
                  <select
                    value={formPayerId}
                    onChange={(e) => setFormPayerId(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                  >
                    <option value="">Select a partner...</option>
                    {creditAccounts.map((acc) => (
                      <option key={acc.buyer_id} value={acc.buyer_id}>
                        {acc.buyer_name} ({acc.buyer_tier}) · Outstanding: {formatINR(acc.outstanding)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Payment Mode */}
                  <div>
                    <label className="block text-xs font-semibold text-[#19392a]">
                      Payment Mode *
                    </label>
                    <select
                      value={formMode}
                      onChange={(e) => setFormMode(e.target.value as PaymentMethod)}
                      className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                    >
                      <option value="UPI">UPI (Instant QR / VPA)</option>
                      <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS)</option>
                      <option value="CASH">Cash Collection</option>
                      <option value="CHEQUE">Cheque Deposit</option>
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-[#19392a]">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="e.g. 50000"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      required
                      className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-mono font-semibold text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Section 269ST Warning for Cash */}
                {formMode === "CASH" && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle size={14} className="text-amber-700" />
                      Income Tax Act Rule 269ST Mandate:
                    </div>
                    <p className="mt-1">
                      Cash receipts are strictly capped at <strong>₹1,99,999</strong> per person per day. Any cash receipt above this limit will be automatically rejected.
                    </p>
                  </div>
                )}

                {/* Dynamic fields based on mode */}
                {(formMode === "UPI" || formMode === "BANK_TRANSFER") && (
                  <div>
                    <label className="block text-xs font-semibold text-[#19392a]">
                      UTR / Transaction Reference Number * (Rule PY-04)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UTR12938471209 or UPI-4091823901"
                      value={formRefNo}
                      onChange={(e) => setFormRefNo(e.target.value)}
                      required
                      className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-mono text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                    />
                    <p className="mt-1 text-[11px] text-[#64766a]">
                      Must be unique per payee to prevent duplicate payment postings.
                    </p>
                  </div>
                )}

                {formMode === "CHEQUE" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#19392a]">
                        Cheque Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 049182"
                        value={formRefNo}
                        onChange={(e) => setFormRefNo(e.target.value)}
                        required
                        className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-mono text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#19392a]">
                        Bank Name & Branch
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SBI Pune Main"
                        value={formChequeBank}
                        onChange={(e) => setFormChequeBank(e.target.value)}
                        className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#19392a]">
                        Cheque Date
                      </label>
                      <input
                        type="date"
                        value={formChequeDate}
                        onChange={(e) => setFormChequeDate(e.target.value)}
                        className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {formMode === "CASH" && (
                  <div>
                    <label className="block text-xs font-semibold text-[#19392a]">
                      Collected By (Route Driver / Field Staff)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ganesh Shinde (Delivery Van MH-12-RN-4421)"
                      value={formCollectorName}
                      onChange={(e) => setFormCollectorName(e.target.value)}
                      className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#19392a]">
                    Remarks / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Optional notes or delivery PO reference"
                    value={formRemarks}
                    onChange={(e) => setFormRemarks(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#dce5dd]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecordModal(false);
                      resetRecordForm();
                    }}
                    className="rounded-md border border-[#dce5dd] px-4 py-2 text-xs font-semibold text-[#64766a] hover:bg-[#f1f5f1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={recordMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50"
                  >
                    {recordMutation.isPending ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        Posting Receipt...
                      </>
                    ) : (
                      "Confirm & Post Receipt"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cheque Clear / Bounce Modal */}
        {chequeActionPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl">
              <button
                type="button"
                onClick={() => setChequeActionPayment(null)}
                className="absolute right-4 top-4 text-[#64766a] hover:text-[#19392a]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-purple-100 p-1.5 text-purple-700">
                  <FileCheck size={18} />
                </span>
                <h3 className="text-lg font-bold text-[#19392a]">
                  Cheque Clearance Desk
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#64766a]">
                Receipt {chequeActionPayment.receipt_no} · Amount {formatINR(chequeActionPayment.amount)}
              </p>

              <div className="mt-4 rounded-lg bg-[#f8faf8] p-3 text-xs space-y-1.5 border border-[#dce5dd]">
                <div>
                  <span className="text-[#64766a]">Cheque No: </span>
                  <span className="font-mono font-bold text-[#19392a]">
                    {chequeActionPayment.reference_no}
                  </span>
                </div>
                <div>
                  <span className="text-[#64766a]">Bank: </span>
                  <span className="font-semibold text-[#19392a]">
                    {chequeActionPayment.cheque_bank || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[#64766a]">Payer: </span>
                  <span className="font-semibold text-[#19392a]">
                    {chequeActionPayment.payer_name}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={chequeMutation.isPending}
                  onClick={() =>
                    chequeMutation.mutate({
                      id: chequeActionPayment.id,
                      status: "CLEARED",
                    })
                  }
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  Mark as CLEARED (Post Ledger Credit)
                </button>

                <button
                  type="button"
                  disabled={chequeMutation.isPending}
                  onClick={() =>
                    chequeMutation.mutate({
                      id: chequeActionPayment.id,
                      status: "BOUNCED",
                    })
                  }
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Mark as BOUNCED (Trigger Default Alert)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Finance Payment Reversal Modal (Rule PY-05) */}
        {reversalPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-xl border border-rose-200 bg-white p-6 shadow-xl">
              <button
                type="button"
                onClick={() => setReversalPayment(null)}
                className="absolute right-4 top-4 text-[#64766a] hover:text-[#19392a]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-rose-100 p-1.5 text-rose-700">
                  <ShieldAlert size={18} />
                </span>
                <h3 className="text-lg font-bold text-rose-900">
                  Finance Payment Reversal
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#64766a]">
                Rule PY-05 Mandate: Recorded payments can only be reversed by Finance with a mandatory audit reason.
              </p>

              {reversalError && (
                <div className="mt-3 flex items-start gap-1.5 rounded-md bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{reversalError}</span>
                </div>
              )}

              <div className="mt-4 rounded-lg bg-rose-50/50 p-3 text-xs space-y-1 border border-rose-200">
                <p>
                  Receipt: <strong>{reversalPayment.receipt_no}</strong>
                </p>
                <p>
                  Amount to Reverse:{" "}
                  <strong className="text-rose-800 font-mono">
                    {formatINR(reversalPayment.amount)}
                  </strong>
                </p>
                <p>
                  Payer: <strong>{reversalPayment.payer_name}</strong>
                </p>
                <p className="text-[11px] text-[#64766a] mt-1">
                  Reversing this will write an offsetting Dr (Debit) entry to the ledger and increase the buyer&apos;s outstanding debt.
                </p>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-[#19392a]">
                  Mandatory Justification Reason *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Bank chargeback / Wrong party credit / Entry error verified by Finance"
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white p-2 text-xs text-[#19392a] focus:border-rose-600 focus:outline-hidden"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReversalPayment(null)}
                  className="rounded-md border border-[#dce5dd] px-3.5 py-2 text-xs font-medium text-[#64766a] hover:bg-[#f1f5f1]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!reversalReason.trim() || reverseMutation.isPending}
                  onClick={() =>
                    reverseMutation.mutate({
                      id: reversalPayment.id,
                      reason: reversalReason.trim(),
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-md bg-rose-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-800 disabled:opacity-50"
                >
                  {reverseMutation.isPending ? "Reversing..." : "Execute Reversal"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Receipt Modal */}
        {inspectingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-lg rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl">
              <button
                type="button"
                onClick={() => setInspectingPayment(null)}
                className="absolute right-4 top-4 text-[#64766a] hover:text-[#19392a]"
              >
                <X size={18} />
              </button>

              <div className="border-b border-[#dce5dd] pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#1b5e20]">
                      {inspectingPayment.receipt_no}
                    </span>
                    <h3 className="text-lg font-bold text-[#19392a]">
                      Payment Receipt Voucher
                    </h3>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getPaymentStatusBadge(
                      inspectingPayment.status,
                    )}`}
                  >
                    {inspectingPayment.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#64766a]">Payer (Debtor):</span>
                    <p className="font-semibold text-[#19392a]">
                      {inspectingPayment.payer_name}
                    </p>
                    <p className="text-[11px] text-[#64766a] uppercase">
                      {inspectingPayment.payer_tier}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#64766a]">Payee (Creditor):</span>
                    <p className="font-semibold text-[#19392a]">
                      {inspectingPayment.payee_name}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#dce5dd]">
                  <div>
                    <span className="text-[#64766a]">Amount Received:</span>
                    <p className="font-mono font-bold text-base text-[#1b5e20]">
                      {formatINR(inspectingPayment.amount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#64766a]">Payment Mode:</span>
                    <p className="font-semibold text-[#19392a]">
                      {inspectingPayment.mode}
                    </p>
                  </div>
                </div>

                {inspectingPayment.reference_no && (
                  <div>
                    <span className="text-[#64766a]">Reference / UTR / Cheque:</span>
                    <p className="font-mono font-semibold text-[#19392a]">
                      {inspectingPayment.reference_no}
                    </p>
                  </div>
                )}

                {inspectingPayment.allocations && inspectingPayment.allocations.length > 0 && (
                  <div className="pt-2 border-t border-[#dce5dd]">
                    <span className="text-[#64766a] font-semibold">Invoice Allocations:</span>
                    <div className="mt-1 space-y-1">
                      {inspectingPayment.allocations.map((a, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-md bg-[#f8faf8] px-2 py-1 text-xs"
                        >
                          <span className="font-mono text-[#19392a]">{a.invoice_number}</span>
                          <span className="font-mono font-bold text-[#1b5e20]">
                            {formatINR(a.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {inspectingPayment.remarks && (
                  <div className="pt-2 border-t border-[#dce5dd]">
                    <span className="text-[#64766a]">Remarks:</span>
                    <p className="text-[#19392a]">{inspectingPayment.remarks}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectingPayment(null)}
                  className="rounded-md border border-[#dce5dd] bg-white px-4 py-2 text-xs font-semibold text-[#19392a] hover:bg-[#f1f5f1]"
                >
                  Close Voucher
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Daily Cash Reconciliation Drawer */}
        {showCashReconDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <div className="relative h-full w-full max-w-md bg-white p-6 shadow-2xl flex flex-col overflow-y-auto">
              <button
                type="button"
                onClick={() => setShowCashReconDrawer(false)}
                className="absolute right-4 top-4 text-[#64766a] hover:text-[#19392a]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-100 p-2 text-amber-800">
                  <Banknote size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[#19392a]">
                    Cash Reconciliation
                  </h3>
                  <p className="text-xs text-[#64766a]">
                    Daily route collector cash vs bank handover verification
                  </p>
                </div>
              </div>

              <div className="mt-6 flex-1 space-y-4">
                {cashRecon.map((item) => (
                  <div
                    key={item.collector_id}
                    className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#19392a]">
                        {item.collector_name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.status === "BALANCED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md bg-[#f8faf8] p-2">
                        <span className="text-[#64766a] text-[11px]">Collected:</span>
                        <p className="font-mono font-bold text-[#19392a]">
                          {formatINR(item.collected_amount)}
                        </p>
                      </div>
                      <div className="rounded-md bg-[#f8faf8] p-2">
                        <span className="text-[#64766a] text-[11px]">Handed Over:</span>
                        <p className="font-mono font-bold text-[#1b5e20]">
                          {formatINR(item.handed_over_amount)}
                        </p>
                      </div>
                    </div>

                    {item.variance !== 0 && (
                      <div className="mt-2 text-[11px] text-red-600 font-semibold">
                        Shortage Variance: {formatINR(Math.abs(item.variance))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-[#dce5dd]">
                <button
                  type="button"
                  onClick={() => setShowCashReconDrawer(false)}
                  className="w-full rounded-md border border-[#dce5dd] py-2 text-xs font-semibold text-[#19392a] hover:bg-[#f1f5f1]"
                >
                  Close Reconciliation
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminShell>
    </RoleGuard>
  );
}
