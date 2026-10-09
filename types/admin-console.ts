/**
 * Module 15: Admin Console & Maker-Checker Governance Types
 * Matches Dev Spec M15 and Section 10.6 ADM-01..12 of Agribid Shudh PRD
 */

export type ChangeRequestEntityType =
  | "PRICE_LIST"
  | "TRADE_SCHEME"
  | "CREDIT_LIMIT"
  | "PARTNER_ONBOARDING"
  | "GST_RATE_OVERRIDE"
  | "SYSTEM_SETTING";

export type ChangeRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ChangeRequest {
  id: string;
  request_number: string;
  entity_type: ChangeRequestEntityType;
  entity_id: string;
  entity_title: string;
  description: string;
  maker_id: string;
  maker_name: string;
  maker_role: string;
  checker_id?: string;
  checker_name?: string;
  checker_role?: string;
  status: ChangeRequestStatus;
  payload_before: Record<string, any>;
  payload_after: Record<string, any>;
  comments?: string;
  created_at: string;
  decided_at?: string;
}

export interface DecideChangeRequestPayload {
  action: "APPROVE" | "REJECT";
  comments: string;
}

export interface SystemHealthStatus {
  api_status: "HEALTHY" | "DEGRADED" | "OUTAGE";
  uptime_seconds: number;
  db_replica_lag_ms: number;
  redis_queue_depth: number;
  active_bullmq_workers: number;
  active_admin_sessions: number;
  maintenance_mode: boolean;
  min_supported_mobile_version: string;
  updated_at: string;
}

export interface FeatureFlagConfig {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  category: "COMMERCE" | "COMPLIANCE" | "SECURITY" | "PERFORMANCE";
}

export interface ActiveAdminSession {
  id: string;
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  ip_address: string;
  device_info: string;
  login_at: string;
  last_activity_at: string;
  idle_timeout_mins: number;
}

