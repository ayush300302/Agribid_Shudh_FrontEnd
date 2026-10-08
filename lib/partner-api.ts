/**
 * Partner & KYC API Service
 * Agribid Shudh Admin Web Console
 * Connects to documented partner endpoints in internal/partner/handler.go
 */

import { apiRequest } from "@/lib/api-client";
import type {
  CreatePartnerRequest,
  KYCDocument,
  PaginatedResponse,
  PaginationMeta,
  Partner,
  ReviewKYCRequest,
  UpdatePartnerRequest,
} from "@/types/partner";

type ApiResponseWrapper<T> = T | { data: T };

/**
 * Defensively extracts payload data whether the backend returns
 * raw JSON or a { success: true, data: ... } envelope.
 */
function unwrapResponse<T>(payload: ApiResponseWrapper<T>): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: T }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export interface ListPartnersParams {
  type?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Lists partners with optional tier filtering and pagination.
 * GET /api/v1/partners?type=...&page=...&page_size=...
 */
export async function listPartners(
  params: ListPartnersParams = {},
): Promise<{ partners: Partner[]; meta: PaginationMeta }> {
  const query = new URLSearchParams();

  if (params.type && params.type !== "all") {
    query.set("type", params.type);
  }
  if (params.page) {
    query.set("page", String(params.page));
  }
  if (params.pageSize) {
    query.set("page_size", String(params.pageSize));
  }

  const queryString = query.toString();
  const path = `/api/v1/partners${queryString ? `?${queryString}` : ""}`;

  const response = await apiRequest<PaginatedResponse<Partner>>(path);

  return {
    partners: response.data || [],
    meta: response.meta || {
      page: params.page || 1,
      page_size: params.pageSize || 20,
      total: response.data ? response.data.length : 0,
    },
  };
}

/**
 * Fetches a single partner by their UUID.
 * GET /api/v1/partners/{id}
 */
export async function getPartnerById(id: string): Promise<Partner> {
  const response = await apiRequest<ApiResponseWrapper<Partner>>(
    `/api/v1/partners/${id}`,
  );
  return unwrapResponse(response);
}

/**
 * Creates a new partner in the network.
 * POST /api/v1/partners
 */
export async function createPartner(
  data: CreatePartnerRequest,
): Promise<Partner> {
  const response = await apiRequest<ApiResponseWrapper<Partner>>(
    "/api/v1/partners",
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

/**
 * Updates basic partner details.
 * PUT /api/v1/partners/{id}
 */
export async function updatePartner(
  id: string,
  data: UpdatePartnerRequest,
): Promise<Partner> {
  const response = await apiRequest<ApiResponseWrapper<Partner>>(
    `/api/v1/partners/${id}`,
    {
      method: "PUT",
      body: data,
    },
  );
  return unwrapResponse(response);
}

/**
 * Fetches all uploaded KYC compliance documents for a partner.
 * GET /api/v1/partners/{id}/kyc
 */
export async function getPartnerKyc(
  partnerId: string,
): Promise<KYCDocument[]> {
  const response = await apiRequest<ApiResponseWrapper<KYCDocument[]>>(
    `/api/v1/partners/${partnerId}/kyc`,
  );
  return unwrapResponse(response);
}

/**
 * Reviews a partner's KYC (Approve or Reject with review notes).
 * PATCH /api/v1/partners/{id}/kyc
 */
export async function reviewPartnerKyc(
  partnerId: string,
  data: ReviewKYCRequest,
): Promise<{ message: string }> {
  const response = await apiRequest<ApiResponseWrapper<{ message: string }>>(
    `/api/v1/partners/${partnerId}/kyc`,
    {
      method: "PATCH",
      body: data,
    },
  );
  return unwrapResponse(response);
}

/**
 * Fetches direct downline child partners (e.g. State Stockist -> Distributors).
 * GET /api/v1/partners/{id}/children
 */
export async function getPartnerChildren(
  partnerId: string,
): Promise<Partner[]> {
  const response = await apiRequest<ApiResponseWrapper<Partner[]>>(
    `/api/v1/partners/${partnerId}/children`,
  );
  return unwrapResponse(response);
}