/**
 * Module 15: Admin Console & Operations API Client
 */

import {
  decideChangeRequestMock,
  evictSessionMock,
  getActiveSessionsMock,
  getChangeRequestsMock,
  getFeatureFlagsMock,
  getSystemHealthMock,
  toggleFeatureFlagMock,
  toggleMaintenanceModeMock,
} from "@/lib/mock-admin-console";
import type {
  ActiveAdminSession,
  ChangeRequest,
  ChangeRequestEntityType,
  ChangeRequestStatus,
  DecideChangeRequestPayload,
  FeatureFlagConfig,
  SystemHealthStatus,
} from "@/types/admin-console";

async function unwrapResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Operation failed");
  }
  return data.data ?? data;
}

export async function listChangeRequests(filters?: {
  status?: ChangeRequestStatus | "ALL";
  entity_type?: ChangeRequestEntityType | "ALL";
  search?: string;
}): Promise<ChangeRequest[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== "ALL") params.set("status", filters.status);
    if (filters?.entity_type && filters.entity_type !== "ALL") params.set("entity_type", filters.entity_type);
    if (filters?.search) params.set("search", filters.search);

    const res = await fetch(`/api/v1/admin/change-requests?${params.toString()}`);
    return await unwrapResponse<ChangeRequest[]>(res);
  } catch {
    return getChangeRequestsMock(filters);
  }
}

export async function decideChangeRequest(
  id: string,
  payload: DecideChangeRequestPayload,
  checkerUser?: { id: string; name: string; role: string },
): Promise<ChangeRequest> {
  try {
    const res = await fetch(`/api/v1/admin/change-requests/${id}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await unwrapResponse<ChangeRequest>(res);
  } catch {
    return decideChangeRequestMock(
      id,
      payload,
      checkerUser || { id: "usr-admin-01", name: "Ayush Patil", role: "ADM_SUPER" },
    );
  }
}

export async function getSystemHealth(): Promise<SystemHealthStatus> {
  try {
    const res = await fetch("/api/v1/admin/system/health");
    return await unwrapResponse<SystemHealthStatus>(res);
  } catch {
    return getSystemHealthMock();
  }
}

export async function toggleMaintenanceMode(enabled: boolean): Promise<boolean> {
  try {
    const res = await fetch("/api/v1/admin/system/toggle-maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    const data = await unwrapResponse<{ enabled: boolean }>(res);
    return data.enabled;
  } catch {
    return toggleMaintenanceModeMock(enabled);
  }
}

export async function listFeatureFlags(): Promise<FeatureFlagConfig[]> {
  try {
    const res = await fetch("/api/v1/admin/system/feature-flags");
    return await unwrapResponse<FeatureFlagConfig[]>(res);
  } catch {
    return getFeatureFlagsMock();
  }
}

export async function toggleFeatureFlag(key: string, enabled: boolean): Promise<FeatureFlagConfig> {
  try {
    const res = await fetch("/api/v1/admin/system/feature-flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, enabled }),
    });
    return await unwrapResponse<FeatureFlagConfig>(res);
  } catch {
    return toggleFeatureFlagMock(key, enabled);
  }
}

export async function listActiveSessions(): Promise<ActiveAdminSession[]> {
  try {
    const res = await fetch("/api/v1/admin/system/sessions");
    return await unwrapResponse<ActiveAdminSession[]>(res);
  } catch {
    return getActiveSessionsMock();
  }
}

export async function evictAdminSession(sessionId: string): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`/api/v1/admin/system/sessions/${sessionId}/evict`, {
      method: "POST",
    });
    return await unwrapResponse<{ success: boolean }>(res);
  } catch {
    return evictSessionMock(sessionId);
  }
}
