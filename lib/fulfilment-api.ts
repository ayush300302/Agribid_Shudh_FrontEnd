/**
 * Module 07: Order Fulfilment (Sell Side) API Client Service
 * Connects to routes defined in internal/fulfillment/handler.go & Dev Spec M07
 */

import { apiRequest } from "@/lib/api-client";
import type { Order, OrderStatus } from "@/types/order";
import type {
  AcceptOrderRequest,
  BulkAcceptRequest,
  DispatchOrderRequest,
  FulfilmentStatus,
  PackOrderRequest,
  PartialLineInput,
  PickListSummary,
  RejectOrderRequest,
} from "@/types/fulfilment";

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

/**
 * Update order fulfilment status
 * PATCH /api/v1/fulfillment/orders/{id}/status (API Doc Section 5)
 */
export async function updateFulfillmentStatus(
  orderId: string,
  status: OrderStatus,
  reason?: string,
): Promise<Order> {
  const response = await apiRequest<ApiResponseWrapper<Order>>(
    `/api/v1/fulfillment/orders/${orderId}/status`,
    {
      method: "PATCH",
      body: { status, reason },
    },
  );
  return unwrapResponse(response);
}

/**
 * Record partial fulfillment quantities per order line
 * POST /api/v1/fulfillment/orders/{id}/partial (API Doc Section 5)
 */
export async function recordPartialFulfillment(
  orderId: string,
  lines: PartialLineInput[],
): Promise<Order> {
  const response = await apiRequest<ApiResponseWrapper<Order>>(
    `/api/v1/fulfillment/orders/${orderId}/partial`,
    {
      method: "POST",
      body: { lines },
    },
  );
  return unwrapResponse(response);
}

/**
 * Accept order (full or with partial line quantities)
 * POST /api/v1/fulfillment/orders/{id}/accept
 */
export async function acceptOrder(
  orderId: string,
  data?: AcceptOrderRequest,
): Promise<Order> {
  const response = await apiRequest<ApiResponseWrapper<Order>>(
    `/api/v1/fulfillment/orders/${orderId}/accept`,
    {
      method: "POST",
      body: data || {},
    },
  );
  return unwrapResponse(response);
}

/**
 * Reject order with mandatory reason code
 * POST /api/v1/fulfillment/orders/{id}/reject
 */
export async function rejectOrder(
  orderId: string,
  data: RejectOrderRequest,
): Promise<Order> {
  const response = await apiRequest<ApiResponseWrapper<Order>>(
    `/api/v1/fulfillment/orders/${orderId}/reject`,
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

/**
 * Pack order and trigger invoice readiness
 * POST /api/v1/fulfillment/orders/{id}/pack
 */
export async function packOrder(
  orderId: string,
  data?: PackOrderRequest,
): Promise<Order> {
  const response = await apiRequest<ApiResponseWrapper<Order>>(
    `/api/v1/fulfillment/orders/${orderId}/pack`,
    {
      method: "POST",
      body: data || {},
    },
  );
  return unwrapResponse(response);
}

/**
 * Dispatch order with transporter and tracking details
 * POST /api/v1/fulfillment/orders/{id}/dispatch
 */
export async function dispatchOrder(
  orderId: string,
  data: DispatchOrderRequest,
): Promise<Order> {
  const response = await apiRequest<ApiResponseWrapper<Order>>(
    `/api/v1/fulfillment/orders/${orderId}/dispatch`,
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

/**
 * Bulk accept multiple orders
 * POST /api/v1/fulfillment/orders/bulk-accept
 */
export async function bulkAcceptOrders(
  orderIds: string[],
  reason?: string,
): Promise<Order[]> {
  const response = await apiRequest<ApiResponseWrapper<Order[]>>(
    "/api/v1/fulfillment/orders/bulk-accept",
    {
      method: "POST",
      body: { order_ids: orderIds, reason } as BulkAcceptRequest,
    },
  );
  return unwrapResponse(response);
}

/**
 * Generate Godown Pick List aggregating SKUs across selected orders
 * GET /api/v1/fulfillment/pick-list?ids=id1,id2
 */
export async function getPickList(orderIds: string[]): Promise<PickListSummary> {
  const query = new URLSearchParams({ ids: orderIds.join(",") });
  const response = await apiRequest<ApiResponseWrapper<PickListSummary>>(
    `/api/v1/fulfillment/pick-list?${query.toString()}`,
  );
  return unwrapResponse(response);
}

/**
 * Super Admin emergency status override
 * POST /api/v1/fulfillment/orders/{id}/override
 */
export async function adminOverrideStatus(
  orderId: string,
  status: FulfilmentStatus,
  reason: string,
): Promise<Order> {
  const response = await apiRequest<ApiResponseWrapper<Order>>(
    `/api/v1/fulfillment/orders/${orderId}/override`,
    {
      method: "POST",
      body: { status, reason },
    },
  );
  return unwrapResponse(response);
}
