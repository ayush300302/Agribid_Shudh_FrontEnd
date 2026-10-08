"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import { cancelOrder, getOrderById, updateOrderStatus } from "@/lib/order-api";
import type { OrderStatus } from "@/types/order";

const LIFECYCLE_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: "new", label: "Order Placed", desc: "Submitted by buyer / field team" },
  { key: "confirmed", label: "Confirmed", desc: "Seller accepted PO" },
  { key: "packed", label: "Packed", desc: "Warehouse staging ready" },
  { key: "shipped", label: "Dispatched", desc: "In-transit with carrier" },
  { key: "delivered", label: "Delivered", desc: "Goods received & POD logged" },
];

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case "new":
      return 0;
    case "confirmed":
      return 1;
    case "packed":
      return 2;
    case "shipped":
      return 3;
    case "delivered":
      return 4;
    default:
      return -1;
  }
}

function OrderDetailContent({ id }: { id: string }) {
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
  });

  const order = orderQuery.data;

  async function handleStatusAdvance(nextStatus: OrderStatus) {
    setUpdating(true);
    setFeedback(null);
    try {
      await updateOrderStatus(id, nextStatus);
      setFeedback(`Order status advanced to ${nextStatus.toUpperCase()}!`);
      orderQuery.refetch();
    } catch {
      setFeedback("Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleCancel() {
    const reason = prompt("Enter cancellation reason for this order:");
    if (!reason) return;
    setUpdating(true);
    setFeedback(null);
    try {
      await cancelOrder(id, reason);
      setFeedback("Order successfully cancelled.");
      orderQuery.refetch();
    } catch {
      setFeedback("Failed to cancel order.");
    } finally {
      setUpdating(false);
    }
  }

  const currentStepIdx = order ? getStepIndex(order.status) : -1;
  const isCancelled = order?.status === "cancelled";

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#64766a]">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 font-medium hover:text-[#1b5e20] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Purchase Orders
        </Link>
        <span>/</span>
        <span className="font-mono text-[#19392a]">{order?.order_number || id}</span>
      </div>

      {/* Hero Header */}
      {order ? (
        <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#1b5e20] bg-[#e9f1e9] px-2.5 py-1 rounded">
                  {order.order_number}
                </span>
                {order.source === "assisted" ? (
                  <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-700 border border-indigo-200 flex items-center gap-1">
                    <UserCheck size={13} /> Assisted Order
                  </span>
                ) : (
                  <span className="rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700 border border-gray-200">
                    Self Placed
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-2xl font-bold text-[#19392a]">
                Purchase Order &mdash; {order.buyer_name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#64766a]">
                <span>
                  Placed: <strong className="text-[#19392a]">{new Date(order.placed_at).toLocaleString("en-IN")}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Payment: <strong className="text-[#19392a] uppercase">{order.payment_mode} ({order.payment_status})</strong>
                </span>
                <span>&bull;</span>
                <span>
                  SLA Due: <strong className="text-[#19392a]">{order.expected_delivery_date || "2 Days"}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <span className="text-xs text-[#64766a]">Order Total</span>
              <span className="font-mono text-2xl font-bold text-[#19392a]">
                ₹{order.grand_total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Feedback Banner */}
      {feedback ? (
        <div className="rounded-md border border-[#c3e6cb] bg-[#d4edda] p-3 text-xs font-medium text-[#155724] flex items-center justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback(null)} className="font-bold">
            &times;
          </button>
        </div>
      ) : null}

      {/* Visual Lifecycle Step Tracker */}
      {order && !isCancelled ? (
        <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#64766a] flex items-center gap-1.5">
            <Truck size={16} className="text-[#1b5e20]" />
            Fulfillment Lifecycle Progress
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPassed = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;

              return (
                <div
                  key={step.key}
                  className={`rounded-lg p-3.5 border transition-all ${
                    isCurrent
                      ? "border-[#1b5e20] bg-[#f9fbf9] ring-2 ring-[#1b5e20]/20"
                      : isPassed
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-[#e8eee9] bg-gray-50/60 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#64766a]">
                      0{idx + 1}
                    </span>
                    {isPassed ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <Clock size={15} className="text-gray-400" />
                    )}
                  </div>
                  <p className="mt-2 text-xs font-bold text-[#19392a]">{step.label}</p>
                  <p className="text-[11px] text-[#64766a] mt-0.5 leading-snug">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Lifecycle Action Buttons */}
          <div className="pt-3 border-t border-[#e8eee9] flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#64766a]">
              Current Stage: <span className="font-semibold text-[#19392a] uppercase">{order.status}</span>
            </div>

            <div className="flex items-center gap-2">
              {order.status === "new" && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStatusAdvance("confirmed")}
                  className="rounded-md bg-[#1b5e20] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#154a19] shadow-xs"
                >
                  Confirm Order (Accept PO)
                </button>
              )}
              {order.status === "confirmed" && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStatusAdvance("packed")}
                  className="rounded-md bg-[#1b5e20] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#154a19] shadow-xs"
                >
                  Mark Warehouse Packed
                </button>
              )}
              {order.status === "packed" && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStatusAdvance("shipped")}
                  className="rounded-md bg-[#1b5e20] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#154a19] shadow-xs"
                >
                  Dispatch & Ship Order
                </button>
              )}
              {order.status === "shipped" && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStatusAdvance("delivered")}
                  className="rounded-md bg-[#1b5e20] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#154a19] shadow-xs"
                >
                  Confirm Delivery (Sign POD)
                </button>
              )}

              {order.status !== "delivered" && order.status !== "cancelled" && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleCancel}
                  className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      ) : isCancelled ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 shadow-xs flex items-center gap-3">
          <XCircle size={24} className="text-red-600 shrink-0" />
          <div>
            <h3 className="font-bold text-sm text-red-900">Order Cancelled</h3>
            <p className="text-xs text-red-800 mt-0.5">
              Reason: {order?.hold_reason || "Cancelled by administrator / risk daemon."}
            </p>
          </div>
        </div>
      ) : null}

      {/* Main Grid: Lines & Financials */}
      {order ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Line Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="overflow-hidden rounded-lg border border-[#dce5dd] bg-white shadow-xs">
              <div className="border-b border-[#dce5dd] bg-[#f9fbf9] px-6 py-4">
                <h3 className="text-sm font-semibold text-[#19392a] flex items-center gap-2">
                  <Package size={16} className="text-[#1b5e20]" />
                  Ordered Commodities & SKUs ({order.lines.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#dce5dd] bg-[#f9fbf9] text-[11px] font-semibold uppercase text-[#64766a]">
                    <tr>
                      <th className="px-5 py-3">SKU & Item</th>
                      <th className="px-4 py-3">HSN</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">Unit Rate</th>
                      <th className="px-4 py-3">Taxable</th>
                      <th className="px-4 py-3">GST Rate</th>
                      <th className="px-5 py-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8eee9]">
                    {order.lines.map((line) => (
                      <tr key={line.id} className="hover:bg-[#f9fbf9]">
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-bold text-[#1b5e20] bg-[#e9f1e9] px-2 py-0.5 rounded">
                            {line.sku}
                          </span>
                          <p className="mt-1 font-semibold text-xs text-[#19392a]">
                            {line.product_name}
                          </p>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-[#64766a]">
                          {line.hsn_code}
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-[#19392a]">
                          {line.ordered_qty} {line.uom}s
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-[#19392a]">
                          ₹{line.unit_price.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-[#19392a]">
                          ₹{line.taxable_amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-[#64766a]">
                          {line.tax_rate}%
                        </td>
                        <td className="px-5 py-4 font-mono text-xs font-bold text-[#19392a] text-right">
                          ₹{line.line_total.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit History Log */}
            {order.history && order.history.length > 0 ? (
              <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-semibold text-[#19392a] border-b border-[#e8eee9] pb-3 flex items-center gap-2">
                  <Clock size={16} className="text-[#1b5e20]" />
                  Audit Trail & History Log
                </h3>

                <div className="space-y-3">
                  {order.history.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-start justify-between text-xs border-l-2 border-[#1b5e20] pl-3 py-1"
                    >
                      <div>
                        <p className="font-semibold text-[#19392a]">
                          Status moved to <span className="uppercase text-[#1b5e20]">{h.to_status}</span>
                        </p>
                        <p className="text-[11px] text-[#64766a]">By: {h.changed_by}</p>
                        {h.reason ? (
                          <p className="text-[11px] text-red-700 italic mt-0.5">
                            Reason: {h.reason}
                          </p>
                        ) : null}
                      </div>
                      <span className="text-[11px] text-[#87958b]">
                        {new Date(h.changed_at).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Right Column: Financials & Partner Dossier */}
          <div className="space-y-6">
            {/* Financial Invoice Breakdown */}
            <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs space-y-3 text-xs">
              <h3 className="text-sm font-semibold text-[#19392a] border-b border-[#e8eee9] pb-3 flex items-center gap-2">
                <FileText size={16} className="text-[#1b5e20]" />
                Tax Invoice Breakdown
              </h3>

              <div className="flex justify-between text-[#64766a]">
                <span>Gross Subtotal:</span>
                <span className="font-mono text-[#19392a]">₹{order.subtotal.toLocaleString("en-IN")}</span>
              </div>

              {order.discount_total > 0 ? (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Scheme Deductions:</span>
                  <span className="font-mono">-₹{order.discount_total.toLocaleString("en-IN")}</span>
                </div>
              ) : null}

              <div className="flex justify-between font-semibold text-[#19392a] pt-1 border-t border-[#e8eee9]">
                <span>Taxable Amount:</span>
                <span className="font-mono">₹{order.taxable_amount.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-[#64766a]">
                <span>Central GST (CGST 2.5%):</span>
                <span className="font-mono text-[#19392a]">₹{order.cgst_total.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-[#64766a]">
                <span>State GST (SGST 2.5%):</span>
                <span className="font-mono text-[#19392a]">₹{order.sgst_total.toLocaleString("en-IN")}</span>
              </div>

              {order.igst_total > 0 ? (
                <div className="flex justify-between text-[#64766a]">
                  <span>Inter-state GST (IGST 5%):</span>
                  <span className="font-mono text-[#19392a]">₹{order.igst_total.toLocaleString("en-IN")}</span>
                </div>
              ) : null}

              <div className="flex justify-between font-bold text-base text-[#19392a] pt-3 border-t border-[#dce5dd]">
                <span>Grand Total:</span>
                <span className="font-mono text-[#1b5e20]">₹{order.grand_total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Buyer & Seller Info Cards */}
            <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-[#19392a] flex items-center gap-1.5">
                  <Building2 size={14} className="text-[#1b5e20]" /> Buyer Entity
                </h4>
                <p className="mt-1 font-semibold text-sm text-[#19392a]">{order.buyer_name}</p>
                <p className="text-[#64766a] capitalize">{order.buyer_tier.replace("_", " ")} &bull; {order.buyer_code}</p>
              </div>

              <div className="pt-3 border-t border-[#e8eee9]">
                <h4 className="font-bold text-[#19392a] flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#1b5e20]" /> Delivery Address
                </h4>
                <p className="mt-1 text-[#31483a]">
                  {order.delivery_address.line1}
                  {order.delivery_address.line2 ? `, ${order.delivery_address.line2}` : ""}
                  <br />
                  {order.delivery_address.city}, {order.delivery_address.state} &mdash;{" "}
                  <span className="font-mono font-semibold">{order.delivery_address.pincode}</span>
                </p>
              </div>

              {order.notes ? (
                <div className="pt-3 border-t border-[#e8eee9]">
                  <h4 className="font-bold text-[#19392a]">Special Instructions</h4>
                  <p className="mt-1 text-[#64766a] italic">{order.notes}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <RoleGuard
      allowedRoles={[
        "ADM_SUPER",
        "ADM_SALES_OPS",
        "ADM_STATE_MGR",
        "ADM_FINANCE",
        "ADM_SUPPORT",
      ]}
    >
      <AdminShell>
        <OrderDetailContent id={id} />
      </AdminShell>
    </RoleGuard>
  );
}
