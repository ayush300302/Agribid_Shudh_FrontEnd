/**
 * Module 12: Returns & Claims Domain Types
 * Derived from Dev Spec M12, Rules RC-01..04, and PRD v1.0
 */

export type ClaimType =
  | "DAMAGE"
  | "SHORTAGE"
  | "WRONG_ITEM"
  | "QUALITY"
  | "EXPIRY";

export type ClaimStatus =
  | "OPEN"
  | "APPROVED"
  | "PARTIALLY_APPROVED"
  | "REJECTED"
  | "ESCALATED"
  | "CLOSED";

export type ClaimResolution =
  | "CREDIT_NOTE"
  | "REPLACEMENT";

export interface ClaimLineItem {
  id: string;
  order_line_id?: string;
  product_id: string;
  sku: string;
  product_name: string;
  uom: string;
  unit_price: number;
  delivered_qty: number;
  claimed_qty: number;
  approved_qty: number;
  total_line_claim: number;
  reason: string;
  photos: string[];
}

export interface Claim {
  id: string;
  claim_no: string; // e.g. "CLM-2609-00012"
  order_id: string;
  order_number: string;
  invoice_id?: string;
  invoice_number?: string;
  raised_by: string; // buyer partner id
  buyer_name: string;
  buyer_tier: string;
  seller_id: string;
  seller_name: string;
  type: ClaimType;
  status: ClaimStatus;
  resolution?: ClaimResolution;
  physical_return: boolean;
  total_claimed_amount: number;
  total_approved_amount: number;
  lines: ClaimLineItem[];
  credit_note_id?: string;
  credit_note_number?: string;
  replacement_order_id?: string;
  replacement_order_number?: string;
  delivered_at: string;
  sla_deadline: string; // delivered_at + 48h
  is_escalated: boolean;
  escalation_reason?: string;
  decided_by?: string;
  decided_at?: string;
  decision_note?: string;
  created_at: string;
  updated_at: string;
}

export interface RaiseClaimLineRequest {
  product_id: string;
  sku: string;
  product_name: string;
  uom: string;
  unit_price: number;
  delivered_qty: number;
  claimed_qty: number;
  reason: string;
  photos: string[];
}

export interface RaiseClaimRequest {
  order_id: string;
  type: ClaimType;
  physical_return?: boolean;
  lines: RaiseClaimLineRequest[];
}

export interface DecideClaimRequest {
  action: "APPROVE" | "PARTIAL_APPROVE" | "REJECT";
  resolution?: ClaimResolution;
  approved_lines?: { line_id: string; approved_qty: number }[];
  note: string;
}

export interface EscalateClaimRequest {
  reason: string;
}

export interface AdminResolveClaimRequest {
  action: "UPHOLD_APPROVAL" | "OVERRULE_REJECT" | "ISSUE_CREDIT_NOTE";
  resolution?: ClaimResolution;
  note: string;
}
