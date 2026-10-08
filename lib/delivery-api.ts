/**
 * Module 09: Dispatch & Delivery API Service
 * Connects to /api/v1/delivery and Dev Spec M09 endpoints
 */

import { apiRequest } from "@/lib/api-client";
import type {
  CompleteDeliveryRequest,
  CreateShipmentRequest,
  DeliveryPartner,
  DeliveryPOD,
  DeliveryTrackingInfo,
  Shipment,
} from "@/types/delivery";

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

export async function listDeliveryPartners(): Promise<DeliveryPartner[]> {
  const response = await apiRequest<ApiResponseWrapper<DeliveryPartner[]>>(
    "/api/v1/delivery/partners",
  );
  return unwrapResponse(response);
}

export async function listShipments(): Promise<Shipment[]> {
  const response = await apiRequest<ApiResponseWrapper<Shipment[]>>(
    "/api/v1/delivery/shipments",
  );
  return unwrapResponse(response);
}

export async function createShipment(
  data: CreateShipmentRequest,
): Promise<Shipment> {
  const response = await apiRequest<ApiResponseWrapper<Shipment>>(
    "/api/v1/delivery/shipments",
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function dispatchShipment(id: string): Promise<Shipment> {
  const response = await apiRequest<ApiResponseWrapper<Shipment>>(
    `/api/v1/delivery/shipments/${id}/dispatch`,
    {
      method: "POST",
    },
  );
  return unwrapResponse(response);
}

export async function getTrackingInfo(
  token: string,
): Promise<DeliveryTrackingInfo> {
  const response = await apiRequest<ApiResponseWrapper<DeliveryTrackingInfo>>(
    `/api/v1/delivery/track/${token}`,
  );
  return unwrapResponse(response);
}

export async function completeDelivery(
  data: CompleteDeliveryRequest,
): Promise<DeliveryPOD> {
  const response = await apiRequest<ApiResponseWrapper<DeliveryPOD>>(
    `/api/v1/delivery/orders/${data.order_id}/complete`,
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}
