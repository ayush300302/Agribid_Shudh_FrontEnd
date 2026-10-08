/**
 * Pricing & Schemes Domain Types for Agribid Shudh
 * Matches backend Go / NestJS models in Dev Spec M05 and API_Documentation.md Section 12
 */

import type { PartnerType } from "@/types/partner";

export type PriceListStatus =
  | "draft"
  | "pending_approval"
  | "published"
  | "archived";

export interface PriceList {
  id: string;
  state_code: string; // e.g. "27" (Maharashtra), "24" (Gujarat)
  state_name: string;
  tier: PartnerType | "state_stockist" | "distributor" | "sub_distributor" | "retailer";
  version: number;
  effective_from: string;
  effective_to?: string;
  status: PriceListStatus;
  approved_by?: string;
  created_by?: string;
  items_count: number;
  created_at: string;
  updated_at: string;
}

export interface PriceListItem {
  id: string;
  price_list_id: string;
  sku_id: string;
  sku_code: string;
  product_name: string;
  category_name: string;
  uom: string;
  mrp: number;
  buy_price: number; // ex-GST price this buyer tier pays to parent
  suggested_sell_price: number; // recommended selling price to downline
  max_discount_pct: number; // BR-05: allowed discount band for this seller tier
  gst_rate: number; // GST percentage (e.g., 5 for 5%)
}

export type SchemeType = "percentage" | "flat" | "slab_pct" | "buy_x_get_y";

export type SchemeStatus =
  | "draft"
  | "pending_approval"
  | "active"
  | "paused"
  | "ended";

export interface SchemeSlab {
  min_qty: number;
  discount_pct: number;
}

export interface SchemeTarget {
  target_type: "role" | "partner" | "category" | "product";
  target_id: string;
  target_name?: string;
}

export interface Scheme {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: SchemeType;
  discount_value?: number; // percentage value (e.g. 5%) or flat rupees (e.g. ₹50)
  buy_qty?: number;
  get_qty?: number;
  slabs?: SchemeSlab[];
  valid_from: string;
  valid_to: string;
  is_exclusive: boolean;
  budget_amount?: number;
  budget_used?: number;
  target_type?: "role" | "partner" | "category" | "product" | "all";
  target_id?: string;
  targets?: SchemeTarget[];
  target_tiers?: string[];
  status: SchemeStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AppliedScheme {
  id: string;
  name: string;
  type: SchemeType;
  discount_amount: number;
  free_qty?: number;
}

export interface PriceQuoteRequest {
  sku_id: string;
  buyer_tier: string;
  buyer_id?: string;
  quantity: number;
  seller_state_code: string;
  buyer_state_code: string;
}

export interface PriceQuoteResult {
  sku_id: string;
  sku_code: string;
  product_name: string;
  quantity: number;
  uom: string;
  base_price: number;
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  is_interstate: boolean;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  igst_rate: number;
  igst_amount: number;
  total_tax: number;
  line_total: number;
  applied_schemes: AppliedScheme[];
}

export interface CreatePriceListRequest {
  state_code: string;
  tier: string;
  effective_from: string;
  copy_from_version?: number;
}

export interface UpdatePriceListItemsRequest {
  items: Array<{
    sku_id: string;
    buy_price: number;
    suggested_sell_price: number;
    max_discount_pct: number;
  }>;
}

export interface CreateSchemeRequest {
  name: string;
  type: SchemeType;
  discount_value?: number;
  buy_qty?: number;
  get_qty?: number;
  slabs?: SchemeSlab[];
  valid_from: string;
  valid_to: string;
  is_exclusive?: boolean;
  budget_amount?: number;
  targets?: SchemeTarget[];
  target_tiers?: string[];
}

export interface ReviewPriceListRequest {
  decision: "approve" | "reject";
  review_note?: string;
}
