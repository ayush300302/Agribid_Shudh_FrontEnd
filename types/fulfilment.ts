/**
 * Module 07: Order Fulfilment (Sell Side) Domain Types
 * Based on Dev Spec M07 and API_Documentation.md Section 5
 */

import type { Order, OrderStatus } from "@/types/order";

export type FulfilmentStatus =
  | "new"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "on_hold";

export type FulfilmentReasonCode =
  | "OUT_OF_STOCK"
  | "CREDIT_ISSUE"
  | "OUTSIDE_AREA"
  | "RATE_DISCREPANCY"
  | "LOGISTICS_UNAVAILABLE"
  | "PARTIAL_STOCK_AVAILABLE"
  | "CUSTOMER_REQUEST"
  | "ADMIN_INTERVENTION"
  | "OTHER";

export interface ReasonCodeOption {
  code: FulfilmentReasonCode;
  label: string;
  description: string;
}

export const REASON_CODES: ReasonCodeOption[] = [
  {
    code: "OUT_OF_STOCK",
    label: "Out of Stock / Godown Depleted",
    description: "Commodity stock exhausted at local warehouse.",
  },
  {
    code: "PARTIAL_STOCK_AVAILABLE",
    label: "Partial Stock Available",
    description: "Available quantity less than order request; balance cancelled.",
  },
  {
    code: "CREDIT_ISSUE",
    label: "Credit Limit Exceeded / Overdue Dues",
    description: "Buyer partner has unpaid invoices beyond credit grace window.",
  },
  {
    code: "OUTSIDE_AREA",
    label: "Unserviceable Delivery Pincode",
    description: "Logistics provider cannot reach destination mandal/taluka.",
  },
  {
    code: "LOGISTICS_UNAVAILABLE",
    label: "Transporter / Freight Vehicle Unavailable",
    description: "No freight truck or tempo available for required route.",
  },
  {
    code: "RATE_DISCREPANCY",
    label: "Price or GST Rate Revision",
    description: "Mandi price changes require fresh quote submission.",
  },
  {
    code: "CUSTOMER_REQUEST",
    label: "Buyer Requested Cancellation",
    description: "Partner requested cancellation prior to packing.",
  },
  {
    code: "ADMIN_INTERVENTION",
    label: "Admin Policy Hold / Compliance Review",
    description: "Intervention by central compliance or credit committee.",
  },
  {
    code: "OTHER",
    label: "Other Operational Reason",
    description: "Miscellaneous operational or force majeure reasons.",
  },
];

export interface FulfillmentEvent {
  id: string;
  order_id: string;
  from_status: string;
  to_status: string;
  changed_by: string;
  reason?: string;
  changed_at: string;
}

export interface PartialLineInput {
  order_line_id: string;
  fulfilled_qty: number;
  reason_code?: FulfilmentReasonCode;
  note?: string;
}

export interface RecordPartialRequest {
  lines: PartialLineInput[];
}

export interface AcceptOrderRequest {
  lines?: Array<{
    line_id: string;
    qty_accepted: number;
    reason_code?: FulfilmentReasonCode;
  }>;
  reason?: string;
}

export interface RejectOrderRequest {
  reason_code: FulfilmentReasonCode;
  note?: string;
}

export interface PackOrderRequest {
  package_count?: number;
  weight_kg?: number;
  notes?: string;
}

export interface DispatchOrderRequest {
  transporter_name: string;
  vehicle_number: string;
  driver_contact?: string;
  eway_bill_number?: string;
  notes?: string;
}

export interface BulkAcceptRequest {
  order_ids: string[];
  reason?: string;
}

export interface OverrideStatusRequest {
  status: FulfilmentStatus;
  reason: string;
}

export interface PickListItem {
  product_id: string;
  sku: string;
  product_name: string;
  uom: string;
  hsn_code: string;
  total_quantity: number;
  order_ids: string[];
  orders_count: number;
  bin_location?: string;
}

export interface PickListSummary {
  generated_at: string;
  total_orders: number;
  total_sku_count: number;
  total_units: number;
  order_numbers: string[];
  items: PickListItem[];
}

export interface SLAInfo {
  is_breached: boolean;
  hours_remaining: number;
  sla_due_at: string;
}
