/**
 * Cart & Ordering (Buy-Side) Domain Types for Agribid Shudh
 * Matches Dev Spec M06 and API_Documentation.md Section 9
 */

export type OrderStatus =
  | "new"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "on_hold";

export type PaymentMode = "credit" | "pod" | "online";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";

export type OrderSource = "self" | "assisted" | "admin";

export interface OrderDeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderLine {
  id: string;
  order_id: string;
  product_id: string;
  sku: string;
  product_name: string;
  uom: string;
  hsn_code: string;
  ordered_qty: number;
  fulfilled_qty: number;
  unit_price: number; // ex-GST wholesale price
  discount_amount: number;
  taxable_amount: number;
  tax_rate: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  line_total: number;
}

export interface OrderStatusHistoryItem {
  id: string;
  from_status: string;
  to_status: string;
  changed_by: string;
  reason?: string;
  changed_at: string;
}

export interface Order {
  id: string;
  order_number: string; // e.g. ORD-2609-000101
  buyer_id: string;
  buyer_name: string;
  buyer_tier: string;
  buyer_code: string;
  seller_id: string;
  seller_name: string;
  seller_tier: string;
  source: OrderSource; // self, assisted ("On Behalf"), admin
  status: OrderStatus;
  hold_reason?: string;
  payment_mode: PaymentMode;
  payment_status: PaymentStatus;
  subtotal: number;
  discount_total: number;
  taxable_amount: number;
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  grand_total: number;
  delivery_address: OrderDeliveryAddress;
  notes?: string;
  placed_at: string;
  expected_delivery_date?: string;
  delivered_at?: string;
  sla_due_at?: string;
  lines: OrderLine[];
  history?: OrderStatusHistoryItem[];
}

export interface CartItem {
  id: string;
  cart_id?: string;
  product_id: string;
  sku: string;
  product_name: string;
  uom: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  line_total: number;
}

export interface Cart {
  id: string;
  buyer_id: string;
  seller_id: string;
  seller_name?: string;
  items: CartItem[];
  subtotal: number;
  discount_total: number;
  taxable_total: number;
  tax_total: number;
  grand_total: number;
  updated_at: string;
}

export interface PlaceOrderRequest {
  seller_id: string;
  lines: Array<{
    product_id: string;
    quantity: number;
  }>;
  payment_mode: PaymentMode;
  delivery_address: OrderDeliveryAddress;
  notes?: string;
}

export interface PlaceOnBehalfOrderRequest {
  buyer_id: string; // Child partner being assisted
  lines: Array<{
    product_id: string;
    quantity: number;
  }>;
  payment_mode: PaymentMode;
  delivery_address?: OrderDeliveryAddress;
  credit_override_reason?: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  reason?: string;
}

export interface AddCartItemRequest {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
