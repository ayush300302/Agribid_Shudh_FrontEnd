"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  IndianRupee,
  Receipt,
  Search,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import { listCreditNotes } from "@/lib/invoice-api";
import type { CreditNote, CreditNoteReason } from "@/types/invoice";

function getReasonBadge(reason: CreditNoteReason) {
  switch (reason) {
    case "SHORTAGE":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "DAMAGE":
      return "bg-red-50 text-red-700 border-red-200";
    case "RETURN":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "SCHEME":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "PRICE_DIFF":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default function CreditNotesRegisterPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: creditNotes = [], isLoading } = useQuery({
    queryKey: ["credit-notes-all"],
    queryFn: () => listCreditNotes(),
  });

  const filtered = creditNotes.filter((cn) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      cn.credit_note_number.toLowerCase().includes(q) ||
      cn.invoice_number.toLowerCase().includes(q) ||
      cn.buyer_name.toLowerCase().includes(q) ||
      cn.order_number.toLowerCase().includes(q)
    );
  });

  const totalCredits = creditNotes.reduce((sum, cn) => sum + cn.total_adjusted, 0);

  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "distributor"]}>
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Link
              href="/admin/invoices"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64766a] transition-colors hover:text-[#1b5e20]"
            >
              <ArrowLeft size={14} /> Back to Invoices Console
            </Link>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-indigo-50 p-1.5 text-indigo-700">
                    <FileCheck size={20} />
                  </span>
                  <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                    GST Credit Notes Register
                  </h1>
                </div>
                <p className="mt-0.5 text-xs text-[#64766a]">
                  Section 34 CGST Act adjustments: shortage allowances, damaged stock credits, and scheme rebates.
                </p>
              </div>

              <div className="rounded-lg border border-[#dce5dd] bg-white px-4 py-2 text-right shadow-xs">
                <span className="text-[11px] font-semibold text-[#87958b] uppercase">
                  Total Adjustments Credited
                </span>
                <p className="text-lg font-black text-[#1b5e20]">
                  ₹{totalCredits.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#dce5dd] bg-white p-3 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#87958b]"
              />
              <input
                type="text"
                placeholder="Search by Credit Note #, Invoice #, Buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-[#cbd8ce] bg-white pl-9 pr-3 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
              />
            </div>

            <div className="text-xs text-[#64766a]">
              Showing <span className="font-semibold text-[#19392a]">{filtered.length}</span> credit notes
            </div>
          </div>

          {/* Credit Notes Table */}
          <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#19392a]">
                  <tr>
                    <th className="px-4 py-3.5">Credit Note #</th>
                    <th className="px-4 py-3.5">Tax Invoice Ref</th>
                    <th className="px-4 py-3.5">Order Ref</th>
                    <th className="px-4 py-3.5">Buyer Partner</th>
                    <th className="px-4 py-3.5">Adjustment Reason</th>
                    <th className="px-4 py-3.5 text-right">Taxable Adj (₹)</th>
                    <th className="px-4 py-3.5 text-right">GST Adj (5%)</th>
                    <th className="px-4 py-3.5 text-right">Total Credit (₹)</th>
                    <th className="px-4 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2ef]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#64766a]">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#1b5e20] border-t-transparent" />
                        <p className="mt-2 text-xs">Loading credit notes register...</p>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#64766a]">
                        <FileCheck size={32} className="mx-auto text-[#87958b]" />
                        <p className="mt-2 text-sm font-semibold text-[#19392a]">No credit notes issued</p>
                        <p className="text-xs mt-0.5">Issue a credit note from an individual invoice 360 page.</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((cn) => (
                      <tr key={cn.id} className="transition-colors hover:bg-[#f8faf8]">
                        <td className="px-4 py-3.5 font-bold text-[#19392a]">
                          {cn.credit_note_number}
                          <div className="text-[10px] text-[#87958b] mt-0.5">
                            {new Date(cn.created_at).toLocaleDateString("en-IN")}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px]">
                          <Link
                            href={`/admin/invoices/${cn.invoice_id}`}
                            className="text-[#1b5e20] hover:underline"
                          >
                            {cn.invoice_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-[#64766a]">
                          {cn.order_number}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-[#19392a]">
                          {cn.buyer_name}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getReasonBadge(
                              cn.reason,
                            )}`}
                          >
                            {cn.reason}
                          </span>
                          {cn.note && (
                            <p className="text-[10px] text-[#87958b] mt-0.5 truncate max-w-xs">
                              {cn.note}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-[#19392a]">
                          ₹{cn.amount?.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3.5 text-right text-[#64766a]">
                          ₹{cn.tax_adjusted?.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-[#1b5e20]">
                          ₹{cn.total_adjusted?.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 capitalize">
                            <CheckCircle2 size={11} /> {cn.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AdminShell>
    </RoleGuard>
  );
}

