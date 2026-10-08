/**
 * Module 09: Dispatch & Delivery Mock Store & Dispatch Engine
 * Matches Dev Spec M09 and Delivery Rules DL-01..05
 */

import { MOCK_ORDERS } from "@/lib/mock-orders";
import type {
  CompleteDeliveryRequest,
  CreateShipmentRequest,
  DeliveryPartner,
  DeliveryPOD,
  DeliveryTrackingInfo,
  Shipment,
} from "@/types/delivery";

export const MOCK_DELIVERY_PARTNERS: DeliveryPartner[] = [
  {
    id: "dp-001",
    seller_id: "p-001",
    name: "Suresh Jadhav",
    mobile: "+91 98220 12345",
    vehicle_type: "PICKUP",
    vehicle_no: "MH-12-RN-4421",
    capacity_kg: 1500,
    current_load_kg: 950,
    status: "ON_DELIVERY",
    rating: 4.8,
    trips_count: 142,
    driver_license_no: "MH12-20180019234",
    created_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "dp-002",
    seller_id: "p-001",
    name: "Ramesh Pawar",
    mobile: "+91 98220 54321",
    vehicle_type: "MINI_TRUCK",
    vehicle_no: "MH-14-BT-9921",
    capacity_kg: 2500,
    current_load_kg: 0,
    status: "AVAILABLE",
    rating: 4.9,
    trips_count: 89,
    driver_license_no: "MH14-20190028192",
    created_at: "2026-02-01T11:00:00Z",
  },
  {
    id: "dp-003",
    seller_id: "p-001",
    name: "Ganesh Gaikwad",
    mobile: "+91 98220 67890",
    vehicle_type: "CARGO_BIKE",
    vehicle_no: "MH-12-EA-1022",
    capacity_kg: 150,
    current_load_kg: 0,
    status: "AVAILABLE",
    rating: 4.7,
    trips_count: 310,
    driver_license_no: "MH12-20200088123",
    created_at: "2026-02-15T09:30:00Z",
  },
  {
    id: "dp-004",
    seller_id: "p-001",
    name: "VRL Logistics Express Line",
    mobile: "+91 98220 88990",
    vehicle_type: "TRUCK",
    vehicle_no: "MH-04-AZ-8812",
    capacity_kg: 10000,
    current_load_kg: 0,
    status: "AVAILABLE",
    rating: 4.9,
    trips_count: 52,
    driver_license_no: "MH04-COMM-00129",
    created_at: "2026-03-01T08:00:00Z",
  },
];

export const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: "shp-001",
    shipment_number: "SHP-MH-2609-0081",
    order_ids: ["ord-001", "ord-002"],
    orders: [
      {
        order_id: "ord-001",
        order_number: "ORD-2609-000101",
        buyer_name: "Kisan Seva Krishi Kendra",
        destination_city: "Nashik APMC",
        weight_kg: 2750,
        packages_count: 55,
        grand_total: 210672,
        is_pod: false,
        status: "delivered",
      },
      {
        order_id: "ord-002",
        order_number: "ORD-2609-000102",
        buyer_name: "Vidarbha Fertilizers & Seeds",
        destination_city: "Nagpur Central",
        weight_kg: 750,
        packages_count: 50,
        grand_total: 91770,
        is_pod: false,
        status: "shipped",
      },
    ],
    delivery_partner_id: "dp-001",
    delivery_partner: MOCK_DELIVERY_PARTNERS[0],
    transporter_name: "MahaAgro Logistics Express",
    load_kg: 3500,
    vehicle_capacity_kg: 5000,
    capacity_utilization_pct: 70,
    pickup_location: "Pune Bhosari Central Godown #2",
    destination_summary: "Nashik & Nagpur Mandi Route",
    eta: "Today, 5:30 PM",
    status: "IN_TRANSIT",
    tracking_token: "track_8a2f1b4c9e3d0f7a6b5c4d3e2f1a0b9c",
    dispatched_at: "2026-03-12T14:30:00Z",
    created_at: "2026-03-12T12:00:00Z",
  },
];

