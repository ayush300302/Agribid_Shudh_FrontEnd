"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  HelpCircle,
  IndianRupee,
  Package,
  Plus,
  Send,
  ShieldAlert,
  ShoppingBag,
  Trash2,
  Truck,
  UserCheck,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import { listPartners } from "@/lib/partner-api";
import { listProducts } from "@/lib/catalog-api";
import { placeOnBehalfOrder } from "@/lib/order-api";
import type { Partner } from "@/types/partner";
import type { Product } from "@/types/catalog";
import type { PaymentMode } from "@/types/order";

interface SelectedLine {
  productId: string;
  sku: string;
  productName: string;
  uom: string;
  hsnCode: string;
  unitPrice: number; // ex-GST
  quantity: number;
}

export default function NewAssistedOrderPage() {
  const router = useRouter();

  // Queries for partners and products
  const { data: partnersData, isLoading: loadingPartners } = useQuery({
    queryKey: ["partners", "downline-for-orders"],
    queryFn: () => listPartners({ pageSize: 50 }),
  });

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "active-catalog"],
    queryFn: () => listProducts({ status: "active", pageSize: 50 }),
  });

  const partners = partnersData?.partners || [];
  const products = productsData?.products || [];

  // Form state
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("credit");
  const [creditOverrideReason, setCreditOverrideReason] = useState<string>("");
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");
  const [addressLine1, setAddressLine1] = useState<string>("");
  const [addressCity, setAddressCity] = useState<string>("");
  const [addressState, setAddressState] = useState<string>("Maharashtra");
  const [addressPincode, setAddressPincode] = useState<string>("");

  // Line items state
  const [lines, setLines] = useState<SelectedLine[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Active buyer partner object
  const activeBuyer: Partner | undefined = partners.find(
    (p) => p.id === selectedBuyerId,
  );

  // When buyer is selected, auto-populate address
  const handleBuyerChange = (buyerId: string) => {
    setSelectedBuyerId(buyerId);
    const buyer = partners.find((p) => p.id === buyerId);
    if (buyer) {
      setAddressLine1(buyer.address?.line1 || "APMC Yard Shop");
      setAddressCity(buyer.address?.city || "Nashik");
      setAddressState(buyer.address?.state || "Maharashtra");
      setAddressPincode(buyer.address?.pincode || "422003");
    }
  };

  // Add line item
  const handleAddLine = () => {
    if (products.length === 0) return;
    const defaultProduct = products[0];
    const unitPrice = defaultProduct.mrp
      ? Math.round(defaultProduct.mrp * 0.85)
      : 2000;

    setLines((prev) => [
      ...prev,
      {
        productId: defaultProduct.id,
        sku: defaultProduct.sku,
        productName: defaultProduct.name,
        uom: defaultProduct.uom || "BAG",
        hsnCode: defaultProduct.hsn_code,
        unitPrice,
        quantity: 10,
      },
    ]);
  };

  // Update line product
  const handleLineProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const unitPrice = prod.mrp ? Math.round(prod.mrp * 0.85) : 2000;

    setLines((prev) =>
      prev.map((line, i) =>
        i === index
          ? {
              ...line,
              productId: prod.id,
              sku: prod.sku,
              productName: prod.name,
              uom: prod.uom || "BAG",
              hsnCode: prod.hsn_code,
              unitPrice,
            }
          : line,
      ),
    );
  };

  // Update line quantity
  const handleLineQtyChange = (index: number, quantity: number) => {
    setLines((prev) =>
      prev.map((line, i) =>
        i === index ? { ...line, quantity: Math.max(1, quantity) } : line,
      ),
    );
  };

  // Update line price
  const handleLinePriceChange = (index: number, price: number) => {
    setLines((prev) =>
      prev.map((line, i) =>
        i === index ? { ...line, unitPrice: Math.max(0, price) } : line,
      ),
    );
  };

  // Remove line item
  const handleRemoveLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate totals
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  // 5% standard GST on agricultural grains/oils
  const gstRate = 5;
  const totalGst = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = subtotal + totalGst;

  // Credit limits simulation (Rule OR-04)
  const simulatedCreditLimit = 150000;
  const simulatedAvailableCredit = 45000;
  const isCreditExceeded =
    paymentMode === "credit" && grandTotal > simulatedAvailableCredit;

  // Mutation for creating order
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBuyerId) {
        throw new Error("Please select a partner to place the order for.");
      }
      if (lines.length === 0) {
        throw new Error("Please add at least one SKU line item to the order.");
      }
      if (isCreditExceeded && creditOverrideReason.trim().length < 10) {
        throw new Error(
          "Credit override justification is required (minimum 10 characters) as order exceeds available credit.",
        );
      }

      return placeOnBehalfOrder({
        buyer_id: selectedBuyerId,
        payment_mode: paymentMode,
        credit_override_reason: isCreditExceeded
          ? creditOverrideReason
          : undefined,
        notes: deliveryNotes,
        delivery_address: {
          line1: addressLine1,
          city: addressCity,
          state: addressState,
          pincode: addressPincode,
        },
        lines: lines.map((l) => ({
          product_id: l.productId,
          quantity: l.quantity,
        })),
      });
    },
    onSuccess: (newOrder) => {
      router.push(`/admin/orders/${newOrder.id}`);
    },
    onError: (err: any) => {
      setSubmitError(
        err.message || "Failed to create assisted order. Please try again.",
      );
    },
  });

  return (
    <RoleGuard
      allowedRoles={["admin", "state_stockist", "distributor"]}
    >
      <AdminShell>
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Top Breadcrumb & Navigation */}
          <div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64766a] transition-colors hover:text-[#1b5e20]"
            >
              <ArrowLeft size={14} /> Back to Master Orders Console
            </Link>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-indigo-50 p-1.5 text-indigo-700">
                    <UserCheck size={20} />
                  </span>
                  <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                    Create Assisted Purchase Order (On Behalf)
                  </h1>
                </div>
                <p className="mt-1 text-sm text-[#64766a]">
                  Act on behalf of downstream retailers or sub-distributors to raise purchase orders under Rule OBO-01 & OBO-02.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 text-xs font-medium text-indigo-800">
                <ShieldAlert size={15} />
                <span>24-Hour Partner Auto-Confirm Policy</span>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800 flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Submission Error</p>
                <p className="mt-0.5">{submitError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left 2 Columns: Order Creation Form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Step 1: Select Child Partner */}
              <div className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1b5e20] text-xs font-bold text-white">
                      1
                    </span>
                    <h2 className="text-base font-semibold text-[#19392a]">
                      Select Buyer Partner
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-[#64766a]">
                    Rule OR-01 Bound to Parent
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3b4c40] mb-1.5">
                      Downline Partner Account *
                    </label>
                    <select
                      value={selectedBuyerId}
                      onChange={(e) => handleBuyerChange(e.target.value)}
                      disabled={loadingPartners}
                      className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-sm text-[#19392a] outline-none transition-colors focus:border-[#1b5e20]"
                    >
                      <option value="">-- Choose Partner Account --</option>
                      {partners.map((partner) => (
                        <option key={partner.id} value={partner.id}>
                          {partner.business_name} ({partner.code}) - {partner.type.replace("_", " ").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeBuyer && (
                    <div className="rounded-lg border border-[#e1eae3] bg-[#f8faf8] p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-[#1b5e20]" />
                          <span className="text-sm font-semibold text-[#19392a]">
                            {activeBuyer.business_name}
                          </span>
                        </div>
                        <span className="rounded bg-[#1b5e20]/10 px-2 py-0.5 text-[11px] font-semibold text-[#1b5e20] uppercase">
                          {activeBuyer.type.replace("_", " ")}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-[#64766a]">
                        <div>
                          <span className="text-[#87958b]">GSTIN:</span>{" "}
                          <span className="font-mono font-medium text-[#19392a]">
                            {activeBuyer.gstin || "Unregistered"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#87958b]">City / State:</span>{" "}
                          <span className="font-medium text-[#19392a]">
                            {activeBuyer.address?.city},{" "}
                            {activeBuyer.address?.state}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#87958b]">Direct Parent:</span>{" "}
                          <span className="font-medium text-[#19392a]">
                            {activeBuyer.parent_name || "Maharashtra Agro Hub Pvt Ltd"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#87958b]">KYC Status:</span>{" "}
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <CheckCircle2 size={12} /> {activeBuyer.kyc_status}
                          </span>
                        </div>
                      </div>

                      {/* Credit Status Snapshot */}
                      <div className="mt-2 rounded border border-blue-200 bg-blue-50/50 p-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-blue-900 flex items-center gap-1">
                            <CreditCard size={13} /> Credit Facility
                          </span>
                          <span className="font-semibold text-blue-900">
                            Available: ₹{simulatedAvailableCredit.toLocaleString("en-IN")} / Limit: ₹{simulatedCreditLimit.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Line Items & SKU Selector */}
              <div className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1b5e20] text-xs font-bold text-white">
                      2
                    </span>
                    <h2 className="text-base font-semibold text-[#19392a]">
                      Commodity SKU Line Items
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="inline-flex items-center gap-1 rounded-md bg-[#1b5e20] px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#154a19]"
                  >
                    <Plus size={14} /> Add Product Line
                  </button>
                </div>

                <div className="mt-4">
                  {lines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#dce5dd] py-8 text-center">
                      <ShoppingBag size={28} className="text-[#87958b]" />
                      <p className="mt-2 text-sm font-semibold text-[#19392a]">
                        No product lines added
                      </p>
                      <p className="text-xs text-[#64766a] mt-0.5">
                        Click "Add Product Line" to pick wholesale commodities from catalog.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddLine}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#f1f5f1] px-3 py-1.5 text-xs font-semibold text-[#1b5e20] hover:bg-[#e2ebe3]"
                      >
                        <Plus size={14} /> Add First SKU
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lines.map((line, idx) => {
                        const lineSubtotal = line.unitPrice * line.quantity;
                        const lineGst = Math.round(lineSubtotal * 0.05 * 100) / 100;
                        const lineTotal = lineSubtotal + lineGst;

                        return (
                          <div
                            key={idx}
                            className="rounded-lg border border-[#e1eae3] bg-[#fafbfa] p-3.5 space-y-3 transition-colors hover:border-[#cbd8ce]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <label className="block text-[11px] font-semibold text-[#64766a] mb-1">
                                  Select SKU
                                </label>
                                <select
                                  value={line.productId}
                                  onChange={(e) =>
                                    handleLineProductChange(
                                      idx,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full rounded-md border border-[#cbd8ce] bg-white px-2.5 py-1.5 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                                >
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} ({p.sku}) · UOM: {p.uom || "BAG"}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveLine(idx)}
                                className="mt-5 rounded p-1.5 text-[#87958b] hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Remove line item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                              <div>
                                <label className="block text-[11px] font-semibold text-[#64766a] mb-1">
                                  Quantity ({line.uom})
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  value={line.quantity}
                                  onChange={(e) =>
                                    handleLineQtyChange(
                                      idx,
                                      parseInt(e.target.value) || 1,
                                    )
                                  }
                                  className="w-full rounded-md border border-[#cbd8ce] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#19392a] outline-none focus:border-[#1b5e20]"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-[#64766a] mb-1">
                                  Wholesale Rate (₹ ex-GST)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={line.unitPrice}
                                  onChange={(e) =>
                                    handleLinePriceChange(
                                      idx,
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full rounded-md border border-[#cbd8ce] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#19392a] outline-none focus:border-[#1b5e20]"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-[#64766a] mb-1">
                                  GST (5%)
                                </label>
                                <div className="h-8.5 flex items-center text-xs font-medium text-[#64766a]">
                                  ₹{lineGst.toLocaleString("en-IN")}
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-[#64766a] mb-1">
                                  Line Total (Inc. GST)
                                </label>
                                <div className="h-8.5 flex items-center text-xs font-bold text-[#19392a]">
                                  ₹{lineTotal.toLocaleString("en-IN")}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Delivery Details & Special Instructions */}
              <div className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 border-b border-[#eef2ef] pb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1b5e20] text-xs font-bold text-white">
                    3
                  </span>
                  <h2 className="text-base font-semibold text-[#19392a]">
                    Delivery Location & Logistics
                  </h2>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#3b4c40] mb-1">
                      Street Address / Mandi Shop # *
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="e.g. Shop #14 APMC Market Yard"
                      className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-1.5 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3b4c40] mb-1">
                      City / Mandi Hub *
                    </label>
                    <input
                      type="text"
                      value={addressCity}
                      onChange={(e) => setAddressCity(e.target.value)}
                      className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-1.5 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3b4c40] mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={addressPincode}
                      onChange={(e) => setAddressPincode(e.target.value)}
                      className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-1.5 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#3b4c40] mb-1">
                      Unloading Instructions / Field Sales Notes
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="e.g. Unload at godown gate #2. Call owner Ramesh 30 min before arrival."
                      className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Payment Terms & Credit Override */}
              <div className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 border-b border-[#eef2ef] pb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1b5e20] text-xs font-bold text-white">
                    4
                  </span>
                  <h2 className="text-base font-semibold text-[#19392a]">
                    Payment Mode & Commercial Terms
                  </h2>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <label
                      className={`flex cursor-pointer flex-col rounded-lg border p-3.5 transition-colors ${
                        paymentMode === "credit"
                          ? "border-[#1b5e20] bg-[#1b5e20]/5 ring-1 ring-[#1b5e20]"
                          : "border-[#dce5dd] bg-white hover:bg-[#f8faf8]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_mode"
                        value="credit"
                        checked={paymentMode === "credit"}
                        onChange={() => setPaymentMode("credit")}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#19392a]">
                          Credit Account
                        </span>
                        <CreditCard size={15} className="text-[#1b5e20]" />
                      </div>
                      <p className="mt-1 text-[11px] text-[#64766a]">
                        Deducted from approved credit limit ledger.
                      </p>
                    </label>

                    <label
                      className={`flex cursor-pointer flex-col rounded-lg border p-3.5 transition-colors ${
                        paymentMode === "pod"
                          ? "border-[#1b5e20] bg-[#1b5e20]/5 ring-1 ring-[#1b5e20]"
                          : "border-[#dce5dd] bg-white hover:bg-[#f8faf8]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_mode"
                        value="pod"
                        checked={paymentMode === "pod"}
                        onChange={() => setPaymentMode("pod")}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#19392a]">
                          Pay on Delivery (POD)
                        </span>
                        <Truck size={15} className="text-[#1b5e20]" />
                      </div>
                      <p className="mt-1 text-[11px] text-[#64766a]">
                        Settled via Cash / RTGS upon goods physical delivery.
                      </p>
                    </label>

                    <label
                      className={`flex cursor-pointer flex-col rounded-lg border p-3.5 transition-colors ${
                        paymentMode === "online"
                          ? "border-[#1b5e20] bg-[#1b5e20]/5 ring-1 ring-[#1b5e20]"
                          : "border-[#dce5dd] bg-white hover:bg-[#f8faf8]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_mode"
                        value="online"
                        checked={paymentMode === "online"}
                        onChange={() => setPaymentMode("online")}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#19392a]">
                          Online Gateway
                        </span>
                        <IndianRupee size={15} className="text-[#1b5e20]" />
                      </div>
                      <p className="mt-1 text-[11px] text-[#64766a]">
                        Instant UPI / NetBanking payment link for partner.
                      </p>
                    </label>
                  </div>

                  {/* Rule OR-09: Credit Limit Exceeded Override */}
                  {isCreditExceeded && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <ShieldAlert size={18} className="text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-amber-900">
                            Rule OR-09: Credit Limit Exceeded (Available ₹{simulatedAvailableCredit.toLocaleString("en-IN")} vs Total ₹{grandTotal.toLocaleString("en-IN")})
                          </p>
                          <p className="mt-0.5 text-xs text-amber-800">
                            This order exceeds the partner's available credit facility. An administrative override reason (min 10 characters) is required to proceed.
                          </p>
                        </div>
                      </div>

                      <div className="mt-2">
                        <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                          Credit Override Justification *
                        </label>
                        <input
                          type="text"
                          value={creditOverrideReason}
                          onChange={(e) => setCreditOverrideReason(e.target.value)}
                          placeholder="e.g. Approved by State Head Rahul Joshi pending cheque clearance"
                          className="w-full rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs text-[#19392a] outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Place PO */}
            <div className="space-y-6">
              <div className="sticky top-6 rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs space-y-5">
                <div className="border-b border-[#eef2ef] pb-3">
                  <h3 className="text-base font-bold text-[#19392a]">
                    Commercial Summary
                  </h3>
                  <p className="text-xs text-[#64766a]">
                    Live tax calculation as per Indian GST Schedule
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#64766a]">
                    <span>Item Lines</span>
                    <span className="font-semibold text-[#19392a]">
                      {lines.length} items ({lines.reduce((s, l) => s + l.quantity, 0)} units)
                    </span>
                  </div>

                  <div className="flex justify-between text-[#64766a]">
                    <span>Subtotal (Ex-GST)</span>
                    <span className="font-semibold text-[#19392a]">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#64766a]">
                    <span>GST (CGST 2.5% + SGST 2.5%)</span>
                    <span className="font-semibold text-[#19392a]">
                      ₹{totalGst.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="border-t border-[#eef2ef] pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[#19392a]">
                      Grand Total
                    </span>
                    <span className="text-xl font-extrabold text-[#1b5e20]">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Assisted Notice */}
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 text-xs space-y-1.5 text-indigo-950">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <UserCheck size={14} /> Assisted Order Notice
                  </div>
                  <p className="text-[11px] leading-relaxed text-indigo-800">
                    Order will be flagged as <strong>Assisted (On-Behalf)</strong>. The partner will receive an automated SMS/Push notification with full details.
                  </p>
                </div>

                {/* Submit Action Button */}
                <button
                  type="button"
                  onClick={() => createOrderMutation.mutate()}
                  disabled={createOrderMutation.isPending || !selectedBuyerId || lines.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-[#1b5e20] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#154a19] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b5e20]"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Placing Assisted Order...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Place Order On Behalf</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-[#87958b]">
                  Generates unique Order # under Idempotency Key validation
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminShell>
    </RoleGuard>
  );
}
