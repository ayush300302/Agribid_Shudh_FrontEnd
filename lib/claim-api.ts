/**
 * Module 12: Returns & Claims Client API Service
 * Connects to /api/v1/claims and Dev Spec M12 endpoints
 */

import { apiRequest } from "@/lib/api-client";
import type {
  AdminResolveClaimRequest,
  Claim,
  DecideClaimRequest,
  EscalateClaimRequest,
  RaiseClaimRequest,
} from "@/types/claim";

interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

function unwrapResponse<T>(payload: ApiResponseWrapper<T> | T): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    payload.data !== undefined
  ) {
    return payload.data as T;
  }
  return payload as T;
}

export async function listClaims(params?: {
  status?: string;
  type?: string;
  isEscalated?: boolean;
  search?: string;
}): Promise<Claim[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "ALL") query.set("status", params.status);
  if (params?.type && params.type !== "ALL") query.set("type", params.type);
  if (params?.isEscalated !== undefined) query.set("isEscalated", String(params.isEscalated));
  if (params?.search) query.set("search", params.search);

  const endpoint = `/api/v1/claims${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await apiRequest<ApiResponseWrapper<Claim[]>>(endpoint);
  return unwrapResponse(response);
}

export async function getClaim(id: string): Promise<Claim> {
  const response = await apiRequest<ApiResponseWrapper<Claim>>(`/api/v1/claims/${id}`);
  return unwrapResponse(response);
}

export async function raiseClaim(
  orderId: string,
  data: RaiseClaimRequest,
): Promise<Claim> {
  const response = await apiRequest<ApiResponseWrapper<Claim>>(
    `/api/v1/orders/${orderId}/claims`,
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function decideClaim(
  id: string,
  data: DecideClaimRequest,
): Promise<Claim> {
  const response = await apiRequest<ApiResponseWrapper<Claim>>(
    `/api/v1/claims/${id}/decide`,
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function escalateClaim(
  id: string,
  data: EscalateClaimRequest,
): Promise<Claim> {
  const response = await apiRequest<ApiResponseWrapper<Claim>>(
    `/api/v1/claims/${id}/escalate`,
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function adminResolveClaim(
  id: string,
  data: AdminResolveClaimRequest,
): Promise<Claim> {
  const response = await apiRequest<ApiResponseWrapper<Claim>>(
    `/api/v1/admin/claims/${id}/resolve`,
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}
