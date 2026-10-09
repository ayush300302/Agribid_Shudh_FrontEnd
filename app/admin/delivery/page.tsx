"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  Bike,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  MapPin,
  Navigation,
  Package,
  Plus,
  Send,
  ShieldAlert,
  Star,
  Truck,
  UserCheck,
  X,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import {
  createShipment,
  dispatchShipment,
  listDeliveryPartners,
  listShipments,
} from "@/lib/delivery-api";
import { listOrders } from "@/lib/order-api";
import type { DeliveryPartner, Shipment, VehicleType } from "@/types/delivery";

function getVehicleIcon(type: VehicleType) {
  switch (type) {
    case "BIKE":
    case "CARGO_BIKE":
      return <Bike size={18} className="text-emerald-700" />;
    case "PICKUP":
    case "MINI_TRUCK":
      return <Truck size={18} className="text-blue-700" />;
    default:
      return <Truck size={18} className="text-indigo-700" />;
  }
}

function getShipmentStatusBadge(status: string) {
  switch (status) {
    case "DISPATCHED":
      return "bg-cyan-50 text-cyan-800 border-cyan-200";
    case "IN_TRANSIT":
      return "bg-amber-50 text-amber-800 border-amber-200 animate-pulse";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "ASSIGNED":
    default:
      return "bg-purple-50 text-purple-800 border-purple-200";
  }
}

