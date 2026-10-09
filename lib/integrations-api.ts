/**
 * Module 17: Integrations Hub API Client
 */

import {
  getIntegrationConnectorsMock,
  getIntegrationLogsMock,
  getTallyJobsMock,
  getWebhookSubscriptionsMock,
  resetCircuitBreakerMock,
  testAdapterProbeMock,
  triggerTallyExportMock,
} from "@/lib/mock-integrations";
import type {
  AdapterType,
  IntegrationConnector,
  IntegrationLogEntry,
  TallyJobType,
  TallySyncJob,
  WebhookSubscription,
} from "@/types/integrations";

async function unwrapResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Operation failed");
  }
  return data.data ?? data;
}

export async function listConnectors(): Promise<IntegrationConnector[]> {
  try {
    const res = await fetch("/api/v1/admin/integrations/connectors");
    return await unwrapResponse<IntegrationConnector[]>(res);
  } catch {
    return getIntegrationConnectorsMock();
  }
}

export async function listIntegrationLogs(filters?: {
  adapter?: string;
  status?: string;
  search?: string;
}): Promise<IntegrationLogEntry[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.adapter && filters.adapter !== "ALL") params.set("adapter", filters.adapter);
    if (filters?.status && filters.status !== "ALL") params.set("status", filters.status);
    if (filters?.search) params.set("search", filters.search);

    const res = await fetch(`/api/v1/admin/integrations/logs?${params.toString()}`);
    return await unwrapResponse<IntegrationLogEntry[]>(res);
  } catch {
    return getIntegrationLogsMock(filters);
  }
}

export async function testAdapterProbe(adapter: AdapterType): Promise<{
  success: boolean;
  latency_ms: number;
  message: string;
}> {
  try {
    const res = await fetch("/api/v1/admin/integrations/probe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adapter }),
    });
    return await unwrapResponse(res);
  } catch {
    return testAdapterProbeMock(adapter);
  }
}

export async function resetCircuitBreaker(adapter: AdapterType): Promise<IntegrationConnector> {
  try {
    const res = await fetch("/api/v1/admin/integrations/circuit-breaker/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adapter }),
    });
    return await unwrapResponse<IntegrationConnector>(res);
  } catch {
    return resetCircuitBreakerMock(adapter);
  }
}

export async function listTallyJobs(): Promise<TallySyncJob[]> {
  try {
    const res = await fetch("/api/v1/admin/integrations/tally/jobs");
    return await unwrapResponse<TallySyncJob[]>(res);
  } catch {
    return getTallyJobsMock();
  }
}

export async function triggerTallyExport(
  job_type: TallyJobType,
  export_format: "XML" | "JSON",
): Promise<TallySyncJob> {
  try {
    const res = await fetch("/api/v1/admin/integrations/tally/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_type, export_format }),
    });
    return await unwrapResponse<TallySyncJob>(res);
  } catch {
    return triggerTallyExportMock(job_type, export_format);
  }
}

export async function listWebhooks(): Promise<WebhookSubscription[]> {
  try {
    const res = await fetch("/api/v1/admin/integrations/webhooks");
    return await unwrapResponse<WebhookSubscription[]>(res);
  } catch {
    return getWebhookSubscriptionsMock();
  }
}
