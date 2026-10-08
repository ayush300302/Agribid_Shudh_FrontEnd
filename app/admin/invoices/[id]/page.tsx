"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  Download,
  FileCheck,
  FileText,
  IndianRupee,
  MapPin,
  Printer,
  QrCode,
  Receipt,
  Send,
  Share2,
  ShieldCheck,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import {
  cancelInvoice,
  createCreditNote,
  generateEwayBill,
  getInvoiceById,
  shareInvoice,
} from "@/lib/invoice-api";
import type { CreditNoteReason, Invoice } from "@/types/invoice";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modals state
  const [showEwayModal, setShowEwayModal] = useState(false);
  const [ewayVehicle, setEwayVehicle] = useState("MH-12-RN-4421");
  const [ewayTransporter, setEwayTransporter] = useState("MahaAgro Logistics Express");

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareRecipient, setShareRecipient] = useState("+91 98220 12345");
  const [shareChannel, setShareChannel] = useState<"whatsapp" | "email" | "sms">("whatsapp");
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [cnReason, setCnReason] = useState<CreditNoteReason>("SHORTAGE");
  const [cnAmount, setCnAmount] = useState<number>(2000);
  const [cnNote, setCnNote] = useState("Transit shortage acknowledged during unloading");

  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Fetch Invoice Details
  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ["invoice-detail", id],
    queryFn: () => getInvoiceById(id),
  });

  // E-way bill mutation
  const ewayMutation = useMutation({
    mutationFn: () =>
      generateEwayBill(id, {
        vehicle_number: ewayVehicle,
        transporter_name: ewayTransporter,
      }),
    onSuccess: () => {
      setShowEwayModal(false);
      queryClient.invalidateQueries({ queryKey: ["invoice-detail", id] });
    },
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: () => shareInvoice(id, shareChannel, shareRecipient),
    onSuccess: (res) => {
      setShareMessage(res.message);
      setTimeout(() => {
        setShowShareModal(false);
        setShareMessage(null);
      }, 2000);
    },
  });

  // Credit note mutation
  const creditNoteMutation = useMutation({
    mutationFn: () =>
      createCreditNote({
        invoice_id: id,
        reason: cnReason,
        amount: cnAmount,
        note: cnNote,
      }),
    onSuccess: () => {
      setShowCreditNoteModal(false);
      router.push("/admin/invoices/credit-notes");
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: () => cancelInvoice(id, cancelReason),
    onSuccess: () => {
      setShowCancelModal(false);
      queryClient.invalidateQueries({ queryKey: ["invoice-detail", id] });
    },
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["admin", "state_stockist", "distributor"]}>
        <AdminShell>
          <div className="py-20 text-center text-xs text-[#64766a]">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#1b5e20] border-t-transparent" />
            <p className="mt-2 font-medium">Loading GST tax invoice...</p>
          </div>
        </AdminShell>
      </RoleGuard>
    );
  }

  if (!invoice) {
    return (
      <RoleGuard allowedRoles={["admin", "state_stockist", "distributor"]}>
        <AdminShell>
          <div className="rounded-xl border border-red-200 bg-white p-12 text-center shadow-xs">
            <AlertCircle size={36} className="mx-auto text-red-600" />
            <h2 className="mt-3 text-base font-bold text-[#19392a]">Invoice Not Found</h2>
            <p className="mt-1 text-xs text-[#64766a]">
              The requested invoice ID could not be located in the system.
            </p>
            <Link
              href="/admin/invoices"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19]"
            >
              Back to Invoices Console
            </Link>
          </div>
        </AdminShell>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "distributor"]}>
      <AdminShell>
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Top Actions & Navigation Bar - hidden on print */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <div>
              <Link
                href="/admin/invoices"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64766a] transition-colors hover:text-[#1b5e20]"
              >
                <ArrowLeft size={14} /> Back to Invoices Console
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <Receipt size={20} />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                  Tax Invoice · {invoice.invoice_number}
                </h1>
              </div>
              <p className="text-xs text-[#64766a] mt-0.5">
                Indian GST compliant B2B tax invoice with signed IRN and e-way bill.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] transition-colors"
              >
                <Printer size={14} /> Print Tax Invoice
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
              >
                <Share2 size={14} className="text-[#1b5e20]" /> Share
              </button>

              {!invoice.eway_bill_number && (
                <button
                  type="button"
                  onClick={() => setShowEwayModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-cyan-300 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-900 shadow-xs hover:bg-cyan-100 transition-colors"
                >
                  <Truck size={14} /> Generate E-Way Bill
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowCreditNoteModal(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-semibold text-[#64766a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
              >
                <FileCheck size={14} /> Issue Credit Note
              </button>
            </div>
          </div>

          {/* Formal Indian GST Tax Invoice Document */}
          <div className="rounded-xl border border-[#dce5dd] bg-white p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
            {/* 1. Header Banner */}
            <div className="border-b-2 border-[#19392a] pb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-md bg-[#1b5e20] text-sm font-bold text-white">
                    AS
                  </span>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#19392a]">
                      {invoice.seller_name}
                    </h2>
                    <p className="text-xs text-[#64766a]">
                      {invoice.seller_trade_name || "Agribid Shudh Authorized Supply Network"}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-[#64766a] space-y-0.5">
                  <p>{invoice.seller_address.line1}, {invoice.seller_address.city} - {invoice.seller_address.pincode}</p>
                  <p>
                    <span className="font-semibold text-[#19392a]">GSTIN:</span> {invoice.seller_gstin} · <span className="font-semibold text-[#19392a]">PAN:</span> {invoice.seller_pan} · <span className="font-semibold text-[#19392a]">State:</span> {invoice.seller_state_code} (Maharashtra)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block rounded bg-[#19392a] px-3 py-1 text-xs font-black tracking-widest text-white uppercase">
                  TAX INVOICE
                </span>
                <p className="mt-1 text-[11px] font-semibold text-[#87958b] uppercase">
                  Original for Recipient
                </p>
                <div className="mt-2 text-xs text-[#19392a] font-medium space-y-0.5">
                  <p>
                    <span className="text-[#87958b]">Invoice No:</span> <strong className="font-mono text-sm text-[#1b5e20]">{invoice.invoice_number}</strong>
                  </p>
                  <p>
                    <span className="text-[#87958b]">Invoice Date:</span> {invoice.invoice_date}
                  </p>
                  <p>
                    <span className="text-[#87958b]">Payment Due Date:</span> {invoice.due_date}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. e-Invoice IRN & NIC e-Way Bill Bar */}
            {invoice.irn && (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                    <QrCode size={16} className="text-indigo-700" />
                    <span>Govt. e-Invoice IRN (Ack #{invoice.ack_no})</span>
                  </div>
                  <p className="font-mono text-[10px] text-indigo-900 break-all">
                    {invoice.irn}
                  </p>
                  <p className="text-[10px] text-[#64766a]">
                    Ack Date: {invoice.ack_date} · Digitally signed by GST Suvidha Provider (GSP)
                  </p>
                </div>

                {invoice.eway_bill_number && (
                  <div className="border-t sm:border-t-0 sm:border-l border-indigo-200 sm:pl-4 pt-2 sm:pt-0 shrink-0 text-right">
                    <span className="font-bold text-cyan-900 flex items-center gap-1 justify-end">
                      <Truck size={13} /> E-Way Bill: {invoice.eway_bill_number}
                    </span>
                    <p className="text-[11px] text-[#64766a]">
                      Vehicle: {invoice.vehicle_number || "MH-12-RN-4421"}
                    </p>
                    <p className="text-[10px] text-[#87958b]">
                      Valid Upto: {invoice.eway_valid_upto}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 3. Bilateral Parties Information */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-lg border border-[#dce5dd] p-4 text-xs">
              {/* Buyer / Recipient Details */}
              <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-[#eef2ef] pb-3 sm:pb-0 sm:pr-4">
                <span className="text-[11px] font-bold text-[#87958b] uppercase tracking-wider">
                  Billed To / Recipient:
                </span>
                <p className="text-sm font-bold text-[#19392a]">{invoice.buyer_name}</p>
                <p className="text-[#64766a]">{invoice.buyer_address.line1}, {invoice.buyer_address.city} - {invoice.buyer_address.pincode}</p>
                <div className="pt-1 text-[#19392a] space-y-0.5">
                  <p><span className="text-[#87958b]">GSTIN:</span> <strong className="font-mono">{invoice.buyer_gstin || "Unregistered"}</strong></p>
                  <p><span className="text-[#87958b]">State:</span> {invoice.buyer_state_code} (Maharashtra)</p>
                </div>
              </div>

              {/* Shipped To & Logistics Reference */}
              <div className="space-y-1.5 sm:pl-2">
                <span className="text-[11px] font-bold text-[#87958b] uppercase tracking-wider">
                  Shipped To & Order Details:
                </span>
                <p className="text-sm font-semibold text-[#19392a]">{invoice.buyer_name} (Mandi Godown)</p>
                <p className="text-[#64766a]">{invoice.buyer_address.line1}, {invoice.buyer_address.city}</p>
                <div className="pt-1 text-[#19392a] space-y-0.5">
                  <p><span className="text-[#87958b]">Purchase Order #:</span> <strong className="font-mono">{invoice.order_number}</strong></p>
                  <p><span className="text-[#87958b]">Place of Supply:</span> <strong>{invoice.place_of_supply}</strong></p>
                  <p><span className="text-[#87958b]">Reverse Charge Applicable:</span> No</p>
                </div>
              </div>
            </div>

            {/* 4. HSN Commodity Lines Table */}
            <div className="overflow-hidden rounded-lg border border-[#dce5dd]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f1f5f1] font-semibold text-[#19392a] border-b border-[#dce5dd]">
                  <tr>
                    <th className="px-3 py-2.5 text-center w-8">#</th>
                    <th className="px-3 py-2.5">Commodity Description</th>
                    <th className="px-3 py-2.5 text-center">HSN Code</th>
                    <th className="px-3 py-2.5 text-center">Qty</th>
                    <th className="px-3 py-2.5 text-right">Unit Rate (₹)</th>
                    <th className="px-3 py-2.5 text-right">Taxable Amt (₹)</th>
                    <th className="px-3 py-2.5 text-right">CGST (2.5%)</th>
                    <th className="px-3 py-2.5 text-right">SGST (2.5%)</th>
                    <th className="px-3 py-2.5 text-right">Line Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2ef]">
                  {invoice.lines.map((line, idx) => (
                    <tr key={line.id} className="hover:bg-[#fafbfa]">
                      <td className="px-3 py-3 text-center text-[#87958b]">{idx + 1}</td>
                      <td className="px-3 py-3">
                        <p className="font-bold text-[#19392a]">{line.product_name}</p>
                        <p className="font-mono text-[10px] text-[#87958b]">SKU: {line.sku}</p>
                      </td>
                      <td className="px-3 py-3 text-center font-mono">{line.hsn_code}</td>
                      <td className="px-3 py-3 text-center font-semibold">
                        {line.quantity} {line.uom}
                      </td>
                      <td className="px-3 py-3 text-right">₹{line.unit_price?.toLocaleString("en-IN")}</td>
                      <td className="px-3 py-3 text-right font-medium">
                        ₹{line.taxable_amount?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-3 text-right text-[#64766a]">
                        ₹{line.cgst_amount?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-3 text-right text-[#64766a]">
                        ₹{line.sgst_amount?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-[#19392a]">
                        ₹{line.line_total?.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 5. Financial Summary & Amount in Words */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-[#87958b] uppercase">
                    Total Amount in Words:
                  </span>
                  <p className="mt-1 font-semibold text-[#19392a] bg-[#f8faf8] p-2.5 rounded border border-[#eef2ef]">
                    {invoice.amount_in_words}
                  </p>
                </div>

                <div className="rounded border border-[#dce5dd] p-3 text-[11px] space-y-1">
                  <p className="font-bold text-[#19392a]">Bank Settlement Details (RTGS / NEFT):</p>
                  <p><span className="text-[#87958b]">Bank Name:</span> State Bank of India</p>
                  <p><span className="text-[#87958b]">A/C Number:</span> 4099182390124 (Current A/C)</p>
                  <p><span className="text-[#87958b]">IFSC Code:</span> SBIN0001824 · MIDC Bhosari Branch</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#64766a]">
                  <span>Total Taxable Amount (Ex-GST):</span>
                  <span className="font-semibold text-[#19392a]">
                    ₹{invoice.taxable_amount?.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-[#64766a]">
                  <span>Central GST (CGST 2.5%):</span>
                  <span className="font-semibold text-[#19392a]">
                    ₹{invoice.cgst_total?.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-[#64766a]">
                  <span>State GST (SGST 2.5%):</span>
                  <span className="font-semibold text-[#19392a]">
                    ₹{invoice.sgst_total?.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-[#64766a]">
                  <span>Round Off:</span>
                  <span className="font-semibold text-[#19392a]">
                    ₹{invoice.round_off?.toFixed(2)}
                  </span>
                </div>

                <div className="border-t-2 border-[#19392a] pt-2 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-[#19392a]">
                    Invoice Grand Total:
                  </span>
                  <span className="text-xl font-black text-[#1b5e20]">
                    ₹{invoice.grand_total?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Legal Footer & Signatory Block */}
            <div className="mt-8 pt-6 border-t border-[#dce5dd] flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 text-xs text-[#64766a]">
              <div>
                <p className="font-semibold text-[#19392a]">Terms & Conditions:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-[#87958b] mt-1">
                  <li>Goods once sold will not be taken back without an authorized Credit Note.</li>
                  <li>Interest @ 18% p.a. will be levied on overdue invoices beyond credit period.</li>
                  <li>Disputes subject to Pune / Maharashtra jurisdiction only.</li>
                </ol>
              </div>

              <div className="text-right">
                <p className="font-semibold text-[#19392a]">For {invoice.seller_name}</p>
                <div className="mt-8 border-b border-[#cbd8ce] w-48 ml-auto" />
                <p className="mt-1 text-[11px] font-medium text-[#19392a]">
                  Authorized Signatory (Digital Stamp)
                </p>
                <p className="text-[10px] text-[#87958b]">This is a computer generated tax invoice.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Generate E-Way Bill */}
        {showEwayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-cyan-200 bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div className="flex items-center gap-2 text-cyan-800">
                  <Truck size={20} />
                  <h3 className="text-base font-bold text-[#19392a]">Generate NIC E-Way Bill</h3>
                </div>
                <button
                  onClick={() => setShowEwayModal(false)}
                  className="rounded p-1 text-[#87958b] hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Vehicle Registration Number *
                  </label>
                  <input
                    type="text"
                    value={ewayVehicle}
                    onChange={(e) => setEwayVehicle(e.target.value)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-cyan-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Transporter Fleet Name *
                  </label>
                  <input
                    type="text"
                    value={ewayTransporter}
                    onChange={(e) => setEwayTransporter(e.target.value)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-cyan-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef2ef] pt-4">
                <button
                  type="button"
                  onClick={() => setShowEwayModal(false)}
                  className="rounded-md border border-[#cbd8ce] px-4 py-2 text-xs font-semibold text-[#64766a] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => ewayMutation.mutate()}
                  disabled={ewayMutation.isPending}
                  className="rounded-md bg-cyan-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-cyan-800 disabled:opacity-50"
                >
                  {ewayMutation.isPending ? "Generating..." : "Generate E-Way Bill"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Share Invoice */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div className="flex items-center gap-2 text-[#1b5e20]">
                  <Share2 size={20} />
                  <h3 className="text-base font-bold text-[#19392a]">Share Tax Invoice</h3>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="rounded p-1 text-[#87958b] hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              {shareMessage ? (
                <div className="p-4 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} /> {shareMessage}
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#3b4c40] mb-1">
                      Dispatch Channel
                    </label>
                    <div className="flex gap-2">
                      {(["whatsapp", "email", "sms"] as const).map((ch) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => setShareChannel(ch)}
                          className={`flex-1 rounded-md py-1.5 text-xs font-semibold capitalize border transition-colors ${
                            shareChannel === ch
                              ? "bg-[#1b5e20] text-white border-[#1b5e20]"
                              : "bg-white text-[#64766a] border-[#cbd8ce] hover:bg-gray-50"
                          }`}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#3b4c40] mb-1">
                      Recipient Mobile / Email *
                    </label>
                    <input
                      type="text"
                      value={shareRecipient}
                      onChange={(e) => setShareRecipient(e.target.value)}
                      className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 border-t border-[#eef2ef] pt-4">
                    <button
                      type="button"
                      onClick={() => setShowShareModal(false)}
                      className="rounded-md border border-[#cbd8ce] px-4 py-2 text-xs font-semibold text-[#64766a] hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => shareMutation.mutate()}
                      disabled={shareMutation.isPending}
                      className="rounded-md bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50"
                    >
                      {shareMutation.isPending ? "Sending..." : "Send Invoice Link"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Issue Credit Note */}
        {showCreditNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div className="flex items-center gap-2 text-indigo-700">
                  <FileCheck size={20} />
                  <h3 className="text-base font-bold text-[#19392a]">Issue GST Credit Note</h3>
                </div>
                <button
                  onClick={() => setShowCreditNoteModal(false)}
                  className="rounded p-1 text-[#87958b] hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Reason for Adjustment *
                  </label>
                  <select
                    value={cnReason}
                    onChange={(e) => setCnReason(e.target.value as CreditNoteReason)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-indigo-600"
                  >
                    <option value="SHORTAGE">Goods Shortage on Delivery</option>
                    <option value="DAMAGE">Damaged / Defective Stock</option>
                    <option value="RETURN">Customer Return Acknowledged</option>
                    <option value="PRICE_DIFF">Rate Difference / Correction</option>
                    <option value="SCHEME">Trade Scheme Volume Kickback</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Ex-GST Credit Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={cnAmount}
                    onChange={(e) => setCnAmount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-indigo-600 font-bold"
                  />
                  <p className="mt-1 text-[11px] text-[#64766a]">
                    Tax of 5% (₹{(cnAmount * 0.05).toFixed(2)}) will be credited automatically. Total credit: ₹{(cnAmount * 1.05).toFixed(2)}.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Remarks / Mandi Notes
                  </label>
                  <textarea
                    rows={2}
                    value={cnNote}
                    onChange={(e) => setCnNote(e.target.value)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef2ef] pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreditNoteModal(false)}
                  className="rounded-md border border-[#cbd8ce] px-4 py-2 text-xs font-semibold text-[#64766a] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => creditNoteMutation.mutate()}
                  disabled={creditNoteMutation.isPending}
                  className="rounded-md bg-indigo-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-800 disabled:opacity-50"
                >
                  {creditNoteMutation.isPending ? "Issuing..." : "Issue Credit Note"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminShell>
    </RoleGuard>
  );
}

