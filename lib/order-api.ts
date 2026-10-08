import { apiRequest } from "@/lib/api-client";
import type {
  AddCartItemRequest,
  Cart,
  Order,
  OrderStatus,
  PlaceOnBehalfOrderRequest,
  PlaceOrderRequest,
  UpdateCartItemRequest,
  UpdateOrderStatusRequest,
} from "@/types/order";

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

export async function listOrders(params?: {
  status?: string;
  payment_status?: string;
  source?: string;
  search?: string;
}): Promise<Order[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params?.payment_status && params.payment_status !== "all") {
    query.set("payment_status", params.payment_status);
  }
  if (params?.source && params.source !== "all") {
    query.set("source", params.source);
  }
  if (params?.search) {
    query.set("search", params.search);
  }

  const endpoint = `/api/v1/orders${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await apiRequest<ApiResponseWrapper<Order[]>>(endpoint);
  return unwrapResponse(response);
}

export async function getOrderById(id: string): Promise<Order> {
  const response = await apiRequest<ApiResponseWrapper<Order>>(
    `/api/v1/orders/${id}`,
  );
  return unwrapResponse(response);
}

export async function placeOrder(data: PlaceOrderRequest): Promise<Order> {
  const response = await apiRequest<ApiResponseWrapper<Order>>(
    "/api/v1/orders",
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function placeOnBehalfOrder(
  data: PlaceOnBehalfOrderRequest,
): Promise<Order> {
  const response = await apiRequest<ApiResponseWrapper<Order>>(
    "/api/v1/orders/on-behalf",
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  reason?: string,
): Promise<Order> {
  const response = await apiRequest<ApiResponseWrapper<Order>>(
    `/api/v1/orders/${id}/status`,
    {
      method: "PATCH",
      body: { status, reason },
    },
  );
  return unwrapResponse(response);
}

export async function cancelOrder(
  id: string,
  reason?: string,
): Promise<Order> {
  const response = await apiRequest<ApiResponseWrapper<Order>>(
    `/api/v1/orders/${id}/cancel`,
    {
      method: "POST",
      body: { reason },
    },
  );
  return unwrapResponse(response);
}

export async function getCart(): Promise<Cart> {
  const response = await apiRequest<ApiResponseWrapper<Cart>>("/api/v1/cart");
  return unwrapResponse(response);
}

export async function addCartItem(data: AddCartItemRequest): Promise<Cart> {
  const response = await apiRequest<ApiResponseWrapper<Cart>>("/api/v1/cart", {
    method: "POST",
    body: data,
  });
  return unwrapResponse(response);
}

export async function updateCartItem(
  id: string,
  data: UpdateCartItemRequest,
): Promise<Cart> {
  const response = await apiRequest<ApiResponseWrapper<Cart>>(
    `/api/v1/cart/${id}`,
    {
      method: "PUT",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function removeCartItem(id: string): Promise<Cart> {
  const response = await apiRequest<ApiResponseWrapper<Cart>>(
    `/api/v1/cart/${id}`,
    {
      method: "DELETE",
    },
  );
  return unwrapResponse(response);
}

export async function clearCart(): Promise<Cart> {
  const response = await apiRequest<ApiResponseWrapper<Cart>>("/api/v1/cart", {
    method: "DELETE",
  });
  return unwrapResponse(response);
}
