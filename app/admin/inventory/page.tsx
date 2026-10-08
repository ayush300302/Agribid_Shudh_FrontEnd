"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  Layers,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShoppingCart,
  Sliders,
  Warehouse,
  X,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import {
  adjustStock,
  getReorderSuggestions,
  listInventory,
  stockInItem,
} from "@/lib/inventory-api";
import { listProducts } from "@/lib/catalog-api";
import type {
  AdjustStockRequest,
  InventoryItem,
  ReorderSuggestion,
  StockInRequest,
  StockStatus,
} from "@/types/inventory";

function getStatusBadge(status: StockStatus) {
  switch (status) {
    case "OUT_OF_STOCK":
      return "bg-red-50 text-red-700 border-red-200 animate-pulse";
    case "LOW_STOCK":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "IN_STOCK":
    default:
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
}

export default function InventoryConsolePage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLowOnly, setShowLowOnly] = useState(false);

  // Modals state
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [stockInProductId, setStockInProductId] = useState("");
  const [stockInQty, setStockInQty] = useState<number>(50);
  const [stockInCost, setStockInCost] = useState<number>(3500);
  const [stockInLocation, setStockInLocation] = useState("Godown 1 · Bay 04");
  const [stockInNotes, setStockInNotes] = useState("Inbound truck arrival APMC Pune");

  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<
    "ADJUST_DAMAGE" | "ADJUST_EXPIRY" | "ADJUST_AUDIT" | "MANUAL_IN"
  >("ADJUST_DAMAGE");
  const [adjustQtyChange, setAdjustQtyChange] = useState<number>(-2);
  const [adjustReason, setAdjustReason] = useState("Damaged bag during forklift transfer");
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Queries
  const { data: inventory = [], isLoading, refetch } = useQuery({
    queryKey: ["inventory-list", showLowOnly],
    queryFn: () => listInventory({ lowOnly: showLowOnly }),
  });

  const { data: productsData } = useQuery({
    queryKey: ["catalog-products-for-stockin"],
    queryFn: () => listProducts({ status: "active", pageSize: 50 }),
  });

  const { data: reorderSuggestions = [] } = useQuery({
    queryKey: ["reorder-suggestions"],
    queryFn: () => getReorderSuggestions(),
  });

  const products = productsData?.products || [];

  // Filter items
  const filteredItems = inventory.filter((item) => {
    if (activeTab === "low_stock" && !item.is_low_stock) return false;
    if (activeTab === "out_of_stock" && item.stock_status !== "OUT_OF_STOCK") return false;
    if (activeTab === "rice" && !item.category_name.toLowerCase().includes("rice")) return false;
    if (activeTab === "oils" && !item.category_name.toLowerCase().includes("oil")) return false;
    if (activeTab === "pulses" && !item.category_name.toLowerCase().includes("pulse") && !item.category_name.toLowerCase().includes("dal")) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSku = item.sku.toLowerCase().includes(q);
      const matchName = item.product_name.toLowerCase().includes(q);
      const matchLoc = item.location_label.toLowerCase().includes(q);
      return matchSku || matchName || matchLoc;
    }
    return true;
  });

  // Metrics
  const totalOnHand = inventory.reduce((sum, i) => sum + i.on_hand, 0);
  const totalReserved = inventory.reduce((sum, i) => sum + i.reserved, 0);
  const totalAvailable = inventory.reduce((sum, i) => sum + i.available, 0);
  const lowStockCount = inventory.filter((i) => i.is_low_stock).length;

  // Stock-In Mutation
  const stockInMutation = useMutation({
    mutationFn: () =>
      stockInItem({
        product_id: stockInProductId || (products[0]?.id ?? "prod-1"),
        quantity: stockInQty,
        unit_cost: stockInCost,
        location_label: stockInLocation,
        notes: stockInNotes,
      }),
    onSuccess: () => {
      setShowStockInModal(false);
      queryClient.invalidateQueries({ queryKey: ["inventory-list"] });
      queryClient.invalidateQueries({ queryKey: ["reorder-suggestions"] });
      refetch();
    },
  });

  // Adjust Mutation
  const adjustMutation = useMutation({
    mutationFn: () => {
      if (!adjustTarget) throw new Error("No item target");
      return adjustStock(adjustTarget.product_id, {
        type: adjustType,
        quantity_change: adjustQtyChange,
        reason: adjustReason,
      });
    },
    onSuccess: () => {
      setAdjustTarget(null);
      setAdjustError(null);
      queryClient.invalidateQueries({ queryKey: ["inventory-list"] });
      queryClient.invalidateQueries({ queryKey: ["reorder-suggestions"] });
      refetch();
    },
    onError: (err: any) => {
      setAdjustError(err.message || "Failed to adjust inventory");
    },
  });

  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "distributor", "sub_distributor"]}>
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <Boxes size={20} />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                  Inventory & Godown Stock
                </h1>
              </div>
              <p className="mt-1 text-sm text-[#64766a]">
                Physical warehouse stock, reservation locks, minimum reorder alerts, and immutable movement ledger.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/inventory/movements"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5dd] bg-white px-3.5 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
              >
                <History size={14} className="text-[#1b5e20]" />
                Movement Audit Ledger
              </Link>

              <button
                type="button"
                onClick={() => {
                  setStockInProductId(products[0]?.id || "prod-1");
                  setShowStockInModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] transition-colors"
              >
                <Plus size={14} /> Stock In (GRN Inbound)
              </button>
            </div>
          </div>

          {/* Metrics Summary Bar */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs sm:grid-cols-4">
            <div className="border-r border-[#eef2ef] pr-4">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase tracking-wider">
                Physical On-Hand
              </span>
              <p className="mt-1 text-2xl font-black text-[#19392a]">
                {totalOnHand.toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] text-[#64766a]">
                Total units physically in godown
              </span>
            </div>

            <div className="border-r border-[#eef2ef] pr-4">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase tracking-wider">
                Reserved in POs
              </span>
              <p className="mt-1 text-2xl font-black text-amber-700">
                {totalReserved.toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] text-[#64766a]">
                Allocated to confirmed orders
              </span>
            </div>

            <div className="border-r border-[#eef2ef] pr-4">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase tracking-wider">
                Net Available Stock
              </span>
              <p className="mt-1 text-2xl font-black text-[#1b5e20]">
                {totalAvailable.toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold">
                Available to sell
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[#87958b] uppercase tracking-wider">
                Low Stock Thresholds
              </span>
              <p className="mt-1 text-2xl font-black text-red-600">
                {lowStockCount} SKUs
              </p>
              <span className="text-[10px] text-[#64766a]">
                Below min reorder level
              </span>
            </div>
          </div>

          {/* Low Stock Warning Banner if applicable */}
          {lowStockCount > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={18} className="text-amber-700 shrink-0" />
                <div>
                  <span className="font-bold">Rule IV-05 Low Stock Alert:</span>{" "}
                  {lowStockCount} commodity item(s) are below safety threshold. Review recommended reorder packs below.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("low_stock")}
                className="font-bold text-amber-900 underline hover:text-amber-950"
              >
                View Low Stock SKUs
              </button>
            </div>
          )}

          {/* Category & Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#dce5dd] pb-3">
            {[
              { id: "all", label: "All Commodities" },
              { id: "low_stock", label: `Low Stock (${lowStockCount})`, alert: lowStockCount > 0 },
              { id: "rice", label: "Rice & Grains" },
              { id: "oils", label: "Edible Oils" },
              { id: "pulses", label: "Pulses & Dals" },
              { id: "reorders", label: `Reorder Suggestions (${reorderSuggestions.length})` },
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
                placeholder="Search by SKU Code, Commodity Name, Godown Bay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-[#cbd8ce] bg-white pl-9 pr-3 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
              />
            </div>

            <div className="text-xs text-[#64766a]">
              Showing <span className="font-semibold text-[#19392a]">{filteredItems.length}</span> items
            </div>
          </div>

          {/* Main Content: Reorder Tab vs Main Inventory Table */}
          {activeTab === "reorders" ? (
            <div className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs space-y-4">
              <div className="border-b border-[#eef2ef] pb-3">
                <h3 className="text-base font-bold text-[#19392a]">
                  Rule IV-05 Reorder Replenishment Suggestions
                </h3>
                <p className="text-xs text-[#64766a]">
                  Algorithmically computed purchase orders based on lead-time and safety thresholds.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {reorderSuggestions.map((rec) => (
                  <div
                    key={rec.product_id}
                    className="rounded-lg border border-amber-200 bg-amber-50/40 p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-[#19392a]">{rec.product_name}</h4>
                        <p className="font-mono text-[11px] text-[#87958b]">SKU: {rec.sku}</p>
                      </div>
                      <span className="rounded bg-red-100 text-red-800 px-2 py-0.5 text-[10px] font-bold">
                        {rec.available} {rec.uom} left (Min: {rec.min_level})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#64766a] pt-1 border-t border-amber-200">
                      <div>
                        <span className="text-[#87958b]">Suggested Reorder:</span>
                        <p className="font-extrabold text-[#19392a] text-sm">
                          {rec.suggested_reorder_qty} {rec.uom}
                        </p>
                      </div>
                      <div>
                        <span className="text-[#87958b]">Estimated Cost:</span>
                        <p className="font-extrabold text-[#1b5e20] text-sm">
                          ₹{rec.estimated_cost?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Link
                        href="/admin/orders/new"
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19]"
                      >
                        <ShoppingCart size={13} /> Raise Replenishment PO
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Main Inventory Table */
            <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#19392a]">
                    <tr>
                      <th className="px-4 py-3.5">Commodity & SKU</th>
                      <th className="px-4 py-3.5">Godown Bay Location</th>
                      <th className="px-4 py-3.5 text-right">Physical On-Hand</th>
                      <th className="px-4 py-3.5 text-right">Reserved (In POs)</th>
                      <th className="px-4 py-3.5 text-right">Available to Sell</th>
                      <th className="px-4 py-3.5 text-center">Safety Min</th>
                      <th className="px-4 py-3.5 text-center">Stock Status</th>
                      <th className="px-4 py-3.5 text-right">Wtd Avg Cost</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2ef]">
                    {isLoading ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-[#64766a]">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#1b5e20] border-t-transparent" />
                          <p className="mt-2 text-xs">Loading warehouse inventory...</p>
                        </td>
                      </tr>
                    ) : filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-[#64766a]">
                          <Boxes size={32} className="mx-auto text-[#87958b]" />
                          <p className="mt-2 text-sm font-semibold text-[#19392a]">No commodities found</p>
                          <p className="text-xs mt-0.5">Use "Stock In" to record incoming godown deliveries.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item.id} className="transition-colors hover:bg-[#f8faf8]">
                          {/* Commodity & SKU */}
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-[#19392a]">{item.product_name}</p>
                            <p className="font-mono text-[10px] text-[#87958b]">
                              SKU: {item.sku} · {item.category_name}
                            </p>
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1 rounded bg-[#f1f5f1] px-2 py-0.5 text-[11px] font-medium text-[#19392a]">
                              <MapPin size={11} className="text-[#1b5e20]" />
                              {item.location_label}
                            </span>
                          </td>

                          {/* On Hand */}
                          <td className="px-4 py-3.5 text-right font-semibold text-[#19392a]">
                            {item.on_hand} {item.uom}
                          </td>

                          {/* Reserved */}
                          <td className="px-4 py-3.5 text-right font-medium text-amber-700">
                            {item.reserved} {item.uom}
                          </td>

                          {/* Available */}
                          <td className="px-4 py-3.5 text-right font-extrabold text-sm text-[#1b5e20]">
                            {item.available} {item.uom}
                          </td>

                          {/* Min Level */}
                          <td className="px-4 py-3.5 text-center font-mono text-[#64766a]">
                            {item.min_level} {item.uom}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(
                                item.stock_status,
                              )}`}
                            >
                              {item.stock_status.replace("_", " ")}
                            </span>
                          </td>

                          {/* Wtd Avg Cost */}
                          <td className="px-4 py-3.5 text-right font-medium text-[#19392a]">
                            ₹{item.purchase_price?.toLocaleString("en-IN")}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setAdjustTarget(item);
                                  setAdjustQtyChange(-1);
                                  setAdjustReason("Damaged packaging detected in stack");
                                }}
                                className="rounded border border-[#cbd8ce] bg-white px-2 py-1 text-[11px] font-semibold text-[#19392a] hover:bg-[#f1f5f1] transition-colors"
                              >
                                Adjust
                              </button>

                              <Link
                                href={`/admin/inventory/movements?sku=${item.sku}`}
                                className="rounded p-1 text-[#87958b] hover:bg-gray-100 hover:text-[#19392a] transition-colors"
                                title="View Movement Ledger"
                              >
                                <History size={14} />
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
          )}
        </div>

        {/* Modal 1: Stock In (GRN Inbound Delivery) */}
        {showStockInModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div className="flex items-center gap-2 text-[#1b5e20]">
                  <Boxes size={20} />
                  <h3 className="text-base font-bold text-[#19392a]">Stock-In (Inbound GRN)</h3>
                </div>
                <button
                  onClick={() => setShowStockInModal(false)}
                  className="rounded p-1 text-[#87958b] hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Commodity SKU *
                  </label>
                  <select
                    value={stockInProductId}
                    onChange={(e) => setStockInProductId(e.target.value)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) · UOM: {p.uom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#3b4c40] mb-1">
                      Inbound Quantity *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={stockInQty}
                      onChange={(e) => setStockInQty(parseInt(e.target.value) || 1)}
                      className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-[#1b5e20] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#3b4c40] mb-1">
                      Unit Purchase Cost (₹) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={stockInCost}
                      onChange={(e) => setStockInCost(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-[#1b5e20] font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Godown Bay / Location
                  </label>
                  <input
                    type="text"
                    value={stockInLocation}
                    onChange={(e) => setStockInLocation(e.target.value)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Inward Remarks / Delivery Slip #
                  </label>
                  <textarea
                    rows={2}
                    value={stockInNotes}
                    onChange={(e) => setStockInNotes(e.target.value)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef2ef] pt-4">
                <button
                  type="button"
                  onClick={() => setShowStockInModal(false)}
                  className="rounded-md border border-[#cbd8ce] px-4 py-2 text-xs font-semibold text-[#64766a] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => stockInMutation.mutate()}
                  disabled={stockInMutation.isPending || stockInQty <= 0}
                  className="rounded-md bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50"
                >
                  {stockInMutation.isPending ? "Recording..." : "Record Inbound GRN"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Adjust Stock (Damage, Expiry, Audit) */}
        {adjustTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#19392a]">
                    Adjust Stock · {adjustTarget.product_name}
                  </h3>
                  <p className="text-[11px] text-[#64766a]">
                    Current On-Hand: <strong>{adjustTarget.on_hand} {adjustTarget.uom}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setAdjustTarget(null)}
                  className="rounded p-1 text-[#87958b] hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              {adjustError && (
                <div className="rounded bg-red-50 p-2.5 text-xs text-red-800 border border-red-200 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-600" />
                  <span>{adjustError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Adjustment Reason Code *
                  </label>
                  <select
                    value={adjustType}
                    onChange={(e: any) => setAdjustType(e.target.value)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                  >
                    <option value="ADJUST_DAMAGE">Physical Damage / Spillage (Negative)</option>
                    <option value="ADJUST_EXPIRY">Expired / Quality Degraded (Negative)</option>
                    <option value="ADJUST_AUDIT">Stock Audit Reconciliation (+ or -)</option>
                    <option value="MANUAL_IN">Found Surplus Stock (Positive)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Quantity Change (Signed: e.g. -5 for damage, +10 for surplus) *
                  </label>
                  <input
                    type="number"
                    value={adjustQtyChange}
                    onChange={(e) => setAdjustQtyChange(parseInt(e.target.value) || 0)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-[#1b5e20] font-bold"
                  />
                  <p className="mt-1 text-[11px] text-[#87958b]">
                    Resulting On-Hand will be:{" "}
                    <strong>{adjustTarget.on_hand + adjustQtyChange} {adjustTarget.uom}</strong>
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Mandatory Audit Justification *
                  </label>
                  <textarea
                    rows={2}
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Provide specific justification..."
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef2ef] pt-4">
                <button
                  type="button"
                  onClick={() => setAdjustTarget(null)}
                  className="rounded-md border border-[#cbd8ce] px-4 py-2 text-xs font-semibold text-[#64766a] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => adjustMutation.mutate()}
                  disabled={adjustMutation.isPending || adjustQtyChange === 0}
                  className="rounded-md bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50"
                >
                  {adjustMutation.isPending ? "Applying..." : "Save Stock Adjustment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminShell>
    </RoleGuard>
  );
}
