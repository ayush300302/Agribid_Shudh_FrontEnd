/**
 * Module 10: Inventory Domain Types
 * Based on Dev Spec M10 and Inventory Rules IV-01..06
 */

export type StockMovementType =
  | "OPENING"
  | "GRN"
  | "MANUAL_IN"
  | "SALE_RESERVE"
  | "SALE_RELEASE"
  | "SALE_DISPATCH"
  | "RETURN_IN"
  | "RETURN_OUT"
  | "ADJUST_DAMAGE"
  | "ADJUST_EXPIRY"
  | "ADJUST_AUDIT";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface InventoryItem {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_tier: string;
  product_id: string;
  sku: string;
  product_name: string;
  category_name: string;
  uom: string;
  on_hand: number; // physical stock in warehouse
  reserved: number; // locked for confirmed orders
  available: number; // on_hand - reserved
  min_level: number; // reorder trigger threshold
  location_label: string; // e.g. "Godown 1 · Bay 04 · Shelf B"
  purchase_price: number; // weighted average cost ex-GST
  selling_price: number;
  stock_status: StockStatus;
  is_low_stock: boolean;
  version: number;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  partner_id: string;
  partner_name: string;
  product_id: string;
  sku: string;
  product_name: string;
  type: StockMovementType;
  qty: number; // signed: +ve for inbound, -ve for outbound
  on_hand_after: number;
  reserved_after: number;
  ref_type: "ORDER" | "SHIPMENT" | "CLAIM" | "ADJUSTMENT" | "GRN" | "MANUAL";
  ref_id?: string;
  reason: string;
  performed_by: string;
  created_at: string;
}

export interface ReorderSuggestion {
  product_id: string;
  sku: string;
  product_name: string;
  uom: string;
  available: number;
  min_level: number;
  suggested_reorder_qty: number;
  unit_price: number;
  estimated_cost: number;
  vendor_name: string;
}

export interface StockInRequest {
  partner_id?: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  location_label?: string;
  min_level?: number;
  notes?: string;
}

export interface AdjustStockRequest {
  type: "ADJUST_DAMAGE" | "ADJUST_EXPIRY" | "ADJUST_AUDIT" | "MANUAL_IN";
  quantity_change: number; // signed: e.g. -5 or +10
  reason: string;
}

export interface UpdateInventorySettingsRequest {
  min_level?: number;
  location_label?: string;
  selling_price?: number;
}