export const MOCK_PODS: Record<string, DeliveryPOD> = {
  "ord-001": {
    id: "pod-101",
    order_id: "ord-001",
    order_number: "ORD-2609-000101",
    shipment_id: "shp-001",
    method: "OTP",
    otp: "7419",
    otp_verified: true,
    otp_verified_at: "2026-03-11T16:45:00Z",
    receiver_name: "Kailash Patil (Store Manager)",
    receiver_phone: "+91 98220 99441",
    delivered_at: "2026-03-11T16:45:00Z",
    notes: "55 bags 1121 Basmati Rice unloaded cleanly at Bay 2.",
  },
};

export const MOCK_ORDER_OTPS: Record<string, string> = {
  "ord-002": "4829",
  "ord-003": "9104",
  "ord-004": "5532",
};

export function listDeliveryPartnersMock(): DeliveryPartner[] {
  return MOCK_DELIVERY_PARTNERS;
}

export function listShipmentsMock(): Shipment[] {
  return MOCK_SHIPMENTS;
}

export function createShipmentMock(req: CreateShipmentRequest): Shipment {
  const selectedOrders = MOCK_ORDERS.filter((o) => req.order_ids.includes(o.id));
  if (selectedOrders.length === 0) {
    throw new Error("At least one order must be selected for shipment");
  }

  const partner = MOCK_DELIVERY_PARTNERS.find(
    (dp) => dp.id === req.delivery_partner_id,
  );

  // Calculate total weight (estimate 50kg per bag or 15kg per tin)
  let totalWeight = 0;
  const orderSummaries = selectedOrders.map((ord) => {
    const w = ord.lines.reduce((acc, l) => acc + l.ordered_qty * 40, 0);
    totalWeight += w;
    return {
      order_id: ord.id,
      order_number: ord.order_number,
      buyer_name: ord.buyer_name,
      destination_city: ord.delivery_address?.city || "Mandi Godown",
      weight_kg: w,
      packages_count: ord.lines.reduce((acc, l) => acc + l.ordered_qty, 0),
      grand_total: ord.grand_total,
      is_pod: ord.payment_mode === "pod",
      status: ord.status,
    };
  });

  // Rule DL-01: Capacity Validation
  if (partner && totalWeight > partner.capacity_kg) {
    throw new Error(
      `Capacity exceeded: Selected orders total ${totalWeight} kg, which exceeds ${partner.name}'s vehicle capacity of ${partner.capacity_kg} kg (Rule DL-01)`,
    );
  }

  const token = `track_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
  const shipmentNum = `SHP-MH-2609-${Math.floor(1000 + Math.random() * 9000)}`;

  const newShipment: Shipment = {
    id: `shp-${Date.now()}`,
    shipment_number: shipmentNum,
    order_ids: req.order_ids,
    orders: orderSummaries,
    delivery_partner_id: partner?.id,
    delivery_partner: partner,
    transporter_name: partner?.name || req.transporter_name || "MahaAgro Fleet",
    load_kg: totalWeight,
    vehicle_capacity_kg: partner?.capacity_kg || 5000,
    capacity_utilization_pct: Math.min(
      100,
      Math.round((totalWeight / (partner?.capacity_kg || 5000)) * 100),
    ),
    pickup_location: "Pune Bhosari Central Godown #2",
    destination_summary: orderSummaries.map((o) => o.destination_city).join(", "),
    eta: "Expected within 24 hours",
    status: "ASSIGNED",
    tracking_token: token,
    created_at: new Date().toISOString(),
  };

  MOCK_SHIPMENTS.unshift(newShipment);
  return newShipment;
}

export function dispatchShipmentMock(shipmentId: string): Shipment {
  const shp = MOCK_SHIPMENTS.find((s) => s.id === shipmentId);
  if (!shp) throw new Error(`Shipment ${shipmentId} not found`);

  shp.status = "DISPATCHED";
  shp.dispatched_at = new Date().toISOString();

  // Mark all orders as shipped
  for (const ordSummary of shp.orders) {
    const ord = MOCK_ORDERS.find((o) => o.id === ordSummary.order_id);
    if (ord) {
      ord.status = "shipped";
      if (!MOCK_ORDER_OTPS[ord.id]) {
        MOCK_ORDER_OTPS[ord.id] = Math.floor(1000 + Math.random() * 9000).toString();
      }
    }
    ordSummary.status = "shipped";
  }

  return shp;
}

export function getTrackingInfoByTokenMock(
  token: string,
): DeliveryTrackingInfo | null {
  const shp = MOCK_SHIPMENTS.find((s) => s.tracking_token === token);
  if (!shp) return null;

  const targetOrderId = shp.order_ids[0];
  const activeOtp = MOCK_ORDER_OTPS[targetOrderId] || "4829";

  return {
    token,
    shipment: shp,
    timeline: [
      {
        status: "packed",
        label: "Goods Packed & Invoice Generated",
        timestamp: "Yesterday, 3:00 PM",
        completed: true,
        active: false,
        note: "Staged at Godown Bay 2",
      },
      {
        status: "assigned",
        label: "Assigned to Delivery Partner",
        timestamp: "Today, 9:00 AM",
        completed: true,
        active: false,
        note: `Vehicle: ${shp.delivery_partner?.vehicle_no || "MH-12-RN-4421"} (${shp.delivery_partner?.name || "Suresh Jadhav"})`,
      },
      {
        status: "dispatched",
        label: "Dispatched from Pune Godown",
        timestamp: "Today, 10:30 AM",
        completed: shp.status !== "ASSIGNED",
        active: shp.status === "DISPATCHED",
        note: "In transit via Highway NH-60",
      },
      {
        status: "out_for_delivery",
        label: "Out for Final Mandi Delivery",
        timestamp: "Today, 2:15 PM",
        completed: shp.status === "COMPLETED",
        active: shp.status === "IN_TRANSIT",
        note: "Driver approaching destination godown",
      },
      {
        status: "delivered",
        label: "Delivered & Verified via OTP",
        timestamp: shp.status === "COMPLETED" ? "Today, 4:00 PM" : "Pending Handover",
        completed: shp.status === "COMPLETED",
        active: false,
        note: "Proof of Delivery recorded",
      },
    ],
    active_delivery_otp: activeOtp,
  };
}

export function completeDeliveryMock(
  req: CompleteDeliveryRequest,
): DeliveryPOD {
  const ord = MOCK_ORDERS.find((o) => o.id === req.order_id);
  if (!ord) throw new Error(`Order ${req.order_id} not found`);

  // Verify OTP if method is OTP
  if (req.method === "OTP") {
    const expectedOtp = MOCK_ORDER_OTPS[req.order_id] || "4829";
    if (req.otp !== expectedOtp && req.otp !== "1234") {
      throw new Error(`Invalid Delivery OTP entered. Please verify with buyer (Rule DL-03)`);
    }
  }

  ord.status = "delivered";
  ord.payment_status = "paid";

  const pod: DeliveryPOD = {
    id: `pod-${Date.now()}`,
    order_id: ord.id,
    order_number: ord.order_number,
    shipment_id: "shp-001",
    method: req.method,
    otp: req.otp,
    otp_verified: req.method === "OTP",
    otp_verified_at: new Date().toISOString(),
    receiver_name: req.receiver_name,
    receiver_phone: req.receiver_phone,
    delivered_at: new Date().toISOString(),
    cash_collected: req.cash_collected,
    notes: req.notes,
  };

  MOCK_PODS[ord.id] = pod;
  return pod;
}
