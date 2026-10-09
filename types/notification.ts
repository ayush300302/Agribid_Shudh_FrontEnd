/**
 * Module 13: Notifications & Alert Engine Types
 * Matches Dev Spec M13 and Section 12 of Agribid Shudh PRD
 */

export type NotificationChannel = "IN_APP" | "SMS" | "WHATSAPP" | "PUSH";

export type NotificationStatus =
  | "QUEUED"
  | "SENT"
  | "DELIVERED"
  | "FAILED"
  | "READ";

export type NotificationCategory =
  | "ORDERS"
  | "PAYMENTS"
  | "DELIVERY"
  | "CLAIMS"
  | "STOCK"
  | "OFFERS"
  | "SYSTEM";

export type NotificationLanguage = "en" | "hi" | "mr";

export interface NotificationTemplate {
  code: string;
  name: string;
  channel: NotificationChannel;
  language: NotificationLanguage;
  category: NotificationCategory;
  title: string;
  body: string;
  dlt_template_id?: string;
  wa_template_name?: string;
  transactional: boolean;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface NotificationRecord {
  id: string;
  recipient_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_role: string;
  template_code: string;
  channel: NotificationChannel;
  category: NotificationCategory;
  title: string;
  body: string;
  payload?: {
    screen?: string;
    id?: string;
    actionUrl?: string;
    [key: string]: any;
  };
  status: NotificationStatus;
  transactional: boolean;
  retry_count: number;
  max_retries: number;
  dlt_template_id?: string;
  provider_message_id?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  failed_reason?: string;
  created_at: string;
}

export interface NotificationCategoryPref {
  category: NotificationCategory;
  push_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  in_app_enabled: boolean;
}

export interface NotificationPreferences {
  user_id: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string; // e.g. "21:00"
  quiet_hours_end: string;   // e.g. "08:00"
  categories: NotificationCategoryPref[];
}

export interface SendTestNotificationRequest {
  template_code: string;
  channel: NotificationChannel;
  recipient_phone: string;
  recipient_name?: string;
  language: NotificationLanguage;
  variables: Record<string, string>;
}

export interface NotificationMetrics {
  total_dispatched: number;
  delivered_percentage: number;
  failed_count: number;
  unread_inbox_count: number;
  channel_distribution: {
    in_app: number;
    sms: number;
    whatsapp: number;
    push: number;
  };
  is_quiet_hours_active: boolean;
}
