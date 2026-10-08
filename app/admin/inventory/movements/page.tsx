"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Boxes,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  History,
  Lock,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import { listStockMovements, listInventory } from "@/lib/inventory-api";
import type { StockMovement, StockMovementType } from "@/types/inventory";

function getMovementTypeBadge(type: StockMovementType) {
  switch (type) {
    case "OPENING":
      return {
        label: "Opening Stock",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: Boxes,
      };
    case "GRN":
      return {
        label: "Inbound GRN",
        className: "bg-teal-50 text-teal-700 border-teal-200",
        icon: ArrowDownLeft,
      };
    case "MANUAL_IN":
      return {
        label: "Manual Inward",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: ArrowDownLeft,
      };
    case "SALE_RESERVE":
      return {
        label: "Order Reserved",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Lock,
      };
    case "SALE_RELEASE":
      return {
        label: "Reserve Released",
        className: "bg-cyan-50 text-cyan-700 border-cyan-200",
        icon: RefreshCw,
      };
    case "SALE_DISPATCH":
      return {
        label: "Goods Dispatched",
        className: "bg-indigo-50 text-indigo-700 border-indigo-200",
        icon: Truck,
      };
    case "RETURN_IN":
      return {
        label: "Return Received",
        className: "bg-purple-50 text-purple-700 border-purple-200",
        icon: ArrowDownLeft,
      };
    case "RETURN_OUT":
      return {
        label: "Return Dispatched",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: ArrowUpRight,
      };
    case "ADJUST_DAMAGE":
      return {
        label: "Damage Write-off",
        className: "bg-rose-50 text-rose-700 border-rose-200",
        icon: AlertTriangle,
      };
    case "ADJUST_EXPIRY":
      return {
        label: "Expiry Write-off",
        className: "bg-red-50 text-red-700 border-red-200",
        icon: AlertCircle,
      };
    case "ADJUST_AUDIT":
      return {
        label: "Audit Variance",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: ShieldCheck,
      };
    default:
      return {
        label: type,
        className: "bg-slate-50 text-slate-700 border-slate-200",
        icon: History,
      };
  }
}

