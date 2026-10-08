/**
 * Module 11: Payments, Credit & Ledger Domain Types
 * Derived from Dev Spec M11 and Section 11 of API Documentation
 */

export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "ONLINE_PG";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REVERSED";

export type ChequeStatus =
  | "RECEIVED"
  | "CLEARED"
  | "BOUNCED";

export type CreditAccountStatus =
  | "ACTIVE"
  | "HOLD"
  | "CLOSED";

export type LedgerEntryType =
  | "INVOICE"
  | "PAYMENT"
  | "CREDIT_NOTE"
  | "REFUND"
  | "ADJUSTMENT"
  | "OPENING";

export interface PaymentAllocation {
  invoice_id: string;
  invoice_number: string;
  amount: number;
}

export interface Payment {
  id: string;
  receipt_no: string; // e.g. "REC-2609-0042"
  payer_id: string;
  payer_name: string;
  payer_tier: string;
  payee_id: string;
  payee_name: string;
  amount: number;
  mode: PaymentMethod;
  reference_no?: string; // UPI UTR or Cheque No or Bank Ref
  cheque_status?: ChequeStatus;
  cheque_bank?: string;
  cheque_date?: string;
  collected_by_user_id?: string;
  collected_by_name?: string;
  pg_order_id?: string;
  pg_payment_id?: string;
  status: PaymentStatus;
  received_at: string;
  remarks?: string;
  allocations: PaymentAllocation[];
  reversal_reason?: string;
  reversed_by?: string;
  reversed_at?: string;
  created_at: string;
}

export interface CreditAccount {
  id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_tier: string;
  seller_id: string;
  seller_name: string;
  credit_limit: number;
  credit_days: number;
  grace_days: number;
  outstanding: number; // current debt balance
  available_credit: number; // credit_limit - outstanding - open_credit_orders
  overdue_amount: number;
  oldest_due_date?: string;
  days_past_due: number;
  status: CreditAccountStatus;
  tier_cap: number;
  override_until?: string;
  override_by?: string;
  override_reason?: string;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  credit_account_id?: string;
  partner_id: string;
  partner_name: string;
  counterparty_id: string;
  counterparty_name: string;
  entry_type: LedgerEntryType;
  debit: number; // Dr increases buyer debt
  credit: number; // Cr decreases buyer debt
  balance_after: number; // running outstanding balance
  ref_type: "INVOICE" | "PAYMENT" | "CREDIT_NOTE" | "ADJUSTMENT" | "OPENING";
  ref_id?: string;
  narration: string;
  created_at: string;
}

export interface AgingBucket {
  bucket: "0-30" | "31-60" | "61-90" | "90+";
  amount: number;
  count: number;
}

export interface CashReconciliationItem {
  collector_id: string;
  collector_name: string;
  collected_amount: number;
  handed_over_amount: number;
  variance: number;
  transaction_count: number;
  status: "BALANCED" | "SURPLUS" | "SHORTAGE";
}

export interface RecordPaymentRequest {
  payer_id: string;
  payee_id?: string;
  amount: number;
  mode: PaymentMethod;
  reference_no?: string;
  cheque_bank?: string;
  cheque_date?: string;
  collected_by_name?: string;
  invoice_ids?: string[]; // if empty, auto FIFO allocated per Rule PY-02
  remarks?: string;
}

export interface UpdateChequeStatusRequest {
  cheque_status: ChequeStatus;
  notes?: string;
}

export interface ReversePaymentRequest {
  reason: string;
  reversed_by?: string;
}

export interface UpdateCreditTermsRequest {
  credit_limit?: number;
  credit_days?: number;
  grace_days?: number;
}

export interface CreditOverrideRequest {
  override_until: string; // ISO date
  temporary_limit?: number;
  reason: string;
}
