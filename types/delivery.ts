/**
 * Module 09: Dispatch & Delivery Domain Types
 * Based on Dev Spec M09 and Delivery Rules DL-01..05
 */

export type VehicleType =
  | "BIKE"
  | "CARGO_BIKE"
  | "MINI_TRUCK"
  | "PICKUP"
  | "TRUCK"
  | "THIRD_PARTY";

export type DeliveryPartnerStatus = "AVAILABLE" | "ON_DELIVERY" | "OFF";

export type ShipmentStatus =
  | "ASSIGNED"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "COMPLETED"
  | "CANCELLED";

export type PODMethod = "OTP" | "PHOTO_SIGN";

export interface DeliveryPartner {
  id: string;
  seller_id: string;
  name: string;
  mobile: string;
  vehicle_type: VehicleType;
  vehicle_no: string; // e.g. MH-12-RN-4421
  capacity_kg: number;
  current_load_kg: number;
  status: DeliveryPartnerStatus;
  rating: number;
  trips_count: number;
  driver_license_no?: string;
  created_at: string;
}

export interface ShipmentOrderSummary {
  order_id: string;
  order_number: string;
  buyer_name: string;
  destination_city: string;
  weight_kg: number;
  packages_count: number;
  grand_total: number;
  is_pod: boolean;
  status: string;
}

export interface Shipment {
  id: string;
  shipment_number: string; // e.g. SHP-MH-2609-0081
  order_ids: string[];
  orders: ShipmentOrderSummary[];
  delivery_partner_id?: string;
  delivery_partner?: DeliveryPartner;
  transporter_name?: string;
  lr_no?: string;
  load_kg: number;
  vehicle_capacity_kg: number;
  capacity_utilization_pct: number;
  pickup_location: string;
  destination_summary: string;
  eta: string;
  status: ShipmentStatus;
  tracking_token: string; // 32-char token for public/driver web view
  dispatched_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface DeliveryPOD {
  id: string;
  order_id: string;
  order_number: string;
  shipment_id: string;
  method: PODMethod;
  otp?: string;
  otp_verified: boolean;
  otp_verified_at?: string;
  receiver_name: string;
  receiver_phone: string;
  photo_url?: string;
  signature_url?: string;
  delivered_at: string;
  cash_collected?: number;
  notes?: string;
}

export interface CreateShipmentRequest {
  order_ids: string[];
  delivery_partner_id?: string;
  transporter_name?: string;
  vehicle_number?: string;
  notes?: string;
}

export interface StartDeliveryRequest {
  order_id: string;
}

export interface CompleteDeliveryRequest {
  order_id: string;
  method: PODMethod;
  otp?: string;
  receiver_name: string;
  receiver_phone: string;
  signature_name?: string;
  cash_collected?: number;
  notes?: string;
}

export interface DeliveryTrackingInfo {
  token: string;
  shipment: Shipment;
  timeline: Array<{
    status: string;
    label: string;
    timestamp: string;
    completed: boolean;
    active: boolean;
    note?: string;
  }>;
  active_delivery_otp?: string; // Revealed for testing/demo or buyer SMS
}