function MovementsContent() {
  const searchParams = useSearchParams();
  const initialSku = searchParams.get("sku") || "";

  const [selectedSku, setSelectedSku] = useState<string>(initialSku);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Query inventory items for SKU dropdown filter
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["inventory-list-simple"],
    queryFn: () => listInventory(),
  });

  // Query stock movements
  const {
    data: movements = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["stock-movements", selectedSku],
    queryFn: () => listStockMovements(selectedSku || undefined),
  });

  // Filter movements in memory by type and keyword search
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (selectedType !== "ALL" && m.type !== selectedType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSku = m.sku.toLowerCase().includes(q);
        const matchesName = m.product_name.toLowerCase().includes(q);
        const matchesReason = m.reason.toLowerCase().includes(q);
        const matchesRef = m.ref_id?.toLowerCase().includes(q);
        const matchesUser = m.performed_by.toLowerCase().includes(q);
        if (!matchesSku && !matchesName && !matchesReason && !matchesRef && !matchesUser) {
          return false;
        }
      }
      return true;
    });
  }, [movements, selectedType, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let inboundQty = 0;
    let outboundQty = 0;
    let damageLossQty = 0;

    movements.forEach((m) => {
      if (m.qty > 0) {
        inboundQty += m.qty;
      } else {
        outboundQty += Math.abs(m.qty);
      }
      if (m.type === "ADJUST_DAMAGE" || m.type === "ADJUST_EXPIRY") {
        damageLossQty += Math.abs(m.qty);
      }
    });

    return {
      totalCount: movements.length,
      inboundQty,
      outboundQty,
      damageLossQty,
    };
  }, [movements]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#64766a]">
            <Link
              href="/admin/inventory"
              className="inline-flex items-center gap-1 hover:text-[#1b5e20] transition-colors"
            >
              <ArrowLeft size={13} />
              Back to Inventory
            </Link>
            <span>/</span>
            <span className="text-[#19392a] font-semibold">Movement Audit Ledger</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="rounded-md bg-[#1b5e20]/10 p-2 text-[#1b5e20]">
              <History size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                Stock Movement Audit Ledger
              </h1>
              <p className="mt-0.5 text-sm text-[#64766a]">
                Immutable, append-only log of every stock debit, credit, reservation lock, and physical godown adjustment.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefetching ? "animate-spin text-[#1b5e20]" : "text-[#64766a]"} />
            Refresh Ledger
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64766a]">Total Ledger Entries</span>
            <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
              <History size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#19392a]">
            {metrics.totalCount}
          </p>
          <p className="mt-1 text-xs text-[#64766a]">
            {selectedSku ? `Filtered for ${selectedSku}` : "All warehouse SKUs"}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Total Inbound Units</span>
            <span className="rounded-md bg-emerald-100 p-1.5 text-emerald-700">
              <ArrowDownLeft size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-900">
            +{metrics.inboundQty.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Opening balance, GRNs, & inward returns
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-800">Total Outbound & Reserves</span>
            <span className="rounded-md bg-blue-100 p-1.5 text-blue-700">
              <Truck size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-blue-900">
            -{metrics.outboundQty.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-blue-700">
            Dispatches, order locks, and adjustments
          </p>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">Damaged / Expired Units</span>
            <span className="rounded-md bg-rose-100 p-1.5 text-rose-700">
              <AlertTriangle size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-rose-900">
            {metrics.damageLossQty > 0 ? `-${metrics.damageLossQty}` : "0"}
          </p>
          <p className="mt-1 text-xs text-rose-700">
            Logged physical spillage & write-offs
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64766a]"
              />
              <input
                type="text"
                placeholder="Search by reason, ref #, SKU, or staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-[#dce5dd] bg-white py-2 pl-9 pr-3 text-xs text-[#19392a] placeholder-[#64766a]/60 focus:border-[#1b5e20] focus:outline-hidden focus:ring-1 focus:ring-[#1b5e20]"
              />
            </div>

            {/* SKU Filter */}
            <div className="w-full sm:w-auto min-w-[190px]">
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-medium text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden focus:ring-1 focus:ring-[#1b5e20]"
              >
                <option value="">All Stock Keeping Units (SKUs)</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.sku}>
                    {item.sku} - {item.product_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Movement Type Filter */}
            <div className="w-full sm:w-auto min-w-[170px]">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-medium text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden focus:ring-1 focus:ring-[#1b5e20]"
              >
                <option value="ALL">All Movement Types</option>
                <option value="OPENING">Opening Stock</option>
                <option value="GRN">Inbound GRN</option>
                <option value="MANUAL_IN">Manual Inward</option>
                <option value="SALE_RESERVE">Order Reserved</option>
                <option value="SALE_RELEASE">Reserve Released</option>
                <option value="SALE_DISPATCH">Goods Dispatched</option>
                <option value="RETURN_IN">Return Inward</option>
                <option value="RETURN_OUT">Return Outward</option>
                <option value="ADJUST_DAMAGE">Damage Write-off</option>
                <option value="ADJUST_EXPIRY">Expiry Write-off</option>
                <option value="ADJUST_AUDIT">Audit Reconciliation</option>
              </select>
            </div>
          </div>

          {(selectedSku || selectedType !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedSku("");
                setSelectedType("ALL");
                setSearchQuery("");
              }}
              className="inline-flex items-center text-xs font-semibold text-[#1b5e20] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Movements Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
        <div className="border-b border-[#dce5dd] bg-[#f8faf8] px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#19392a]">
              Ledger Transactions ({filteredMovements.length})
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#64766a]">
              <ShieldCheck size={14} className="text-[#1b5e20]" />
              <span>Immutable Ledger · Compliant with GST & Warehouse Rules</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <RefreshCw size={24} className="animate-spin text-[#1b5e20]" />
            <p className="mt-3 text-xs font-medium text-[#64766a]">Loading stock transactions...</p>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <History size={36} className="text-[#64766a]/40" />
            <h3 className="mt-3 text-sm font-bold text-[#19392a]">No movement records found</h3>
            <p className="mt-1 text-xs text-[#64766a]">
              {selectedSku || selectedType !== "ALL" || searchQuery
                ? "No entries match your current search and filter parameters."
                : "No stock movements have been recorded yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#dce5dd] bg-[#f1f5f1]/60 text-[11px] font-semibold tracking-wider text-[#64766a] uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 sm:px-6">Timestamp & SKU</th>
                  <th scope="col" className="px-4 py-3">Movement Type</th>
                  <th scope="col" className="px-4 py-3 text-right">Qty Change</th>
                  <th scope="col" className="px-4 py-3 text-right">On Hand After</th>
                  <th scope="col" className="px-4 py-3 text-right">Reserved After</th>
                  <th scope="col" className="px-4 py-3">Reference / Doc</th>
                  <th scope="col" className="px-4 py-3 sm:px-6">Audit Reason & Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce5dd]">
                {filteredMovements.map((m) => {
                  const badge = getMovementTypeBadge(m.type);
                  const Icon = badge.icon;
                  const isPositive = m.qty > 0;
                  const formattedDate = new Date(m.created_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={m.id} className="hover:bg-[#f8faf8] transition-colors">
                      {/* Timestamp & SKU */}
                      <td className="px-4 py-3.5 sm:px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#19392a]">{m.sku}</span>
                          <span className="text-[11px] text-[#64766a] truncate max-w-[220px]">
                            {m.product_name}
                          </span>
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#64766a]">
                            <Clock size={11} className="text-[#64766a]" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </td>

                      {/* Movement Type */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}
                        >
                          <Icon size={12} />
                          {badge.label}
                        </span>
                      </td>

                      {/* Quantity Change */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span
                          className={`font-bold font-mono text-xs ${
                            isPositive
                              ? "text-emerald-700"
                              : m.type === "SALE_RESERVE"
                              ? "text-blue-700"
                              : "text-rose-700"
                          }`}
                        >
                          {isPositive ? `+${m.qty}` : m.qty}
                        </span>
                      </td>

                      {/* On Hand After */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono font-semibold text-[#19392a]">
                        {m.on_hand_after}
                      </td>

                      {/* Reserved After */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono text-[#64766a]">
                        {m.reserved_after}
                      </td>

                      {/* Reference */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#19392a]">
                            {m.ref_type}
                          </span>
                          {m.ref_id ? (
                            <span className="font-mono text-[11px] text-[#1b5e20] font-semibold">
                              {m.ref_id}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#64766a] italic">None</span>
                          )}
                        </div>
                      </td>

                      {/* Reason & Performed By */}
                      <td className="px-4 py-3.5 sm:px-6">
                        <div className="flex flex-col max-w-[280px]">
                          <span className="text-xs text-[#19392a] line-clamp-2">
                            {m.reason}
                          </span>
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#64766a]">
                            <User size={11} />
                            <span>{m.performed_by}</span>
                          </div>
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
  );
}

export default function StockMovementLedgerPage() {
  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "warehouse_manager"]}>
      <AdminShell>
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12">
              <RefreshCw size={24} className="animate-spin text-[#1b5e20]" />
            </div>
          }
        >
          <MovementsContent />
        </Suspense>
      </AdminShell>
    </RoleGuard>
  );
}

