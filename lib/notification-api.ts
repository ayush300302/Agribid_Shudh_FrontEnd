/**
 * Module 13: Notification API Client
 * Wraps endpoints for notifications, delivery logs, templates, and preferences
 */

import {
  getNotificationMetricsMock,
  getNotificationsMock,
  getPreferencesMock,
  getTemplatesMock,
  getUnreadCountMock,
  markNotificationsAsReadMock,
  retryFailedNotificationMock,
  saveTemplateMock,
  sendTestNotificationMock,
  updatePreferencesMock,
} from "@/lib/mock-notifications";
import type {
  NotificationChannel,
  NotificationMetrics,
  NotificationPreferences,
  NotificationRecord,
  NotificationStatus,
  NotificationTemplate,
  SendTestNotificationRequest,
} from "@/types/notification";

async function unwrapResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Notification request failed");
  }
  return data.data ?? data;
}

export async function listNotifications(filters?: {
  channel?: NotificationChannel | "ALL";
  category?: string;
  status?: NotificationStatus | "ALL";
  search?: string;
}): Promise<NotificationRecord[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.channel && filters.channel !== "ALL") params.set("channel", filters.channel);
    if (filters?.category && filters.category !== "ALL") params.set("category", filters.category);
    if (filters?.status && filters.status !== "ALL") params.set("status", filters.status);
    if (filters?.search) params.set("search", filters.search);

    const res = await fetch(`/api/v1/notifications?${params.toString()}`);
    return await unwrapResponse<NotificationRecord[]>(res);
  } catch {
    return getNotificationsMock(filters);
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const res = await fetch("/api/v1/notifications/unread-count");
    const data = await unwrapResponse<{ count: number }>(res);
    return data.count;
  } catch {
    return getUnreadCountMock();
  }
}

export async function markNotificationsAsRead(ids?: string[]): Promise<{ count: number }> {
  try {
    const res = await fetch("/api/v1/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    return await unwrapResponse<{ count: number }>(res);
  } catch {
    return markNotificationsAsReadMock(ids);
  }
}

export async function retryNotification(id: string): Promise<NotificationRecord> {
  try {
    const res = await fetch("/api/v1/notifications/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return await unwrapResponse<NotificationRecord>(res);
  } catch {
    return retryFailedNotificationMock(id);
  }
}

export async function listNotificationTemplates(): Promise<NotificationTemplate[]> {
  try {
    const res = await fetch("/api/v1/notifications/templates");
    return await unwrapResponse<NotificationTemplate[]>(res);
  } catch {
    return getTemplatesMock();
  }
}

export async function saveNotificationTemplate(
  template: NotificationTemplate,
): Promise<NotificationTemplate> {
  try {
    const res = await fetch("/api/v1/notifications/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
    });
    return await unwrapResponse<NotificationTemplate>(res);
  } catch {
    return saveTemplateMock(template);
  }
}

export async function sendTestNotification(
  req: SendTestNotificationRequest,
): Promise<NotificationRecord> {
  try {
    const res = await fetch("/api/v1/notifications/templates/test-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    return await unwrapResponse<NotificationRecord>(res);
  } catch {
    return sendTestNotificationMock(req);
  }
}

export async function getNotificationMetrics(): Promise<NotificationMetrics> {
  try {
    const res = await fetch("/api/v1/notifications/metrics");
    return await unwrapResponse<NotificationMetrics>(res);
  } catch {
    return getNotificationMetricsMock();
  }
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const res = await fetch("/api/v1/notifications/prefs");
    return await unwrapResponse<NotificationPreferences>(res);
  } catch {
    return getPreferencesMock();
  }
}

export async function updateNotificationPreferences(
  prefs: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  try {
    const res = await fetch("/api/v1/notifications/prefs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    return await unwrapResponse<NotificationPreferences>(res);
  } catch {
    return updatePreferencesMock(prefs);
  }
}
