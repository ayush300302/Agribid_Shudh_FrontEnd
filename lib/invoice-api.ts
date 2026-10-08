/**
 * Module 08: Invoicing & GST Compliance API Service
 * Connects to /api/v1/invoices and Dev Spec M08 endpoints
 */

import { apiRequest } from "@/lib/api-client";
import type {
  CreateCreditNoteRequest,
  CreditNote,
  GenerateEwayBillRequest,
  Invoice,
} from "@/types/invoice";

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

export async function listInvoices(params?: {
  status?: string;
  irn_status?: string;
  search?: string;
}): Promise<Invoice[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params?.irn_status && params.irn_status !== "all") {
    query.set("irn_status", params.irn_status);
  }
  if (params?.search) {
    query.set("search", params.search);
  }

  const endpoint = `/api/v1/invoices${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await apiRequest<ApiResponseWrapper<Invoice[]>>(endpoint);
  return unwrapResponse(response);
}

export async function getInvoiceById(id: string): Promise<Invoice> {
  const response = await apiRequest<ApiResponseWrapper<Invoice>>(
    `/api/v1/invoices/${id}`,
  );
  return unwrapResponse(response);
}

export async function generateOrderInvoice(orderId: string): Promise<Invoice> {
  const response = await apiRequest<ApiResponseWrapper<Invoice>>(
    `/api/v1/orders/${orderId}/invoice`,
    {
      method: "POST",
    },
  );
  return unwrapResponse(response);
}

export async function cancelInvoice(
  id: string,
  reason: string,
): Promise<Invoice> {
  const response = await apiRequest<ApiResponseWrapper<Invoice>>(
    `/api/v1/invoices/${id}/cancel`,
    {
      method: "POST",
      body: { reason },
    },
  );
  return unwrapResponse(response);
}

export async function generateEwayBill(
  id: string,
  data: GenerateEwayBillRequest,
): Promise<Invoice> {
  const response = await apiRequest<ApiResponseWrapper<Invoice>>(
    `/api/v1/invoices/${id}/eway-bill`,
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function shareInvoice(
  id: string,
  channel: "whatsapp" | "email" | "sms",
  recipient: string,
): Promise<{ success: boolean; message: string }> {
  const response = await apiRequest<
    ApiResponseWrapper<{ success: boolean; message: string }>
  >(`/api/v1/invoices/${id}/share`, {
    method: "POST",
    body: { channel, recipient },
  });
  return unwrapResponse(response);
}

export async function listCreditNotes(invoiceId?: string): Promise<CreditNote[]> {
  const query = new URLSearchParams();
  if (invoiceId) query.set("invoice_id", invoiceId);

  const endpoint = `/api/v1/invoices/credit-notes${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await apiRequest<ApiResponseWrapper<CreditNote[]>>(endpoint);
  return unwrapResponse(response);
}

export async function createCreditNote(
  data: CreateCreditNoteRequest,
): Promise<CreditNote> {
  const response = await apiRequest<ApiResponseWrapper<CreditNote>>(
    "/api/v1/invoices/credit-notes",
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

