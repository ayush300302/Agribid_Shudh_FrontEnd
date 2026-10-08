"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  IndianRupee,
  Layers,
  Printer,
  QrCode,
  Receipt,
  Search,
  Share2,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import { listCreditNotes, listInvoices } from "@/lib/invoice-api";
import type { Invoice, InvoiceStatus, IRNStatus } from "@/types/invoice";

function getIRNBadge(status: IRNStatus) {
  switch (status) {
    case "generated":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200 animate-pulse";
    case "failed":
      return "bg-red-50 text-red-700 border-red-200";
    case "cancelled":
      return "bg-gray-50 text-gray-700 border-gray-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

export default function InvoicesConsolePage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices-list"],
    queryFn: () => listInvoices(),
  });

  const { data: creditNotes = [] } = useQuery({
    queryKey: ["credit-notes-list"],
    queryFn: () => listCreditNotes(),
  });

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === "issued" && inv.status !== "issued") return false;
    if (activeTab === "paid" && inv.status !== "paid") return false;
    if (activeTab === "cancelled" && inv.status !== "cancelled") return false;
    if (activeTab === "irn_generated" && inv.irn_status !== "generated") return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchInv = inv.invoice_number.toLowerCase().includes(q);
      const matchOrd = inv.order_number.toLowerCase().includes(q);
      const matchBuyer = inv.buyer_name.toLowerCase().includes(q);
      const matchGstin = inv.buyer_gstin?.toLowerCase().includes(q) || false;
      return matchInv || matchOrd || matchBuyer || matchGstin;
    }
    return true;
  });

  // Metrics
  const totalTaxable = invoices.reduce((sum, i) => sum + i.taxable_amount, 0);
  const totalGst = invoices.reduce(
    (sum, i) => sum + i.cgst_total + i.sgst_total + i.igst_total,
    0,
  );
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.grand_total, 0);
  const eInvoicesCount = invoices.filter((i) => i.irn_status === "generated").length;

  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "distributor", "sub_distributor"]}>
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <Receipt size={20} />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                  Invoices & GST Compliance
                </h1>
              </div>
              <p className="mt-1 text-sm text-[#64766a]">
                GST tax invoicing, e-Invoice IRN registration, NIC e-Way bills, and credit notes ledger.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/invoices/credit-notes"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5dd] bg-white px-3.5 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1]"
              >
                <FileCheck size={14} className="text-[#1b5e20]" />
                Credit Notes ({creditNotes.length})
              </Link>
            </div>
          </div>

          {/* Compliance Metrics Bar */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs sm:grid-cols-4">
            <div className="border-r border-[#eef2ef] pr-4">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase tracking-wider">
                Total Invoiced (Gross)
              </span>
              <p className="mt-1 text-xl font-black text-[#19392a]">
                ₹{totalInvoiced.toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] text-[#64766a]">
                Across {invoices.length} commercial invoices
              </span>
            </div>

            <div className="border-r border-[#eef2ef] pr-4">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase tracking-wider">
                GST Tax Collected
              </span>
              <p className="mt-1 text-xl font-black text-[#1b5e20]">
                ₹{totalGst.toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] text-[#64766a]">
                CGST + SGST (2.5% each)
              </span>
            </div>

            <div className="border-r border-[#eef2ef] pr-4">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase tracking-wider">
                e-Invoices (IRN Active)
              </span>
              <p className="mt-1 text-xl font-black text-indigo-700">
                {eInvoicesCount} / {invoices.length}
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold">
                100% GSP Compliant
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[#87958b] uppercase tracking-wider">
                Active E-Way Bills
              </span>
              <p className="mt-1 text-xl font-black text-cyan-800">
                {invoices.filter((i) => i.eway_bill_number).length}
              </p>
              <span className="text-[10px] text-[#64766a]">
                Mandatory for &gt;₹50,000 transit
              </span>
            </div>
          </div>

          {/* Filter Status Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#dce5dd] pb-3">
            {[
              { id: "all", label: "All Invoices" },
              { id: "issued", label: "Issued & Unpaid" },
              { id: "paid", label: "Paid" },
              { id: "irn_generated", label: "e-Invoice (IRN Valid)" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#1b5e20] text-white shadow-xs"
                    : "bg-white text-[#64766a] border border-[#dce5dd] hover:bg-[#f1f5f1] hover:text-[#19392a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Actions Bar */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#dce5dd] bg-white p-3 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#87958b]"
              />
              <input
                type="text"
                placeholder="Search by Invoice #, Order #, Buyer Name, GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-[#cbd8ce] bg-white pl-9 pr-3 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
              />
            </div>

            <div className="text-xs text-[#64766a]">
              Showing <span className="font-semibold text-[#19392a]">{filteredInvoices.length}</span> invoices
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#19392a]">
                  <tr>
                    <th className="px-4 py-3.5">Invoice # & Date</th>
                    <th className="px-4 py-3.5">Order Ref</th>
                    <th className="px-4 py-3.5">Buyer Entity & GSTIN</th>
                    <th className="px-4 py-3.5">Place of Supply</th>
                    <th className="px-4 py-3.5 text-right">Taxable (₹)</th>
                    <th className="px-4 py-3.5 text-right">GST (₹)</th>
                    <th className="px-4 py-3.5 text-right">Invoice Total (₹)</th>
                    <th className="px-4 py-3.5 text-center">e-Invoice IRN</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2ef]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#64766a]">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#1b5e20] border-t-transparent" />
                        <p className="mt-2 text-xs">Loading tax invoices...</p>
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#64766a]">
                        <Receipt size={32} className="mx-auto text-[#87958b]" />
                        <p className="mt-2 text-sm font-semibold text-[#19392a]">No invoices found</p>
                        <p className="text-xs mt-0.5">Invoices are generated automatically when orders are PACKED.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="transition-colors hover:bg-[#f8faf8]">
                        {/* Invoice # & Date */}
                        <td className="px-4 py-3.5">
                          <Link
                            href={`/admin/invoices/${inv.id}`}
                            className="font-bold text-[#1b5e20] hover:underline"
                          >
                            {inv.invoice_number}
                          </Link>
                          <div className="text-[11px] text-[#87958b] mt-0.5">
                            {inv.invoice_date}
                          </div>
                        </td>

                        {/* Order Ref */}
                        <td className="px-4 py-3.5 font-mono text-[11px]">
                          <Link
                            href={`/admin/orders/${inv.order_id}`}
                            className="text-[#64766a] hover:text-[#1b5e20] hover:underline"
                          >
                            {inv.order_number}
                          </Link>
                        </td>

                        {/* Buyer Entity */}
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-[#19392a]">{inv.buyer_name}</div>
                          <div className="font-mono text-[11px] text-[#87958b] mt-0.5">
                            {inv.buyer_gstin || "Unregistered"}
                          </div>
                        </td>

                        {/* Place of Supply */}
                        <td className="px-4 py-3.5 text-[#64766a]">
                          {inv.place_of_supply}
                        </td>

                        {/* Taxable Value */}
                        <td className="px-4 py-3.5 text-right font-medium text-[#19392a]">
                          ₹{inv.taxable_amount?.toLocaleString("en-IN")}
                        </td>

                        {/* GST Split */}
                        <td className="px-4 py-3.5 text-right text-[#64766a]">
                          <span className="font-semibold text-[#19392a]">
                            ₹{(inv.cgst_total + inv.sgst_total + inv.igst_total)?.toLocaleString("en-IN")}
                          </span>
                          <div className="text-[10px] text-[#87958b]">
                            {inv.is_interstate ? "IGST 5%" : "CGST+SGST 5%"}
                          </div>
                        </td>

                        {/* Grand Total */}
                        <td className="px-4 py-3.5 text-right font-extrabold text-[#19392a]">
                          ₹{inv.grand_total?.toLocaleString("en-IN")}
                        </td>

                        {/* e-Invoice IRN status */}
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${getIRNBadge(
                              inv.irn_status,
                            )}`}
                          >
                            <QrCode size={11} /> {inv.irn_status}
                          </span>
                          {inv.eway_bill_number && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 rounded bg-cyan-50 px-1.5 py-0.2 text-[9px] font-semibold text-cyan-800 border border-cyan-200">
                                <Truck size={9} /> e-Way Bill
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/invoices/${inv.id}`}
                              className="inline-flex items-center gap-1 rounded bg-[#f1f5f1] px-2.5 py-1 text-[11px] font-semibold text-[#1b5e20] hover:bg-[#e1eae3] transition-colors"
                            >
                              <Eye size={12} /> View Tax Invoice
                            </Link>
                          </div>
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

