"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Boxes,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Filter,
  IndianRupee,
  Layers,
  MoreVertical,
  Package,
  PackageCheck,
  Search,
  Send,
  ShieldAlert,
  Sliders,
  Truck,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import { listOrders } from "@/lib/order-api";
import {
  acceptOrder,
  adminOverrideStatus,
  bulkAcceptOrders,
  dispatchOrder,
  packOrder,
  rejectOrder,
  updateFulfillmentStatus,
} from "@/lib/fulfilment-api";
import { calculateOrderSLA } from "@/lib/mock-fulfilment";
import type { Order, OrderLine, OrderStatus } from "@/types/order";
import {
  REASON_CODES,
  type FulfilmentReasonCode,
  type FulfilmentStatus,
  type PartialLineInput,
} from "@/types/fulfilment";

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case "new":
      return "bg-blue-50 text-blue-700 border-blue-200 animate-pulse";
    case "confirmed":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "packed":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "shipped":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    case "on_hold":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default function FulfilmentConsolePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Modals state
  const [partialOrder, setPartialOrder] = useState<Order | null>(null);
  const [partialLines, setPartialLines] = useState<
    Array<{ lineId: string; orderedQty: number; qtyAccepted: number; reasonCode: FulfilmentReasonCode }>
  >([]);

  const [rejectOrderTarget, setRejectOrderTarget] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState<FulfilmentReasonCode>("OUT_OF_STOCK");
  const [rejectNote, setRejectNote] = useState("");

  const [packOrderTarget, setPackOrderTarget] = useState<Order | null>(null);
  const [packageCount, setPackageCount] = useState<number>(10);
  const [packageWeight, setPackageWeight] = useState<number>(250);

  const [dispatchOrderTarget, setDispatchOrderTarget] = useState<Order | null>(null);
  const [transporterName, setTransporterName] = useState("MahaAgro Logistics Express");
  const [vehicleNumber, setVehicleNumber] = useState("MH-12-RN-4421");
  const [ewayBillNumber, setEwayBillNumber] = useState("EWB-2609-994102");
  const [driverContact, setDriverContact] = useState("+91 98220 12345");

  const [overrideOrderTarget, setOverrideOrderTarget] = useState<Order | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<FulfilmentStatus>("confirmed");
  const [overrideReason, setOverrideReason] = useState("");

  // Fetch orders
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["fulfilment-orders"],
    queryFn: () => listOrders(),
  });

  // Filter orders by tab and search
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "new" && order.status !== "new") return false;
    if (activeTab === "confirmed" && order.status !== "confirmed") return false;
    if (activeTab === "packed" && order.status !== "packed") return false;
    if (activeTab === "shipped" && order.status !== "shipped") return false;
    if (activeTab === "delivered" && order.status !== "delivered") return false;
    if (activeTab === "cancelled" && order.status !== "cancelled") return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.order_number.toLowerCase().includes(q);
      const matchBuyer = order.buyer_name.toLowerCase().includes(q);
      const matchSeller = order.seller_name.toLowerCase().includes(q);
      const matchLines = order.lines?.some((l) =>
        l.product_name.toLowerCase().includes(q) || l.sku.toLowerCase().includes(q),
      );
      return matchNum || matchBuyer || matchSeller || matchLines;
    }
    return true;
  });

  // Calculate counts for badges
  const counts = {
    all: orders.length,
    new: orders.filter((o) => o.status === "new").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    packed: orders.filter((o) => o.status === "packed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  // SLA breaches count
  const breachedCount = orders.filter(
    (o) => (o.status === "new" || o.status === "confirmed") && calculateOrderSLA(o).is_breached,
  ).length;

  // Toggle selection
  const handleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  // Quick Accept Mutation
  const acceptFullMutation = useMutation({
    mutationFn: (id: string) => acceptOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fulfilment-orders"] });
      refetch();
    },
  });

  // Partial Accept Mutation
  const partialAcceptMutation = useMutation({
    mutationFn: () => {
      if (!partialOrder) throw new Error("No order target");
      return acceptOrder(partialOrder.id, {
        lines: partialLines.map((l) => ({
          line_id: l.lineId,
          qty_accepted: l.qtyAccepted,
          reason_code: l.reasonCode,
        })),
        reason: "Partial order accepted with quantity adjustments",
      });
    },
    onSuccess: () => {
      setPartialOrder(null);
      queryClient.invalidateQueries({ queryKey: ["fulfilment-orders"] });
      refetch();
    },
  });

  // Reject Order Mutation
  const rejectMutation = useMutation({
    mutationFn: () => {
      if (!rejectOrderTarget) throw new Error("No order target");
      return rejectOrder(rejectOrderTarget.id, {
        reason_code: rejectReason,
        note: rejectNote,
      });
    },
    onSuccess: () => {
      setRejectOrderTarget(null);
      queryClient.invalidateQueries({ queryKey: ["fulfilment-orders"] });
      refetch();
    },
  });

  // Pack Order Mutation
  const packMutation = useMutation({
    mutationFn: () => {
      if (!packOrderTarget) throw new Error("No order target");
      return packOrder(packOrderTarget.id, {
        package_count: packageCount,
        weight_kg: packageWeight,
        notes: "Verified at warehouse bay",
      });
    },
    onSuccess: () => {
      setPackOrderTarget(null);
      queryClient.invalidateQueries({ queryKey: ["fulfilment-orders"] });
      refetch();
    },
  });

  // Dispatch Order Mutation
  const dispatchMutation = useMutation({
    mutationFn: () => {
      if (!dispatchOrderTarget) throw new Error("No order target");
      return dispatchOrder(dispatchOrderTarget.id, {
        transporter_name: transporterName,
        vehicle_number: vehicleNumber,
        eway_bill_number: ewayBillNumber,
        driver_contact: driverContact,
      });
    },
    onSuccess: () => {
      setDispatchOrderTarget(null);
      queryClient.invalidateQueries({ queryKey: ["fulfilment-orders"] });
      refetch();
    },
  });

  // Deliver Mutation
  const deliverMutation = useMutation({
    mutationFn: (id: string) => updateFulfillmentStatus(id, "delivered", "POD acknowledged by recipient"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fulfilment-orders"] });
      refetch();
    },
  });

  // Bulk Accept Mutation
  const bulkAcceptMutation = useMutation({
    mutationFn: () => bulkAcceptOrders(selectedOrderIds, "Bulk accepted by seller dispatch manager"),
    onSuccess: () => {
      setSelectedOrderIds([]);
      queryClient.invalidateQueries({ queryKey: ["fulfilment-orders"] });
      refetch();
    },
  });

  // Admin Override Mutation
  const overrideMutation = useMutation({
    mutationFn: () => {
      if (!overrideOrderTarget) throw new Error("No order target");
      return adminOverrideStatus(overrideOrderTarget.id, overrideStatus, overrideReason);
    },
    onSuccess: () => {
      setOverrideOrderTarget(null);
      setOverrideReason("");
      queryClient.invalidateQueries({ queryKey: ["fulfilment-orders"] });
      refetch();
    },
  });

  // Open Partial Dialog
  const openPartialModal = (order: Order) => {
    setPartialOrder(order);
    setPartialLines(
      order.lines.map((l) => ({
        lineId: l.id,
        orderedQty: l.ordered_qty,
        qtyAccepted: l.ordered_qty,
        reasonCode: "PARTIAL_STOCK_AVAILABLE",
      })),
    );
  };

  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "distributor", "sub_distributor"]}>
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <Truck size={20} />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                  Seller Fulfilment & Dispatch
                </h1>
              </div>
              <p className="mt-1 text-sm text-[#64766a]">
                Sell-side order inbox, 4-hour SLA monitoring, partial acceptance, warehouse packing slips, and logistics dispatch.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedOrderIds.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/admin/fulfilment/pick-list?ids=${selectedOrderIds.join(",")}`,
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5dd] bg-white px-3 py-1.5 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1]"
                  >
                    <FileSpreadsheet size={14} className="text-[#1b5e20]" />
                    Godown Pick List ({selectedOrderIds.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => bulkAcceptMutation.mutate()}
                    disabled={bulkAcceptMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    Bulk Accept ({selectedOrderIds.length})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* SLA Alert Banner if breaches exist */}
          {breachedCount > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-xs text-red-900 shadow-xs">
              <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Rule FL-10 SLA Breach Alert:</span>{" "}
                {breachedCount} purchase order(s) have exceeded the standard 4-hour seller acceptance SLA window. These have been escalated to Admin and Parent stockists.
              </div>
            </div>
          )}

          {/* Filter Status Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#dce5dd] pb-3">
            {[
              { id: "all", label: "All Orders", count: counts.all },
              { id: "new", label: "New (Action Required)", count: counts.new, alert: counts.new > 0 },
              { id: "confirmed", label: "Accepted / In Packing", count: counts.confirmed },
              { id: "packed", label: "Packed (Ready to Ship)", count: counts.packed },
              { id: "shipped", label: "Dispatched & In-Transit", count: counts.shipped },
              { id: "delivered", label: "Delivered & Closed", count: counts.delivered },
              { id: "cancelled", label: "Rejected / Cancelled", count: counts.cancelled },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#1b5e20] text-white shadow-xs"
                    : "bg-white text-[#64766a] border border-[#dce5dd] hover:bg-[#f1f5f1] hover:text-[#19392a]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : tab.alert
                      ? "bg-amber-100 text-amber-900"
                      : "bg-[#eef2ef] text-[#64766a]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
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
                placeholder="Search orders by #, buyer name, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-[#cbd8ce] bg-white pl-9 pr-3 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
              />
            </div>

            <div className="text-xs text-[#64766a]">
              Showing <span className="font-semibold text-[#19392a]">{filteredOrders.length}</span> orders
            </div>
          </div>

          {/* Fulfilment Table */}
          <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#19392a]">
                  <tr>
                    <th className="px-4 py-3.5 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredOrders.length > 0 &&
                          selectedOrderIds.length === filteredOrders.length
                        }
                        onChange={handleSelectAll}
                        className="rounded border-[#cbd8ce] text-[#1b5e20] focus:ring-[#1b5e20]"
                      />
                    </th>
                    <th className="px-4 py-3.5">Order Number</th>
                    <th className="px-4 py-3.5">Buyer Partner</th>
                    <th className="px-4 py-3.5">Commodity SKUs</th>
                    <th className="px-4 py-3.5">Amount (₹)</th>
                    <th className="px-4 py-3.5">SLA Window</th>
                    <th className="px-4 py-3.5">Fulfilment Stage</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2ef]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#64766a]">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#1b5e20] border-t-transparent" />
                        <p className="mt-2 text-xs">Loading seller fulfilment inbox...</p>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#64766a]">
                        <Boxes size={32} className="mx-auto text-[#87958b]" />
                        <p className="mt-2 text-sm font-semibold text-[#19392a]">No orders in this stage</p>
                        <p className="text-xs mt-0.5">There are no orders matching the selected filter criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const sla = calculateOrderSLA(order);
                      const isSelected = selectedOrderIds.includes(order.id);

                      return (
                        <tr
                          key={order.id}
                          className={`transition-colors hover:bg-[#f8faf8] ${
                            isSelected ? "bg-[#e9f1e9]/30" : ""
                          }`}
                        >
                          <td className="px-4 py-3.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOrder(order.id)}
                              className="rounded border-[#cbd8ce] text-[#1b5e20] focus:ring-[#1b5e20]"
                            />
                          </td>

                          {/* Order Number & Placed At */}
                          <td className="px-4 py-3.5">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-bold text-[#1b5e20] hover:underline"
                            >
                              {order.order_number}
                            </Link>
                            <div className="text-[11px] text-[#87958b] mt-0.5">
                              {new Date(order.placed_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            {order.source === "assisted" && (
                              <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-700 border border-indigo-200 mt-1">
                                <UserCheck size={10} /> Assisted
                              </span>
                            )}
                          </td>

                          {/* Buyer Partner */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-[#19392a]">
                              {order.buyer_name}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#64766a] mt-0.5">
                              <span className="uppercase text-[10px] font-bold text-[#87958b]">
                                {order.buyer_tier}
                              </span>
                              <span>·</span>
                              <span>{order.delivery_address?.city || "Nashik"}</span>
                            </div>
                          </td>

                          {/* Commodity SKUs */}
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-[#19392a]">
                              {order.lines?.[0]?.product_name || "Commodity Lines"}
                            </div>
                            <div className="text-[11px] text-[#64766a] mt-0.5">
                              {order.lines?.length || 1} line item(s) · {order.lines?.reduce((s, l) => s + l.ordered_qty, 0)} units
                            </div>
                          </td>

                          {/* Order Amount */}
                          <td className="px-4 py-3.5 font-bold text-[#19392a]">
                            ₹{order.grand_total?.toLocaleString("en-IN")}
                          </td>

                          {/* SLA Timer */}
                          <td className="px-4 py-3.5">
                            {order.status === "new" || order.status === "confirmed" ? (
                              sla.is_breached ? (
                                <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800 border border-red-300">
                                  <AlertTriangle size={12} /> SLA Breached
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
                                  <Clock size={12} /> {sla.hours_remaining}h left
                                </span>
                              )
                            ) : (
                              <span className="text-[11px] text-[#87958b]">Compliant</span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold capitalize ${getStatusBadge(
                                order.status,
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {order.status === "new" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => acceptFullMutation.mutate(order.id)}
                                    title="Accept full order"
                                    className="rounded bg-[#1b5e20] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#154a19] transition-colors"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openPartialModal(order)}
                                    title="Partial accept with quantity adjustment"
                                    className="rounded border border-[#cbd8ce] bg-white px-2 py-1 text-[11px] font-semibold text-[#19392a] hover:bg-[#f1f5f1] transition-colors"
                                  >
                                    Partial
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRejectOrderTarget(order);
                                      setRejectReason("OUT_OF_STOCK");
                                    }}
                                    title="Reject order"
                                    className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {order.status === "confirmed" && (
                                <button
                                  type="button"
                                  onClick={() => setPackOrderTarget(order)}
                                  className="rounded bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-700 transition-colors"
                                >
                                  Pack Goods
                                </button>
                              )}

                              {order.status === "packed" && (
                                <button
                                  type="button"
                                  onClick={() => setDispatchOrderTarget(order)}
                                  className="rounded bg-cyan-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-cyan-800 transition-colors"
                                >
                                  Dispatch
                                </button>
                              )}

                              {order.status === "shipped" && (
                                <button
                                  type="button"
                                  onClick={() => deliverMutation.mutate(order.id)}
                                  className="rounded bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800 transition-colors"
                                >
                                  Mark Delivered
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setOverrideOrderTarget(order);
                                  setOverrideStatus(order.status);
                                }}
                                title="Super Admin Override"
                                className="rounded p-1 text-[#87958b] hover:bg-gray-100 hover:text-[#19392a] transition-colors ml-1"
                              >
                                <Sliders size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 1. Modal: Partial Accept (Rule FL-02 & FL-04) */}
        {partialOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#19392a]">
                    Partial Accept Order · {partialOrder.order_number}
                  </h3>
                  <p className="text-xs text-[#64766a]">
                    Adjust fulfilled quantities per SKU. As per Rule FL-04, totals and credit hold will be dynamically recalculated.
                  </p>
                </div>
                <button
                  onClick={() => setPartialOrder(null)}
                  className="rounded p-1 text-[#87958b] hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {partialOrder.lines?.map((line, idx) => {
                  const currentLineState = partialLines.find((l) => l.lineId === line.id);
                  const qtyAccepted = currentLineState?.qtyAccepted ?? line.ordered_qty;

                  return (
                    <div
                      key={line.id}
                      className="rounded-lg border border-[#e1eae3] bg-[#fafbfa] p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-[#19392a]">{line.product_name}</p>
                          <p className="text-[11px] text-[#87958b]">
                            SKU: {line.sku} · Ordered: <strong>{line.ordered_qty} {line.uom}</strong>
                          </p>
                        </div>
                        <span className="font-bold text-[#19392a]">
                          ₹{line.unit_price} / {line.uom}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#64766a] mb-1">
                            Accepted Quantity ({line.uom}) *
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={line.ordered_qty}
                            value={qtyAccepted}
                            onChange={(e) => {
                              const val = Math.min(
                                line.ordered_qty,
                                Math.max(0, parseInt(e.target.value) || 0),
                              );
                              setPartialLines((prev) =>
                                prev.map((item) =>
                                  item.lineId === line.id
                                    ? { ...item, qtyAccepted: val }
                                    : item,
                                ),
                              );
                            }}
                            className="w-full rounded-md border border-[#cbd8ce] bg-white px-2.5 py-1.5 text-xs font-bold text-[#19392a] outline-none focus:border-[#1b5e20]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#64766a] mb-1">
                            Reason if Less than Ordered
                          </label>
                          <select
                            value={currentLineState?.reasonCode || "PARTIAL_STOCK_AVAILABLE"}
                            onChange={(e) => {
                              const code = e.target.value as FulfilmentReasonCode;
                              setPartialLines((prev) =>
                                prev.map((item) =>
                                  item.lineId === line.id
                                    ? { ...item, reasonCode: code }
                                    : item,
                                ),
                              );
                            }}
                            className="w-full rounded-md border border-[#cbd8ce] bg-white px-2.5 py-1.5 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                          >
                            <option value="PARTIAL_STOCK_AVAILABLE">Partial Stock Available</option>
                            <option value="OUT_OF_STOCK">Out of Stock</option>
                            <option value="LOGISTICS_UNAVAILABLE">Transporter Limit</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef2ef] pt-4">
                <button
                  type="button"
                  onClick={() => setPartialOrder(null)}
                  className="rounded-md border border-[#cbd8ce] px-4 py-2 text-xs font-semibold text-[#64766a] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => partialAcceptMutation.mutate()}
                  disabled={partialAcceptMutation.isPending}
                  className="rounded-md bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50"
                >
                  {partialAcceptMutation.isPending ? "Confirming..." : "Confirm Partial Acceptance"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Modal: Reject Order Target */}
        {rejectOrderTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle size={20} />
                  <h3 className="text-base font-bold text-[#19392a]">Reject Purchase Order</h3>
                </div>
                <button
                  onClick={() => setRejectOrderTarget(null)}
                  className="rounded p-1 text-[#87958b] hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Select Rejection Reason Code *
                  </label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value as FulfilmentReasonCode)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-red-600"
                  >
                    {REASON_CODES.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Internal Dispatch Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Details for partner notification..."
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef2ef] pt-4">
                <button
                  type="button"
                  onClick={() => setRejectOrderTarget(null)}
                  className="rounded-md border border-[#cbd8ce] px-4 py-2 text-xs font-semibold text-[#64766a] hover:bg-gray-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending}
                  className="rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Reject Order"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Modal: Pack Order Target */}
        {packOrderTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div className="flex items-center gap-2 text-amber-600">
                  <PackageCheck size={20} />
                  <h3 className="text-base font-bold text-[#19392a]">Pack Goods & Generate Packing Slip</h3>
                </div>
                <button
                  onClick={() => setPackOrderTarget(null)}
                  className="rounded p-1 text-[#87958b] hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Number of Packages / Bags *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={packageCount}
                    onChange={(e) => setPackageCount(parseInt(e.target.value) || 1)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Gross Weight (kg)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={packageWeight}
                    onChange={(e) => setPackageWeight(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-amber-600"
                  />
                </div>

                <p className="text-[11px] text-[#64766a] bg-amber-50 p-2.5 rounded border border-amber-200">
                  Packing moves the order to <strong>PACKED</strong> and triggers tax invoice readiness under Module 08.
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef2ef] pt-4">
                <button
                  type="button"
                  onClick={() => setPackOrderTarget(null)}
                  className="rounded-md border border-[#cbd8ce] px-4 py-2 text-xs font-semibold text-[#64766a] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => packMutation.mutate()}
                  disabled={packMutation.isPending}
                  className="rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50"
                >
                  {packMutation.isPending ? "Packing..." : "Confirm Goods Packed"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Modal: Dispatch Order Target */}
        {dispatchOrderTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div className="flex items-center gap-2 text-cyan-700">
                  <Truck size={20} />
                  <h3 className="text-base font-bold text-[#19392a]">Logistics Dispatch & E-Way Bill</h3>
                </div>
                <button
                  onClick={() => setDispatchOrderTarget(null)}
                  className="rounded p-1 text-[#87958b] hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Transporter / Freight Carrier *
                  </label>
                  <input
                    type="text"
                    value={transporterName}
                    onChange={(e) => setTransporterName(e.target.value)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-cyan-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-cyan-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    E-Way Bill Number *
                  </label>
                  <input
                    type="text"
                    value={ewayBillNumber}
                    onChange={(e) => setEwayBillNumber(e.target.value)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-cyan-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Driver Mobile Contact
                  </label>
                  <input
                    type="text"
                    value={driverContact}
                    onChange={(e) => setDriverContact(e.target.value)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-cyan-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef2ef] pt-4">
                <button
                  type="button"
                  onClick={() => setDispatchOrderTarget(null)}
                  className="rounded-md border border-[#cbd8ce] px-4 py-2 text-xs font-semibold text-[#64766a] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => dispatchMutation.mutate()}
                  disabled={dispatchMutation.isPending}
                  className="rounded-md bg-cyan-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-cyan-800 disabled:opacity-50"
                >
                  {dispatchMutation.isPending ? "Dispatching..." : "Dispatch Consignment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Modal: Super Admin Emergency State Override */}
        {overrideOrderTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-orange-200 bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div className="flex items-center gap-2 text-orange-600">
                  <Sliders size={20} />
                  <h3 className="text-base font-bold text-[#19392a]">Emergency Admin Override</h3>
                </div>
                <button
                  onClick={() => setOverrideOrderTarget(null)}
                  className="rounded p-1 text-[#87958b] hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Force Transition To State *
                  </label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value as FulfilmentStatus)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-orange-600 capitalize"
                  >
                    <option value="new">New</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Audited Justification Reason (Required) *
                  </label>
                  <textarea
                    rows={3}
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Provide specific administrative justification..."
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-orange-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef2ef] pt-4">
                <button
                  type="button"
                  onClick={() => setOverrideOrderTarget(null)}
                  className="rounded-md border border-[#cbd8ce] px-4 py-2 text-xs font-semibold text-[#64766a] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => overrideMutation.mutate()}
                  disabled={overrideMutation.isPending || overrideReason.trim().length < 5}
                  className="rounded-md bg-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-orange-700 disabled:opacity-50"
                >
                  {overrideMutation.isPending ? "Applying..." : "Apply Admin Override"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminShell>
    </RoleGuard>
  );
}

