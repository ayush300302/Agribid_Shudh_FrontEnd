"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  IndianRupee,
  Layers,
  Percent,
  Save,
  ShieldAlert,
  ShieldCheck,
  Tag,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import {
  calculatePriceQuote,
  getPriceListById,
  reviewPriceList,
  updatePriceListItems,
} from "@/lib/pricing-api";
import type { PriceListItem, PriceQuoteResult } from "@/types/pricing";

function PriceListDetailContent({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState<"matrix" | "simulator">("matrix");
  const [reviewing, setReviewing] = useState(false);
  const [savingMatrix, setSavingMatrix] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  // Editable items state
  const [editableItems, setEditableItems] = useState<PriceListItem[]>([]);

  // Simulator state
  const [simSkuId, setSimSkuId] = useState<string>("prod-1");
  const [simQty, setSimQty] = useState<number>(55);
  const [simSellerState, setSimSellerState] = useState<string>("27"); // MH
  const [simBuyerState, setSimBuyerState] = useState<string>("27"); // MH
  const [simResult, setSimResult] = useState<PriceQuoteResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Queries
  const priceListQuery = useQuery({
    queryKey: ["price-list", id],
    queryFn: async () => {
      const data = await getPriceListById(id);
      setEditableItems(data.items);
      return data;
    },
  });

  const priceList = priceListQuery.data?.price_list;
  const items = editableItems.length > 0 ? editableItems : priceListQuery.data?.items || [];

  function handleItemChange(
    skuId: string,
    field: keyof PriceListItem,
    value: number,
  ) {
    setEditableItems((prev) =>
      prev.map((item) =>
        item.sku_id === skuId ? { ...item, [field]: value } : item,
      ),
    );
  }

  async function handleSaveMatrix() {
    setSavingMatrix(true);
    setReviewFeedback(null);
    try {
      await updatePriceListItems(id, {
        items: items.map((i) => ({
          sku_id: i.sku_id,
          buy_price: i.buy_price,
          suggested_sell_price: i.suggested_sell_price,
          max_discount_pct: i.max_discount_pct,
        })),
      });
      setReviewFeedback("Pricing matrix updated successfully!");
      priceListQuery.refetch();
    } catch {
      setReviewFeedback("Failed to update pricing matrix.");
    } finally {
      setSavingMatrix(false);
    }
  }

  async function handleReview(decision: "approve" | "reject") {
    setReviewing(true);
    setReviewFeedback(null);
    try {
      await reviewPriceList(id, { decision });
      setReviewFeedback(
        decision === "approve"
          ? "Price list APPROVED and published! Active immediately."
          : "Price list rejected and returned to draft status.",
      );
      priceListQuery.refetch();
    } catch {
      setReviewFeedback("Failed to process review action.");
    } finally {
      setReviewing(false);
    }
  }

  async function handleRunSimulation() {
    setSimulating(true);
    try {
      const result = await calculatePriceQuote({
        sku_id: simSkuId,
        buyer_tier: priceList?.tier || "distributor",
        quantity: simQty,
        seller_state_code: simSellerState,
        buyer_state_code: simBuyerState,
      });
      setSimResult(result);
    } catch {
      alert("Failed to calculate quote simulation");
    } finally {
      setSimulating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#64766a]">
        <Link
          href="/admin/pricing"
          className="inline-flex items-center gap-1 font-medium hover:text-[#1b5e20] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Pricing & Schemes
        </Link>
        <span>/</span>
        <span className="font-mono text-[#19392a]">{id}</span>
      </div>

      {/* Header Card */}
      {priceList ? (
        <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-[#1b5e20] bg-[#e9f1e9] px-2.5 py-1 rounded">
                  State {priceList.state_code} &bull; {priceList.state_name}
                </span>
                <span className="rounded-md bg-purple-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-purple-800 border border-purple-200">
                  {priceList.tier.replace("_", " ")}
                </span>
                <span className="font-mono text-xs font-bold text-[#64766a]">
                  v{priceList.version}.0
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-bold text-[#19392a]">
                Wholesale Price Matrix &mdash; {priceList.state_name}
              </h1>

              <p className="mt-1 flex items-center gap-2 text-xs text-[#64766a]">
                <Calendar size={13} />
                Effective From: {new Date(priceList.effective_from).toLocaleDateString("en-IN")}
                {priceList.created_by ? ` &bull; Drafted by ${priceList.created_by}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-md border px-3.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                  priceList.status === "published"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : priceList.status === "pending_approval"
                    ? "bg-amber-50 text-amber-700 border-amber-200 ring-2 ring-amber-400"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {priceList.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Maker Checker Alert Banner */}
      {priceList?.status === "pending_approval" ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Clock className="text-amber-700 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Maker-Checker Review Required (Pending Sign-off)
                </h3>
                <p className="mt-0.5 text-xs text-amber-800">
                  This price list version was drafted by{" "}
                  <span className="font-semibold">{priceList.created_by || "Pricing Team"}</span>.
                  Under internal compliance (Rule PR-07), a Checker must verify margin bands and tax rates before publication.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={reviewing}
                onClick={() => handleReview("reject")}
                className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
              >
                Reject & Revert
              </button>
              <button
                type="button"
                disabled={reviewing}
                onClick={() => handleReview("approve")}
                className="rounded-md bg-[#1b5e20] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#154a19] shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                Approve & Publish (Checker)
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Feedback Toast */}
      {reviewFeedback ? (
        <div className="rounded-md border border-[#c3e6cb] bg-[#d4edda] p-3 text-xs font-medium text-[#155724] flex items-center justify-between">
          <span>{reviewFeedback}</span>
          <button
            type="button"
            onClick={() => setReviewFeedback(null)}
            className="text-xs font-bold"
          >
            &times;
          </button>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex border-b border-[#dce5dd]">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "matrix"
              ? "border-[#1b5e20] text-[#1b5e20]"
              : "border-transparent text-[#64766a] hover:text-[#19392a]"
          }`}
        >
          <FileSpreadsheet size={16} />
          SKU Pricing Matrix
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "simulator"
              ? "border-[#1b5e20] text-[#1b5e20]"
              : "border-transparent text-[#64766a] hover:text-[#19392a]"
          }`}
        >
          <Calculator size={16} />
          Live Price & Tax Simulator (PR-04 / PR-05)
        </button>
      </div>

      {/* TAB A: SKU Pricing Matrix */}
      {activeTab === "matrix" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#64766a]">
              Manage buy rates, suggested sell rates, and maximum seller discount bands (Rule BR-05).
            </p>

            <button
              type="button"
              disabled={savingMatrix}
              onClick={handleSaveMatrix}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] transition-colors"
            >
              <Save size={14} />
              {savingMatrix ? "Saving..." : "Save Pricing Matrix"}
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#dce5dd] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#dce5dd] bg-[#f9fbf9] text-xs font-semibold uppercase tracking-wider text-[#64766a]">
                  <tr>
                    <th className="px-5 py-3.5">SKU & Commodity</th>
                    <th className="px-4 py-3.5">UOM</th>
                    <th className="px-4 py-3.5">Printed MRP</th>
                    <th className="px-4 py-3.5">Tier Buy Price (ex-GST)</th>
                    <th className="px-4 py-3.5">Suggested Sell Price</th>
                    <th className="px-4 py-3.5">Wholesale Margin</th>
                    <th className="px-4 py-3.5">Max Discount Band (BR-05)</th>
                    <th className="px-4 py-3.5">GST Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8eee9]">
                  {items.map((item) => {
                    const grossMargin = item.suggested_sell_price - item.buy_price;
                    const marginPct =
                      item.buy_price > 0
                        ? ((grossMargin / item.buy_price) * 100).toFixed(1)
                        : "0.0";

                    return (
                      <tr key={item.sku_id} className="transition-colors hover:bg-[#f9fbf9]">
                        {/* Name & SKU */}
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-semibold text-[#1b5e20] bg-[#e9f1e9] px-2 py-0.5 rounded">
                            {item.sku_code}
                          </span>
                          <p className="mt-1 font-semibold text-[#19392a]">{item.product_name}</p>
                          <span className="text-xs text-[#64766a]">{item.category_name}</span>
                        </td>

                        {/* UOM */}
                        <td className="px-4 py-4 text-xs font-semibold text-[#31483a]">
                          {item.uom}
                        </td>

                        {/* MRP */}
                        <td className="px-4 py-4 text-xs font-semibold text-[#19392a]">
                          ₹{item.mrp.toLocaleString("en-IN")}
                        </td>

                        {/* Editable Buy Price */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-[#64766a]">₹</span>
                            <input
                              type="number"
                              value={item.buy_price}
                              onChange={(e) =>
                                handleItemChange(item.sku_id, "buy_price", Number(e.target.value))
                              }
                              className="h-8 w-24 rounded border border-[#cbd8ce] bg-white px-2 font-mono text-xs font-bold text-[#19392a] outline-none focus:border-[#1b5e20]"
                            />
                          </div>
                        </td>

                        {/* Editable Sell Price */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-[#64766a]">₹</span>
                            <input
                              type="number"
                              value={item.suggested_sell_price}
                              onChange={(e) =>
                                handleItemChange(
                                  item.sku_id,
                                  "suggested_sell_price",
                                  Number(e.target.value),
                                )
                              }
                              className="h-8 w-24 rounded border border-[#cbd8ce] bg-white px-2 font-mono text-xs font-bold text-[#19392a] outline-none focus:border-[#1b5e20]"
                            />
                          </div>
                        </td>

                        {/* Wholesale Margin */}
                        <td className="px-4 py-4 text-xs">
                          <span className="font-semibold text-emerald-700">+{marginPct}%</span>
                          <span className="block text-[11px] text-[#87958b]">
                            ₹{grossMargin.toLocaleString("en-IN")} / unit
                          </span>
                        </td>

                        {/* Editable Max Discount % */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.5"
                              value={item.max_discount_pct}
                              onChange={(e) =>
                                handleItemChange(
                                  item.sku_id,
                                  "max_discount_pct",
                                  Number(e.target.value),
                                )
                              }
                              className="h-8 w-16 rounded border border-[#cbd8ce] bg-white px-2 font-mono text-xs font-bold text-[#19392a] outline-none focus:border-[#1b5e20]"
                            />
                            <span className="text-xs text-[#64766a]">%</span>
                          </div>
                        </td>

                        {/* GST Rate */}
                        <td className="px-4 py-4 text-xs font-mono font-semibold text-[#19392a]">
                          {item.gst_rate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* TAB B: Live Price & Tax Simulator */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Controls */}
          <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-[#19392a] border-b border-[#e8eee9] pb-3 flex items-center gap-2">
              <Calculator size={18} className="text-[#1b5e20]" />
              Simulation Controls
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#31483a] mb-1">Select Product SKU:</label>
                <select
                  value={simSkuId}
                  onChange={(e) => setSimSkuId(e.target.value)}
                  className="w-full h-9 rounded-md border border-[#cbd8ce] bg-white px-2.5 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                >
                  {items.map((i) => (
                    <option key={i.sku_id} value={i.sku_id}>
                      {i.product_name} ({i.sku_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#31483a] mb-1">Order Quantity (Bags/Units):</label>
                <input
                  type="number"
                  min="1"
                  value={simQty}
                  onChange={(e) => setSimQty(Number(e.target.value))}
                  className="w-full h-9 rounded-md border border-[#cbd8ce] bg-white px-3 font-mono text-xs font-bold text-[#19392a] outline-none focus:border-[#1b5e20]"
                />
                <p className="mt-1 text-[11px] text-[#87958b]">
                  Try 10 or 50 bags to trigger Kharif Volume Slab incentives!
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#31483a] mb-1">Seller State (Source Hub):</label>
                <select
                  value={simSellerState}
                  onChange={(e) => setSimSellerState(e.target.value)}
                  className="w-full h-9 rounded-md border border-[#cbd8ce] bg-white px-2.5 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                >
                  <option value="27">Maharashtra (State 27)</option>
                  <option value="24">Gujarat (State 24)</option>
                  <option value="23">Madhya Pradesh (State 23)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#31483a] mb-1">Buyer State (Place of Supply):</label>
                <select
                  value={simBuyerState}
                  onChange={(e) => setSimBuyerState(e.target.value)}
                  className="w-full h-9 rounded-md border border-[#cbd8ce] bg-white px-2.5 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                >
                  <option value="27">Maharashtra (State 27) &mdash; Intra-state</option>
                  <option value="24">Gujarat (State 24) &mdash; Inter-state</option>
                  <option value="23">Madhya Pradesh (State 23) &mdash; Inter-state</option>
                </select>
                <p className="mt-1 text-[11px] text-[#87958b]">
                  {simSellerState === simBuyerState
                    ? "Intra-state: 2.5% CGST + 2.5% SGST"
                    : "Inter-state: 5% IGST applied"}
                </p>
              </div>

              <button
                type="button"
                disabled={simulating}
                onClick={handleRunSimulation}
                className="w-full mt-2 rounded-md bg-[#1b5e20] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] transition-colors"
              >
                {simulating ? "Calculating..." : "Calculate Price & Tax Quote"}
              </button>
            </div>
          </div>

          {/* Result Quote Card */}
          <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs lg:col-span-2 space-y-4">
            <h2 className="text-base font-semibold text-[#19392a] border-b border-[#e8eee9] pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp size={18} className="text-[#1b5e20]" />
                Simulated Tax Invoice & Margin Breakdown
              </span>
              {simResult ? (
                <span className="text-xs font-mono font-bold text-[#1b5e20] bg-[#e9f1e9] px-2 py-0.5 rounded">
                  Rule PR-01 Quote
                </span>
              ) : null}
            </h2>

            {simResult ? (
              <div className="space-y-4">
                <div className="rounded-md bg-[#f9fbf9] p-4 border border-[#e8eee9] space-y-2 text-xs">
                  <div className="flex justify-between font-semibold text-sm text-[#19392a]">
                    <span>{simResult.product_name}</span>
                    <span className="font-mono">{simResult.quantity} {simResult.uom}s</span>
                  </div>
                  <div className="flex justify-between text-[#64766a]">
                    <span>Wholesale Base Rate:</span>
                    <span className="font-mono">₹{simResult.base_price.toLocaleString("en-IN")} / unit</span>
                  </div>
                  <div className="flex justify-between text-[#19392a] font-medium pt-1 border-t border-[#e8eee9]">
                    <span>Gross Subtotal:</span>
                    <span className="font-mono">₹{simResult.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Applied Trade Schemes */}
                {simResult.applied_schemes.length > 0 ? (
                  <div className="rounded-md bg-emerald-50 p-4 border border-emerald-200 text-xs space-y-2">
                    <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <Percent size={14} /> Applied Promotional Schemes (Rule PR-05):
                    </p>
                    {simResult.applied_schemes.map((s, idx) => (
                      <div key={idx} className="flex justify-between text-emerald-900 font-medium">
                        <span>{s.name}</span>
                        <span className="font-mono">
                          {s.discount_amount > 0 ? `-₹${s.discount_amount.toLocaleString("en-IN")}` : `+${s.free_qty} Free`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md bg-gray-50 p-3 border border-gray-200 text-xs text-[#64766a]">
                    No promotional schemes applied for this quantity/commodity.
                  </div>
                )}

                {/* Tax Breakdown */}
                <div className="rounded-md bg-[#f9fbf9] p-4 border border-[#e8eee9] text-xs space-y-2">
                  <div className="flex justify-between font-semibold text-[#19392a]">
                    <span>Taxable Value (after schemes):</span>
                    <span className="font-mono">₹{simResult.taxable_amount.toLocaleString("en-IN")}</span>
                  </div>

                  {simResult.is_interstate ? (
                    <div className="flex justify-between text-[#64766a]">
                      <span>Inter-State IGST ({simResult.igst_rate}%):</span>
                      <span className="font-mono text-[#19392a]">₹{simResult.igst_amount.toLocaleString("en-IN")}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-[#64766a]">
                        <span>Central GST (CGST {simResult.cgst_rate}%):</span>
                        <span className="font-mono text-[#19392a]">₹{simResult.cgst_amount.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-[#64766a]">
                        <span>State GST (SGST {simResult.sgst_rate}%):</span>
                        <span className="font-mono text-[#19392a]">₹{simResult.sgst_amount.toLocaleString("en-IN")}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between font-bold text-base text-[#19392a] pt-3 border-t border-[#dce5dd]">
                    <span>Final Net Invoice Total:</span>
                    <span className="font-mono text-[#1b5e20]">₹{simResult.line_total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-xs text-[#64766a]">
                <Calculator size={32} className="text-[#cbd8ce]" />
                <p className="font-medium text-[#19392a]">No simulation run yet</p>
                <p>Click "Calculate Price & Tax Quote" to test live margin and tax resolution.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PriceListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

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
        <PriceListDetailContent id={id} />
      </AdminShell>
    </RoleGuard>
  );
}

