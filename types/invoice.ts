/**
 * Module 08: Invoicing & GST Compliance Domain Types
 * Based on Dev Spec M08 and Indian GST E-Invoice / E-Way Bill Standards
 */

export type InvoiceStatus = "issued" | "cancelled" | "paid";

export type IRNStatus = "na" | "pending" | "generated" | "failed" | "cancelled";

export type CreditNoteReason =
  | "RETURN"
  | "SHORTAGE"
  | "DAMAGE"
  | "PRICE_DIFF"
  | "SCHEME";

export interface InvoiceAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  state_code: string; // e.g. "27" for Maharashtra
}

export interface InvoiceLine {
  id: string;
  product_id: string;
  sku: string;
  product_name: string;
  hsn_code: string;
  quantity: number;
  uom: string;
  unit_price: number; // ex-GST wholesale rate
  discount_amount: number;
  taxable_amount: number;
  tax_rate: number; // 5% or 18%
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string; // e.g. INV-MH-2627-00101
  order_id: string;
  order_number: string;
  seller_id: string;
  seller_name: string;
  seller_trade_name?: string;
  seller_gstin: string;
  seller_pan: string;
  seller_state_code: string;
  seller_address: InvoiceAddress;
  buyer_id: string;
  buyer_name: string;
  buyer_trade_name?: string;
  buyer_gstin?: string;
  buyer_pan?: string;
  buyer_state_code: string;
  buyer_address: InvoiceAddress;
  place_of_supply: string; // e.g. "27 - Maharashtra"
  is_interstate: boolean;
  reverse_charge: boolean;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  discount_total: number;
  taxable_amount: number;
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  round_off: number;
  grand_total: number;
  amount_in_words: string;
  // e-Invoice IRN details
  irn?: string;
  ack_no?: string;
  ack_date?: string;
  signed_qr_code?: string;
  irn_status: IRNStatus;
  // e-Way Bill details
  eway_bill_number?: string;
  eway_valid_upto?: string;
  vehicle_number?: string;
  transporter_name?: string;
  status: InvoiceStatus;
  notes?: string;
  created_at: string;
  lines: InvoiceLine[];
}

export interface CreditNote {
  id: string;
  credit_note_number: string; // e.g. CN-MH-2627-00041
  invoice_id: string;
  invoice_number: string;
  order_number: string;
  buyer_id: string;
  buyer_name: string;
  reason: CreditNoteReason;
  amount: number;
  tax_adjusted: number;
  total_adjusted: number;
  note?: string;
  status: "issued" | "adjusted";
  created_at: string;
}

export interface GenerateInvoiceRequest {
  order_id: string;
  due_date?: string;
  notes?: string;
}

export interface GenerateEwayBillRequest {
  vehicle_number: string;
  transporter_name: string;
  transporter_id?: string;
}

export interface CreateCreditNoteRequest {
  invoice_id: string;
  reason: CreditNoteReason;
  amount: number;
  note?: string;
}

export interface ShareInvoiceRequest {
  channel: "whatsapp" | "email" | "sms";
  recipient: string;
}

