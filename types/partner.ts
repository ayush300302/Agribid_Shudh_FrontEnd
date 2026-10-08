/**
 * Partner and KYC Domain Types for Agribid Shudh
 * Matches backend Go models in internal/partner/ and API_Documentation.md
 */

export type PartnerType =
  | "manufacturer"
  | "state_stockist"
  | "distributor"
  | "sub_distributor"
  | "retailer"
  | "delivery_partner";

export type PartnerStatus =
  | "pending"
  | "active"
  | "inactive"
  | "suspended"
  | "blocked";

export type KYCStatus = "pending" | "submitted" | "approved" | "rejected";

export type KYCDocType =
  | "gst_certificate"
  | "pan_card"
  | "business_license"
  | "bank_details"
  | "address_proof";

export type KYCDocStatus = "pending" | "approved" | "rejected";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Partner {
  id: string;
  code: string;
  type: PartnerType;
  business_name: string;
  trade_name?: string;
  parent_id?: string;
  parent_name?: string; // Optional enriched field for UI breadcrumbs
  gstin?: string;
  pan?: string;
  state_code?: string;
  address?: Address;
  status: PartnerStatus;
  kyc_status: KYCStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface KYCDocument {
  id: string;
  partner_id: string;
  doc_type: KYCDocType;
  file_url: string;
  status: KYCDocStatus;
  reviewed_by?: string;
  review_note?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface Warehouse {
  id: string;
  partner_id: string;
  name: string;
  address?: Address;
  is_default: boolean;
  created_at: string;
}

export interface CreatePartnerRequest {
  type: PartnerType;
  business_name: string;
  trade_name?: string;
  parent_id?: string;
  gstin?: string;
  pan?: string;
  state_code?: string;
  address?: Address;
}

export interface UpdatePartnerRequest {
  business_name?: string;
  trade_name?: string;
  gstin?: string;
  pan?: string;
  state_code?: string;
  address?: Address;
}

export interface SubmitKYCRequest {
  doc_type: KYCDocType;
  file_url: string;
}

export interface ReviewKYCRequest {
  status: "approved" | "rejected";
  review_note?: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  request_id?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}