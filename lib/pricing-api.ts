import { apiRequest } from "@/lib/api-client";
import type {
  CreatePriceListRequest,
  CreateSchemeRequest,
  PriceList,
  PriceListItem,
  PriceQuoteRequest,
  PriceQuoteResult,
  ReviewPriceListRequest,
  Scheme,
  SchemeStatus,
  UpdatePriceListItemsRequest,
} from "@/types/pricing";

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

export async function listPriceLists(params?: {
  state_code?: string;
  tier?: string;
  status?: string;
}): Promise<PriceList[]> {
  const query = new URLSearchParams();
  if (params?.state_code && params.state_code !== "all") {
    query.set("state_code", params.state_code);
  }
  if (params?.tier && params.tier !== "all") {
    query.set("tier", params.tier);
  }
  if (params?.status && params.status !== "all") {
    query.set("status", params.status);
  }

  const endpoint = `/api/v1/admin/price-lists${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await apiRequest<ApiResponseWrapper<PriceList[]>>(endpoint);
  return unwrapResponse(response);
}

export async function getPriceListById(id: string): Promise<{
  price_list: PriceList;
  items: PriceListItem[];
}> {
  const response = await apiRequest<
    ApiResponseWrapper<{ price_list: PriceList; items: PriceListItem[] }>
  >(`/api/v1/admin/price-lists/${id}`);
  return unwrapResponse(response);
}

export async function createPriceList(
  data: CreatePriceListRequest,
): Promise<PriceList> {
  const response = await apiRequest<ApiResponseWrapper<PriceList>>(
    "/api/v1/admin/price-lists",
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function updatePriceListItems(
  id: string,
  data: UpdatePriceListItemsRequest,
): Promise<{ success: boolean; message: string }> {
  const response = await apiRequest<ApiResponseWrapper<{ success: boolean; message: string }>>(
    `/api/v1/admin/price-lists/${id}/items`,
    {
      method: "PUT",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function reviewPriceList(
  id: string,
  data: ReviewPriceListRequest,
): Promise<PriceList> {
  const response = await apiRequest<ApiResponseWrapper<PriceList>>(
    `/api/v1/admin/price-lists/${id}/review`,
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function listSchemes(params?: {
  status?: string;
  type?: string;
}): Promise<Scheme[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params?.type && params.type !== "all") {
    query.set("type", params.type);
  }

  const endpoint = `/api/v1/schemes${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await apiRequest<ApiResponseWrapper<Scheme[]>>(endpoint);
  return unwrapResponse(response);
}

export async function getSchemeById(id: string): Promise<Scheme> {
  const response = await apiRequest<ApiResponseWrapper<Scheme>>(
    `/api/v1/schemes/${id}`,
  );
  return unwrapResponse(response);
}

export async function createScheme(
  data: CreateSchemeRequest,
): Promise<Scheme> {
  const response = await apiRequest<ApiResponseWrapper<Scheme>>(
    "/api/v1/schemes",
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function setSchemeStatus(
  id: string,
  status: SchemeStatus,
): Promise<Scheme> {
  const response = await apiRequest<ApiResponseWrapper<Scheme>>(
    `/api/v1/schemes/${id}/status`,
    {
      method: "PATCH",
      body: { status },
    },
  );
  return unwrapResponse(response);
}

export async function calculatePriceQuote(
  request: PriceQuoteRequest,
): Promise<PriceQuoteResult> {
  const response = await apiRequest<ApiResponseWrapper<PriceQuoteResult>>(
    `/api/v1/schemes/products/${request.sku_id}/calculate-price`,
    {
      method: "POST",
      body: request,
    },
  );
  return unwrapResponse(response);
}

