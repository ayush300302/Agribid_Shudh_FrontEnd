/**
 * Module 11: Payment & Credit Client API Service
 * Connects to /api/v1/payments and /api/v1/credit endpoints
 */

import { apiRequest } from "@/lib/api-client";
import type {
  AgingBucket,
  CashReconciliationItem,
  CreditAccount,
  CreditOverrideRequest,
  LedgerEntry,
  Payment,
  RecordPaymentRequest,
  ReversePaymentRequest,
  UpdateChequeStatusRequest,
  UpdateCreditTermsRequest,
} from "@/types/payment";

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

export async function listPayments(params?: {
  status?: string;
  mode?: string;
  payerId?: string;
  search?: string;
}): Promise<Payment[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "ALL") query.set("status", params.status);
  if (params?.mode && params.mode !== "ALL") query.set("mode", params.mode);
  if (params?.payerId) query.set("payerId", params.payerId);
  if (params?.search) query.set("search", params.search);

  const endpoint = `/api/v1/payments${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await apiRequest<ApiResponseWrapper<Payment[]>>(endpoint);
  return unwrapResponse(response);
}

export async function recordPayment(data: RecordPaymentRequest): Promise<Payment> {
  const response = await apiRequest<ApiResponseWrapper<Payment>>("/api/v1/payments", {
    method: "POST",
    body: data,
  });
  return unwrapResponse(response);
}

export async function updateChequeStatus(
  id: string,
  data: UpdateChequeStatusRequest,
): Promise<Payment> {
  const response = await apiRequest<ApiResponseWrapper<Payment>>(
    `/api/v1/payments/${id}/cheque-status`,
    {
      method: "PATCH",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function reversePayment(
  id: string,
  data: ReversePaymentRequest,
): Promise<Payment> {
  const response = await apiRequest<ApiResponseWrapper<Payment>>(
    `/api/v1/payments/${id}/reverse`,
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function getCashReconciliation(): Promise<CashReconciliationItem[]> {
  const response = await apiRequest<ApiResponseWrapper<CashReconciliationItem[]>>(
    "/api/v1/payments/cash-reconciliation",
  );
  return unwrapResponse(response);
}

export async function listCreditAccounts(): Promise<CreditAccount[]> {
  const response = await apiRequest<ApiResponseWrapper<CreditAccount[]>>(
    "/api/v1/credit/accounts",
  );
  return unwrapResponse(response);
}

export async function getCreditAccount(
  idOrPartnerId: string,
): Promise<CreditAccount> {
  const response = await apiRequest<ApiResponseWrapper<CreditAccount>>(
    `/api/v1/credit/accounts/${idOrPartnerId}`,
  );
  return unwrapResponse(response);
}

export async function updateCreditTerms(
  id: string,
  data: UpdateCreditTermsRequest,
): Promise<CreditAccount> {
  const response = await apiRequest<ApiResponseWrapper<CreditAccount>>(
    `/api/v1/credit/accounts/${id}`,
    {
      method: "PATCH",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function overrideCredit(
  id: string,
  data: CreditOverrideRequest,
): Promise<CreditAccount> {
  const response = await apiRequest<ApiResponseWrapper<CreditAccount>>(
    `/api/v1/credit/accounts/${id}/override`,
    {
      method: "POST",
      body: data,
    },
  );
  return unwrapResponse(response);
}

export async function listLedger(params?: {
  partnerId?: string;
  counterpartyId?: string;
  from?: string;
  to?: string;
}): Promise<LedgerEntry[]> {
  const query = new URLSearchParams();
  if (params?.partnerId) query.set("partnerId", params.partnerId);
  if (params?.counterpartyId) query.set("counterpartyId", params.counterpartyId);
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);

  const endpoint = `/api/v1/payments/ledger${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await apiRequest<ApiResponseWrapper<LedgerEntry[]>>(endpoint);
  return unwrapResponse(response);
}

export async function getAgingReport(): Promise<AgingBucket[]> {
  const response = await apiRequest<ApiResponseWrapper<AgingBucket[]>>(
    "/api/v1/payments/aging",
  );
  return unwrapResponse(response);
}
