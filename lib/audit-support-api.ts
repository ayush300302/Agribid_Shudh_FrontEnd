/**
 * Module 16: Audit, Configuration & Support API Client
 */

import {
  getAuditLogsMock,
  getConfigParamsMock,
  getSupportTicketByIdMock,
  getSupportTicketsMock,
  replyToTicketMock,
  updateConfigParamMock,
  updateTicketStatusMock,
} from "@/lib/mock-audit-support";
import type {
  AuditEntityType,
  AuditLogEntry,
  SupportTicket,
  SystemConfigParam,
  TicketCategory,
  TicketPriority,
  TicketReplyPayload,
  TicketStatus,
  UpdateTicketStatusPayload,
} from "@/types/audit-support";

async function unwrapResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Operation failed");
  }
  return data.data ?? data;
}

export async function listAuditLogs(filters?: {
  entity?: AuditEntityType | "ALL";
  actor?: string;
  action?: string;
  search?: string;
}): Promise<AuditLogEntry[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.entity && filters.entity !== "ALL") params.set("entity", filters.entity);
    if (filters?.actor) params.set("actor", filters.actor);
    if (filters?.action) params.set("action", filters.action);
    if (filters?.search) params.set("search", filters.search);

    const res = await fetch(`/api/v1/admin/audit-logs?${params.toString()}`);
    return await unwrapResponse<AuditLogEntry[]>(res);
  } catch {
    return getAuditLogsMock(filters);
  }
}

export async function listConfigParams(category?: string): Promise<SystemConfigParam[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== "ALL") params.set("category", category);

    const res = await fetch(`/api/v1/admin/config?${params.toString()}`);
    return await unwrapResponse<SystemConfigParam[]>(res);
  } catch {
    return getConfigParamsMock(category);
  }
}

export async function updateConfigParam(
  key: string,
  value: any,
  changedBy: string,
  reason: string,
): Promise<SystemConfigParam> {
  try {
    const res = await fetch("/api/v1/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value, changedBy, reason }),
    });
    return await unwrapResponse<SystemConfigParam>(res);
  } catch {
    return updateConfigParamMock(key, value, changedBy, reason);
  }
}

export async function listSupportTickets(filters?: {
  status?: TicketStatus | "ALL";
  category?: TicketCategory | "ALL";
  priority?: TicketPriority | "ALL";
  search?: string;
}): Promise<SupportTicket[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== "ALL") params.set("status", filters.status);
    if (filters?.category && filters.category !== "ALL") params.set("category", filters.category);
    if (filters?.priority && filters.priority !== "ALL") params.set("priority", filters.priority);
    if (filters?.search) params.set("search", filters.search);

    const res = await fetch(`/api/v1/admin/tickets?${params.toString()}`);
    return await unwrapResponse<SupportTicket[]>(res);
  } catch {
    return getSupportTicketsMock(filters);
  }
}

export async function getSupportTicket(id: string): Promise<SupportTicket | null> {
  try {
    const res = await fetch(`/api/v1/admin/tickets/${id}`);
    return await unwrapResponse<SupportTicket>(res);
  } catch {
    return getSupportTicketByIdMock(id);
  }
}

export async function replyToSupportTicket(
  id: string,
  payload: TicketReplyPayload,
): Promise<SupportTicket> {
  try {
    const res = await fetch(`/api/v1/admin/tickets/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await unwrapResponse<SupportTicket>(res);
  } catch {
    return replyToTicketMock(id, payload.message, payload.sender_name);
  }
}

export async function updateSupportTicketStatus(
  id: string,
  payload: UpdateTicketStatusPayload,
): Promise<SupportTicket> {
  try {
    const res = await fetch(`/api/v1/admin/tickets/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await unwrapResponse<SupportTicket>(res);
  } catch {
    return updateTicketStatusMock(id, payload.status, payload.resolution_notes, payload.assignee);
  }
}
