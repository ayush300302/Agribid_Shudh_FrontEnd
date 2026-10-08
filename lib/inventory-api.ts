/**
 * Module 10: Inventory Client API Service
 * Connects to /api/v1/inventory and Dev Spec M10 endpoints
 */

import { apiRequest } from "@/lib/api-client";
import type {
  AdjustStockRequest,
  InventoryItem,
  ReorderSuggestion,
  StockInRequest,
  StockMovement,
} from "@/types/inventory";

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

export async function listInventory(params?: {
  category?: string;
  lowOnly?: boolean;
  search?: string;
}): Promise<InventoryItem[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "all") {
    query.set("category", params.category);
  }
  if (params?.lowOnly) {
    query.set("lowOnly", "true");
  }
  if (params?.search) {
    query.set("search", params.search);
  }

  const endpoint = `/api/v1/inventory${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await apiRequest<ApiResponseWrapper<InventoryItem[]>>(endpoint);
  return unwrapResponse(response);
}

export async function stockInItem(data: StockInRequest): Promise<InventoryItem> {
  const response = await apiRequest<ApiResponseWrapper<InventoryItem>>(
    "/api/v1/inventory/stock-in",
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function adjustStock(
  productIdOrSku: string,
  data: AdjustStockRequest,
): Promise<InventoryItem> {
  const response = await apiRequest<ApiResponseWrapper<InventoryItem>>(
    `/api/v1/inventory/${productIdOrSku}/adjust`,
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function listStockMovements(
  productIdOrSku?: string,
): Promise<StockMovement[]> {
  const endpoint = productIdOrSku
    ? `/api/v1/inventory/${productIdOrSku}/movements`
    : "/api/v1/inventory/movements";
  const response = await apiRequest<ApiResponseWrapper<StockMovement[]>>(endpoint);
  return unwrapResponse(response);
}

export async function getReorderSuggestions(): Promise<ReorderSuggestion[]> {
  const response = await apiRequest<ApiResponseWrapper<ReorderSuggestion[]>>(
    "/api/v1/inventory/reorder-suggestions",
  );
  return unwrapResponse(response);
}
