"use client";

import { use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Barcode,
  Boxes,
  CheckSquare,
  FileSpreadsheet,
  MapPin,
  Printer,
  ShieldCheck,
  Warehouse,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import { getPickList } from "@/lib/fulfilment-api";
import type { PickListSummary } from "@/types/fulfilment";

function PickListContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || "";
  const orderIds = idsParam ? idsParam.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const { data: pickList, isLoading, error } = useQuery({
    queryKey: ["pick-list", idsParam],
    queryFn: () => getPickList(orderIds),
    enabled: orderIds.length > 0,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Header - hidden on print */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <Link
            href="/admin/fulfilment"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64766a] transition-colors hover:text-[#1b5e20]"
          >
            <ArrowLeft size={14} /> Back to Fulfilment Console
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
              <FileSpreadsheet size={20} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
              Godown Warehouse Pick List
            </h1>
          </div>
          <p className="mt-0.5 text-xs text-[#64766a]">
            Aggregated SKU bill of materials for warehouse staging & order picking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-md bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#154a19]"
          >
            <Printer size={15} />
            Print Pick List (Physical Dispatch)
          </button>
        </div>
      </div>

      {orderIds.length === 0 ? (
        <div className="rounded-xl border border-[#dce5dd] bg-white p-12 text-center shadow-xs">
          <Boxes size={36} className="mx-auto text-[#87958b]" />
          <h2 className="mt-3 text-base font-bold text-[#19392a]">No Orders Selected</h2>
          <p className="mt-1 text-xs text-[#64766a]">
            Please select one or more orders from the Fulfilment Console to generate a consolidated godown pick list.
          </p>
          <Link
            href="/admin/fulfilment"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19]"
          >
            Go to Fulfilment Console
          </Link>
        </div>
      ) : isLoading ? (
        <div className="rounded-xl border border-[#dce5dd] bg-white p-12 text-center shadow-xs">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#1b5e20] border-t-transparent" />
          <p className="mt-2 text-xs text-[#64766a]">Aggregating SKUs across orders...</p>
        </div>
      ) : pickList ? (
        <div className="rounded-xl border border-[#dce5dd] bg-white p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Printable Manifest Header */}
          <div className="flex flex-col gap-4 border-b border-[#dce5dd] pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-md bg-[#1b5e20] text-xs font-bold text-white">
                  AS
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#19392a]">Agribid Shudh Supply Chain</h2>
                  <p className="text-xs text-[#64766a]">Central Staging & Godown Dispatch Manifest</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#64766a]">
                <div className="flex items-center gap-1">
                  <Warehouse size={13} className="text-[#1b5e20]" />
                  <span>Hub: <strong>Pune Central Godown #2</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={13} className="text-[#1b5e20]" />
                  <span>Location: <strong>MIDC Bhosari Sector 4</strong></span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-[#19392a] border border-[#dce5dd] bg-[#f8faf8] px-3 py-1 rounded">
                <Barcode size={18} />
                <span>PL-{Date.now().toString().slice(-6)}</span>
              </div>
              <p className="mt-1 text-[11px] text-[#87958b]">
                Generated: {new Date(pickList.generated_at).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-[#f8faf8] p-4 sm:grid-cols-4 border border-[#eef2ef] text-xs">
            <div>
              <span className="text-[#87958b]">Total Orders:</span>
              <p className="text-base font-bold text-[#19392a]">{pickList.total_orders} Orders</p>
            </div>
            <div>
              <span className="text-[#87958b]">Distinct SKUs:</span>
              <p className="text-base font-bold text-[#19392a]">{pickList.total_sku_count} SKUs</p>
            </div>
            <div>
              <span className="text-[#87958b]">Total Units to Pick:</span>
              <p className="text-base font-bold text-[#1b5e20]">{pickList.total_units} Units</p>
            </div>
            <div>
              <span className="text-[#87958b]">Order Numbers:</span>
              <p className="font-mono text-[11px] font-semibold text-[#19392a] truncate">
                {pickList.order_numbers.join(", ")}
              </p>
            </div>
          </div>

          {/* Aggregated SKU Items Table */}
          <div className="overflow-hidden rounded-lg border border-[#dce5dd]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f1f5f1] font-semibold text-[#19392a] border-b border-[#dce5dd]">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">Check</th>
                  <th className="px-4 py-3">Commodity & SKU Code</th>
                  <th className="px-4 py-3">Godown Bin / Bay Location</th>
                  <th className="px-4 py-3 text-center">Pack UOM</th>
                  <th className="px-4 py-3 text-right">Total Qty to Pick</th>
                  <th className="px-4 py-3">Included in Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2ef]">
                {pickList.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfcfb]">
                    <td className="px-4 py-3.5 text-center">
                      <div className="size-4 border-2 border-dashed border-[#87958b] rounded mx-auto" />
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-[#19392a]">{item.product_name}</p>
                      <p className="font-mono text-[11px] text-[#87958b]">
                        SKU: {item.sku} · HSN: {item.hsn_code}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded bg-[#e9f1e9] px-2 py-0.5 text-[11px] font-semibold text-[#1b5e20]">
                        <MapPin size={11} />
                        {item.bin_location}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-[#64766a]">
                      {item.uom}
                    </td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-sm text-[#19392a]">
                      {item.total_quantity} {item.uom}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {item.order_ids.map((ord, oIdx) => (
                          <span
                            key={oIdx}
                            className="rounded border border-[#dce5dd] bg-white px-1.5 py-0.2 font-mono text-[10px] text-[#64766a]"
                          >
                            {ord}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Godown Signature / Verification Slip */}
          <div className="mt-8 pt-6 border-t border-[#dce5dd] grid grid-cols-3 gap-6 text-xs text-[#64766a]">
            <div>
              <p className="font-semibold text-[#19392a]">Warehouse Picker</p>
              <div className="mt-8 border-b border-dashed border-[#cbd8ce] w-3/4" />
              <p className="mt-1 text-[11px] text-[#87958b]">Sign & Date</p>
            </div>
            <div>
              <p className="font-semibold text-[#19392a]">Packing Supervisor</p>
              <div className="mt-8 border-b border-dashed border-[#cbd8ce] w-3/4" />
              <p className="mt-1 text-[11px] text-[#87958b]">Sign & Date</p>
            </div>
            <div>
              <p className="font-semibold text-[#19392a]">Security Gate Outpass</p>
              <div className="mt-8 border-b border-dashed border-[#cbd8ce] w-3/4" />
              <p className="mt-1 text-[11px] text-[#87958b]">Stamp & Vehicle Sign-off</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function WarehousePickListPage() {
  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "distributor"]}>
      <AdminShell>
        <Suspense fallback={<div className="p-8 text-xs text-center text-[#64766a]">Loading pick list...</div>}>
          <PickListContent />
        </Suspense>
      </AdminShell>
    </RoleGuard>
  );
}