export default function DeliveryConsolePage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);

  // Queries
  const { data: partners = [], isLoading: loadingPartners } = useQuery({
    queryKey: ["delivery-partners"],
    queryFn: () => listDeliveryPartners(),
  });

  const { data: shipments = [], isLoading: loadingShipments } = useQuery({
    queryKey: ["delivery-shipments"],
    queryFn: () => listShipments(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders-ready-for-dispatch"],
    queryFn: () => listOrders(),
  });

  // Packed or confirmed orders that can be dispatched
  const eligibleOrders = orders.filter(
    (o) => o.status === "packed" || o.status === "confirmed" || o.status === "new",
  );

  const selectedPartner = partners.find((p) => p.id === selectedPartnerId);

  // Calculate estimated total weight
  const selectedWeight = eligibleOrders
    .filter((o) => selectedOrderIds.includes(o.id))
    .reduce((acc, o) => acc + o.lines.reduce((lSum, l) => lSum + l.ordered_qty * 40, 0), 0);

  const isCapacityExceeded =
    selectedPartner && selectedWeight > selectedPartner.capacity_kg;

  // Create Shipment Mutation
  const createMutation = useMutation({
    mutationFn: () => {
      if (selectedOrderIds.length === 0) {
        throw new Error("Please select at least one order to dispatch");
      }
      if (!selectedPartnerId) {
        throw new Error("Please select a delivery carrier vehicle");
      }
      if (isCapacityExceeded) {
        throw new Error(
          `Weight (${selectedWeight} kg) exceeds vehicle capacity (${selectedPartner?.capacity_kg} kg)`,
        );
      }
      return createShipment({
        order_ids: selectedOrderIds,
        delivery_partner_id: selectedPartnerId,
      });
    },
    onSuccess: () => {
      setShowCreateModal(false);
      setSelectedOrderIds([]);
      setCreateError(null);
      queryClient.invalidateQueries({ queryKey: ["delivery-shipments"] });
    },
    onError: (err: any) => {
      setCreateError(err.message || "Failed to create shipment run");
    },
  });

  // Dispatch Shipment Mutation
  const dispatchMutation = useMutation({
    mutationFn: (id: string) => dispatchShipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-shipments"] });
    },
  });

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "distributor"]}>
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
                  Dispatch & Fleet Operations
                </h1>
              </div>
              <p className="mt-1 text-sm text-[#64766a]">
                Delivery vehicles, payload capacity validation, consolidated trip manifests, and live OTP verification.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedPartnerId(partners[0]?.id || "");
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] transition-colors"
              >
                <Plus size={15} /> Create Dispatch Run
              </button>
            </div>
          </div>

          {/* Fleet Vehicles Status Cards */}
          <div>
            <h2 className="text-sm font-bold text-[#19392a] mb-3 flex items-center gap-2">
              <Truck size={16} className="text-[#1b5e20]" />
              Active Fleet & Vehicle Capacities
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {partners.map((partner) => {
                const isAvailable = partner.status === "AVAILABLE";
                return (
                  <div
                    key={partner.id}
                    className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md bg-[#f1f5f1] p-2">
                          {getVehicleIcon(partner.vehicle_type)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#19392a]">{partner.name}</p>
                          <p className="font-mono text-[10px] text-[#87958b]">
                            {partner.vehicle_no}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          isAvailable
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {partner.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-[#64766a]">
                        <span>Vehicle Type:</span>
                        <span className="font-semibold text-[#19392a]">
                          {partner.vehicle_type.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#64766a]">
                        <span>Payload Limit:</span>
                        <span className="font-bold text-[#19392a]">
                          {partner.capacity_kg.toLocaleString("en-IN")} kg
                        </span>
                      </div>
                      <div className="flex justify-between text-[#64766a]">
                        <span>Driver Rating:</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {partner.rating} ({partner.trips_count} trips)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Shipments Table */}
          <div className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#19392a]">
                  Consolidated Shipments & Trip Manifests
                </h3>
                <p className="text-xs text-[#64766a]">
                  Grouped delivery runs with live tracking links and driver handover OTPs.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#19392a]">
                {shipments.length} Active Runs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#19392a]">
                  <tr>
                    <th className="px-4 py-3">Shipment Ref</th>
                    <th className="px-4 py-3">Carrier / Vehicle</th>
                    <th className="px-4 py-3">Destination Route</th>
                    <th className="px-4 py-3 text-center">Payload Utilization</th>
                    <th className="px-4 py-3 text-center">Orders</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Live Tracking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2ef]">
                  {loadingShipments ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#64766a]">
                        Loading delivery shipments...
                      </td>
                    </tr>
                  ) : shipments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#64766a]">
                        No active shipments. Click "Create Dispatch Run" to stage orders.
                      </td>
                    </tr>
                  ) : (
                    shipments.map((shp) => (
                      <tr key={shp.id} className="hover:bg-[#fafbfa]">
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-[#1b5e20]">{shp.shipment_number}</p>
                          <p className="text-[10px] text-[#87958b]">
                            {new Date(shp.created_at).toLocaleDateString("en-IN")}
                          </p>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-[#19392a]">
                            {shp.delivery_partner?.name || shp.transporter_name}
                          </p>
                          <p className="font-mono text-[10px] text-[#87958b]">
                            {shp.delivery_partner?.vehicle_no}
                          </p>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-medium text-[#19392a]">{shp.destination_summary}</p>
                          <p className="text-[10px] text-[#87958b] flex items-center gap-1">
                            <Clock size={10} /> {shp.eta}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-bold text-[#19392a]">
                              {shp.load_kg} / {shp.vehicle_capacity_kg} kg
                            </span>
                            <div className="mt-1 h-1.5 w-24 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="h-full bg-[#1b5e20] rounded-full"
                                style={{ width: `${shp.capacity_utilization_pct}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-[#87958b] mt-0.5">
                              {shp.capacity_utilization_pct}% utilized
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-center font-bold text-[#19392a]">
                          {shp.order_ids.length} PO(s)
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getShipmentStatusBadge(
                              shp.status,
                            )}`}
                          >
                            {shp.status.replace("_", " ")}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {shp.status === "ASSIGNED" && (
                              <button
                                type="button"
                                onClick={() => dispatchMutation.mutate(shp.id)}
                                className="rounded bg-cyan-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-cyan-800 transition-colors"
                              >
                                Dispatch Run
                              </button>
                            )}

                            <Link
                              href={`/track/${shp.tracking_token}`}
                              className="inline-flex items-center gap-1 rounded bg-[#f1f5f1] px-2.5 py-1 text-[11px] font-semibold text-[#1b5e20] hover:bg-[#e1eae3] transition-colors"
                            >
                              <Navigation size={12} /> Live Track
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

        {/* Modal: Create Consolidated Dispatch Run */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#19392a]">
                    Create Consolidated Dispatch Run
                  </h3>
                  <p className="text-xs text-[#64766a]">
                    Assign pending orders to a carrier fleet vehicle under Rule DL-01 capacity limits.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded p-1 text-[#87958b] hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              {createError && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-600" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                {/* 1. Vehicle Selector */}
                <div>
                  <label className="block font-semibold text-[#3b4c40] mb-1">
                    Select Fleet Vehicle / Carrier *
                  </label>
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    className="w-full rounded-md border border-[#cbd8ce] bg-white px-3 py-2 text-xs text-[#19392a] outline-none focus:border-[#1b5e20]"
                  >
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.vehicle_type} ({p.vehicle_no}) - Capacity: {p.capacity_kg} kg
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Orders Selection */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-semibold text-[#3b4c40]">
                      Select Orders to Load ({selectedOrderIds.length} selected) *
                    </label>
                    <span className="text-[11px] font-bold text-[#19392a]">
                      Estimated Load: {selectedWeight} kg / Limit: {selectedPartner?.capacity_kg || 0} kg
                    </span>
                  </div>

                  {isCapacityExceeded && (
                    <div className="mb-2 p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-amber-700" />
                      <span>Rule DL-01 Warning: Payload exceeds vehicle limit! Please uncheck some orders or select a larger truck.</span>
                    </div>
                  )}

                  <div className="max-h-48 overflow-y-auto space-y-2 rounded border border-[#e1eae3] p-2 bg-[#f8faf8]">
                    {eligibleOrders.map((ord) => {
                      const isChecked = selectedOrderIds.includes(ord.id);
                      const estWeight = ord.lines.reduce((s, l) => s + l.ordered_qty * 40, 0);

                      return (
                        <label
                          key={ord.id}
                          className={`flex items-center justify-between p-2.5 rounded border cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-[#e9f1e9] border-[#1b5e20]"
                              : "bg-white border-[#dce5dd] hover:bg-[#fafbfa]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectOrder(ord.id)}
                              className="rounded border-[#cbd8ce] text-[#1b5e20] focus:ring-[#1b5e20]"
                            />
                            <div>
                              <p className="font-bold text-[#19392a]">{ord.order_number}</p>
                              <p className="text-[11px] text-[#64766a]">
                                {ord.buyer_name} · {ord.delivery_address?.city || "Nashik"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#19392a]">~{estWeight} kg</span>
                            <p className="text-[10px] text-[#87958b]">
                              ₹{ord.grand_total?.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef2ef] pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md border border-[#cbd8ce] px-4 py-2 text-xs font-semibold text-[#64766a] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || selectedOrderIds.length === 0 || isCapacityExceeded}
                  className="rounded-md bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Confirm & Create Dispatch Run"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminShell>
    </RoleGuard>
  );
}
