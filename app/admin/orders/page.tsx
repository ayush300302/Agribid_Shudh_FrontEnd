"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Filter,
  IndianRupee,
  Package,
  Plus,
  Search,
  ShieldAlert,
  ShoppingBag,
  Truck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import { listOrders } from "@/lib/order-api";
import type { Order, OrderSource, OrderStatus, PaymentMode } from "@/types/order";

function getOrderStatusBadge(status: OrderStatus) {
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

function getSourceBadge(source: OrderSource) {
  switch (source) {
    case "assisted":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200">
          <UserCheck size={12} /> Assisted (On Behalf)
        </span>
      );
    case "self":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600 border border-gray-200">
          Self Placed
        </span>
      );
    case "admin":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-200">
          Admin Console
        </span>
      );
  }
}

export default function OrdersConsolePage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const ordersQuery = useQuery({
    queryKey: ["admin-orders", activeTab, selectedSource, selectedPayment, searchQuery],
    queryFn: () =>
      listOrders({
        status: activeTab === "all" ? undefined : activeTab,
        source: selectedSource === "all" ? undefined : selectedSource,
        payment_status: selectedPayment === "all" ? undefined : selectedPayment,
        search: searchQuery,
      }),
  });

  const orders = ordersQuery.data || [];

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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <ShoppingBag size={20} />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                  Purchase Orders & Commerce
                </h1>
              </div>
              <p className="mt-1 text-sm text-[#64766a]">
                Multi-tier buy-side order processing, assisted orders on behalf of retailers, and order lifecycle tracking.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/orders/new"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1b5e20] px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#154a19] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b5e20]"
              >
                <Plus size={16} />
                Create Assisted Order
              </Link>
            </div>
          </div>

          {/* Fulfillment Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#dce5dd] pb-3">
            {[
              { id: "all", label: "All Orders" },
              { id: "new", label: "New (Awaiting Review)" },
              { id: "confirmed", label: "Confirmed" },
              { id: "shipped", label: "Shipped & In-Transit" },
              { id: "delivered", label: "Delivered & Closed" },
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

          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-3 rounded-lg border border-[#dce5dd] bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#87958b]"
              />
              <input
                type="text"
                placeholder="Search by Order #, Buyer Name, Partner Code, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-[#cbd8ce] bg-white pl-9 pr-4 text-xs text-[#19392a] outline-none transition-colors placeholder:text-[#87958b] focus:border-[#1b5e20]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64766a]">
                <Filter size={14} /> Source:
              </div>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="h-9 rounded-md border border-[#cbd8ce] bg-white px-2.5 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
              >
                <option value="all">All Sources</option>
                <option value="self">Self Placed</option>
                <option value="assisted">Assisted (On Behalf)</option>
              </select>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64766a]">
                Payment:
              </div>
              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="h-9 rounded-md border border-[#cbd8ce] bg-white px-2.5 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          {/* Orders Data Table */}
          <div className="overflow-hidden rounded-lg border border-[#dce5dd] bg-white shadow-xs">
            {ordersQuery.isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3">
                <div className="size-8 animate-spin rounded-full border-3 border-[#1b5e20] border-t-transparent" />
                <p className="text-sm text-[#64766a]">Loading purchase orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 p-6 text-center">
                <ShoppingBag size={36} className="text-[#cbd8ce]" />
                <p className="text-sm font-semibold text-[#19392a]">No purchase orders found</p>
                <p className="text-xs text-[#64766a]">
                  Try adjusting search keywords or filter stages.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#dce5dd] bg-[#f9fbf9] text-xs font-semibold uppercase tracking-wider text-[#64766a]">
                    <tr>
                      <th className="px-5 py-3.5">PO Number & Date</th>
                      <th className="px-5 py-3.5">Buyer (Purchaser)</th>
                      <th className="px-5 py-3.5">Seller (Fulfiller)</th>
                      <th className="px-5 py-3.5">Source</th>
                      <th className="px-5 py-3.5">Grand Total & Items</th>
                      <th className="px-5 py-3.5">Payment</th>
                      <th className="px-5 py-3.5">Fulfillment Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8eee9]">
                    {orders.map((order) => (
                      <tr key={order.id} className="transition-colors hover:bg-[#f9fbf9]">
                        {/* Order Number & Date */}
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-mono text-xs font-bold text-[#1b5e20] hover:underline"
                          >
                            {order.order_number}
                          </Link>
                          <p className="text-xs text-[#64766a] mt-0.5 flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(order.placed_at).toLocaleDateString("en-IN")}
                          </p>
                        </td>

                        {/* Buyer */}
                        <td className="px-5 py-4">
                          <p className="font-semibold text-xs text-[#19392a]">
                            {order.buyer_name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-[#64766a] mt-0.5">
                            <span className="font-mono text-[#1b5e20]">{order.buyer_code}</span>
                            <span>&bull;</span>
                            <span className="capitalize">{order.buyer_tier.replace("_", " ")}</span>
                          </div>
                        </td>

                        {/* Seller */}
                        <td className="px-5 py-4 text-xs">
                          <p className="font-medium text-[#19392a]">{order.seller_name}</p>
                          <span className="text-[11px] text-[#64766a] capitalize">
                            {order.seller_tier.replace("_", " ")}
                          </span>
                        </td>

                        {/* Source */}
                        <td className="px-5 py-4">
                          {getSourceBadge(order.source)}
                        </td>

                        {/* Grand Total */}
                        <td className="px-5 py-4 text-xs">
                          <span className="font-bold text-[#19392a] text-sm font-mono">
                            ₹{order.grand_total.toLocaleString("en-IN")}
                          </span>
                          <span className="block text-[11px] text-[#64766a]">
                            {order.lines.length} lines &bull; {order.lines.reduce((acc, l) => acc + l.ordered_qty, 0)} units
                          </span>
                        </td>

                        {/* Payment */}
                        <td className="px-5 py-4 text-xs">
                          <div className="flex items-center gap-1.5 font-semibold capitalize text-[#19392a]">
                            <CreditCard size={13} className="text-[#64766a]" />
                            {order.payment_mode === "pod" ? "Pay On Delivery" : order.payment_mode}
                          </div>
                          <span
                            className={`inline-block mt-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              order.payment_status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold uppercase ${getOrderStatusBadge(
                              order.status,
                            )}`}
                          >
                            {order.status.replace("_", " ")}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="rounded-md border border-[#cbd8ce] bg-white px-3 py-1.5 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
                          >
                            View 360
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
      </AdminShell>
    </RoleGuard>
  );
}
