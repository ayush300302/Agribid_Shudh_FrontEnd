/**
 * Module 16: Audit, Configuration & Support Types
 * Matches Dev Spec M16 and Section 10.7 ADM-13..18 of Agribid Shudh PRD
 */

export type AuditActorType = "ADMIN" | "SYSTEM" | "PARTNER";

export type AuditEntityType =
  | "ORDER"
  | "PARTNER"
  | "CONFIG"
  | "INVOICE"
  | "LEDGER"
  | "PRODUCT"
  | "DISPATCH"
  | "CLAIM"
  | "ROLE_PERMISSION";

export interface AuditLogEntry {
  id: string;
  actor_user_id: string;
  actor_name: string;
  actor_role: string;
  actor_type: AuditActorType;
  action: string;
  entity_type: AuditEntityType;
  entity_id: string;
  before: Record<string, any> | null;
  after: Record<string, any> | null;
  reason: string;
  ip: string;
  user_agent: string;
  geo: string;
  trace_id: string;
  created_at: string;
}

export type ConfigScope = "GLOBAL" | "STATE" | "TIER" | "PARTNER";

export type ConfigCategory =
  | "ORDER"
  | "CREDIT"
  | "PRICING"
  | "TAX_COMPLIANCE"
  | "NOTIFICATIONS"
  | "KYC"
  | "APP";

export interface SystemConfigParam {
  key: string;
  label: string;
  description: string;
  category: ConfigCategory;
  scope: ConfigScope;
  scope_value?: string | null;
  value: any;
  value_type: "number" | "string" | "boolean" | "json";
  unit?: string;
  effective_from: string;
  changed_by: string;
  requires_maker_checker: boolean;
  updated_at: string;
}

export type TicketCategory =
  | "LOGIN"
  | "ORDER"
  | "PAYMENT"
  | "DELIVERY"
  | "APP_BUG"
  | "OTHER";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface TicketMessage {
  id: string;
  sender_type: "PARTNER" | "ADMIN";
  sender_name: string;
  message: string;
  created_at: string;
  attachments?: string[];
}

export interface SupportTicket {
  id: string;
  ticket_no: string;
  partner_id: string;
  partner_name: string;
  partner_tier: "SS" | "DS" | "SD" | "RT";
  user_id: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  ref_type?: "ORDER" | "PAYMENT" | "INVOICE" | "CLAIM";
  ref_id?: string;
  status: TicketStatus;
  assignee?: string;
  sla_due_at: string;
  sla_breached: boolean;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  messages: TicketMessage[];
}

export interface TicketReplyPayload {
  message: string;
  sender_name: string;
}

export interface UpdateTicketStatusPayload {
  status: TicketStatus;
  resolution_notes?: string;
  assignee?: string;
}

