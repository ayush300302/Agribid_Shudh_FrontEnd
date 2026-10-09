/**
 * Module 15: Admin Console & Maker-Checker Mock Store & Operations Engine
 * Matches Dev Spec M15 and Section 10.6 ADM-01..12 of Agribid Shudh PRD
 */

import type {
  ActiveAdminSession,
  ChangeRequest,
  ChangeRequestEntityType,
  ChangeRequestStatus,
  DecideChangeRequestPayload,
  FeatureFlagConfig,
  SystemHealthStatus,
} from "@/types/admin-console";

// 1. Initial Change Requests (Maker-Checker Governance Queue)
export const INITIAL_CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: "cr-001",
    request_number: "CR-2609-0001",
    entity_type: "PRICE_LIST",
    entity_id: "pl-mh-01",
    entity_title: "Maharashtra Wholesale Basmati Rice Price Revision",
    description: "Proposed rate revision from ₹3,950/bag down to ₹3,800/bag for State Stockist tier to match mandi competitor rates.",
    maker_id: "usr-sales-01",
    maker_name: "Vikram Joshi",
    maker_role: "ADM_SALES_OPS",
    status: "PENDING",
    payload_before: {
      sku: "RICE-BAS-PRM-50KG",
      rate: 3950,
      tier: "State Stockist",
      state: "Maharashtra",
    },
    payload_after: {
      sku: "RICE-BAS-PRM-50KG",
      rate: 3800,
      tier: "State Stockist",
      state: "Maharashtra",
      rebate_margin_pct: 3.8,
    },
    created_at: "2026-03-10T09:30:00Z",
  },
  {
    id: "cr-002",
    request_number: "CR-2609-0002",
    entity_type: "CREDIT_LIMIT",
    entity_id: "p-001",
    entity_title: "Credit Ceiling Expansion for MahaAgro State Stockist",
    description: "Credit limit upgrade requested from ₹25,00,000 to ₹35,00,000 based on consecutive 90-day on-time repayment history.",
    maker_id: "usr-fin-02",
    maker_name: "Rohit Deshmukh",
    maker_role: "ADM_FINANCE",
    status: "PENDING",
    payload_before: {
      partner_id: "p-001",
      partner_name: "MahaAgro State Stockist Pvt Ltd",
      credit_limit: 2500000,
      credit_terms_days: 15,
    },
    payload_after: {
      partner_id: "p-001",
      partner_name: "MahaAgro State Stockist Pvt Ltd",
      credit_limit: 3500000,
      credit_terms_days: 21,
    },
    created_at: "2026-03-10T11:15:00Z",
  },
  {
    id: "cr-003",
    request_number: "CR-2609-0003",
    entity_type: "TRADE_SCHEME",
    entity_id: "sch-early-monsoon",
    entity_title: "Kharif Early Booking Scheme (5% Cash Rebate)",
    description: "New trade promotion scheme offering 5% scheme credit on purchase orders exceeding 100 bags of Wheat or Rice.",
    maker_id: "usr-sales-01",
    maker_name: "Vikram Joshi",
    maker_role: "ADM_SALES_OPS",
    checker_id: "usr-admin-01",
    checker_name: "Ayush Patil",
    checker_role: "ADM_SUPER",
    status: "APPROVED",
    payload_before: {
      scheme_status: "DRAFT",
    },
    payload_after: {
      scheme_status: "ACTIVE",
      valid_from: "2026-03-15",
      valid_upto: "2026-04-30",
      cashback_pct: 5.0,
    },
    comments: "Reviewed financials and confirmed margin absorption with CFO.",
    created_at: "2026-03-09T14:00:00Z",
    decided_at: "2026-03-09T16:45:00Z",
  },
  {
    id: "cr-004",
    request_number: "CR-2609-0004",
    entity_type: "PARTNER_ONBOARDING",
    entity_id: "p-009",
    entity_title: "Vidarbha Agri Trade Mandi License Verification",
    description: "Approve newly uploaded APMC Mandi License and bank mandate for Nagpur Sub-Distributor onboarding.",
    maker_id: "usr-sup-03",
    maker_name: "Pooja Kulkarni",
    maker_role: "ADM_SUPPORT",
    checker_id: "usr-admin-01",
    checker_name: "Ayush Patil",
    checker_role: "ADM_SUPER",
    status: "REJECTED",
    payload_before: {
      kyc_status: "PENDING_REVIEW",
    },
    payload_after: {
      kyc_status: "REJECTED",
    },
    comments: "Electricity bill address does not match APMC license shop number. Re-request proof.",
    created_at: "2026-03-08T10:00:00Z",
    decided_at: "2026-03-08T13:20:00Z",
  },
];

// 2. Feature Flags Configuration
export const INITIAL_FEATURE_FLAGS: FeatureFlagConfig[] = [
  {
    key: "ENABLE_ASSISTED_ORDERING",
    name: "Assisted Ordering Desk (Order On Behalf)",
    description: "Allows Stockist and Sales Ops admins to place orders on behalf of downline distributors and retailers.",
    enabled: true,
    category: "COMMERCE",
  },
  {
    key: "ENABLE_AUTO_CREDIT_HOLD",
    name: "Automated Rule PY-06 Credit Lock",
    description: "Instantly locks partner ordering desk if overdues exceed 15 days or credit ceiling is breached.",
    enabled: true,
    category: "COMPLIANCE",
  },
  {
    key: "ENABLE_INSTANT_EWAY_BILL",
    name: "Automated NIC E-Way Bill Auto-Generation",
    description: "Trigger real-time NIC API dispatch for E-Way Bills immediately when orders are marked packed (>₹50k).",
    enabled: true,
    category: "COMPLIANCE",
  },
  {
    key: "ENABLE_QUIET_HOURS_ENFORCEMENT",
    name: "TRAI 21:00-08:00 IST Quiet Hours Queue",
    description: "Hold non-transactional promotional SMS & WhatsApp messages in BullMQ queue until 08:00 AM.",
    enabled: true,
    category: "SECURITY",
  },
  {
    key: "ENABLE_PUBLIC_LIVE_TRACKING",
    name: "Public Delivery Token Tracking Page",
    description: "Allows unauthenticated driver / receiver OTP handover at /track/:token.",
    enabled: true,
    category: "COMMERCE",
  },
];

// 3. Active Sessions Store
export const INITIAL_SESSIONS: ActiveAdminSession[] = [
  {
    id: "sess-01",
    user_id: "usr-admin-01",
    user_name: "Ayush Patil",
    email: "ayushpatil2016@gmail.com",
    role: "ADM_SUPER",
    ip_address: "103.241.144.18 (Pune, MH)",
    device_info: "Windows 11 · Chrome 124.0",
    login_at: "2026-03-10T08:00:00Z",
    last_activity_at: "2026-03-10T12:45:00Z",
    idle_timeout_mins: 30,
  },
  {
    id: "sess-02",
    user_id: "usr-sales-01",
    user_name: "Vikram Joshi",
    email: "vikram.j@agribid.in",
    role: "ADM_SALES_OPS",
    ip_address: "49.36.120.45 (Mumbai, MH)",
    device_info: "macOS 14.2 · Safari 17.1",
    login_at: "2026-03-10T09:15:00Z",
    last_activity_at: "2026-03-10T12:30:00Z",
    idle_timeout_mins: 30,
  },
  {
    id: "sess-03",
    user_id: "usr-fin-02",
    user_name: "Rohit Deshmukh",
    email: "rohit.d@agribid.in",
    role: "ADM_FINANCE",
    ip_address: "157.34.89.21 (Nagpur, MH)",
    device_info: "Windows 10 · Firefox 123.0",
    login_at: "2026-03-10T10:00:00Z",
    last_activity_at: "2026-03-10T12:10:00Z",
    idle_timeout_mins: 30,
  },
];

// In-Memory Mutables
let changeRequests = [...INITIAL_CHANGE_REQUESTS];
let featureFlags = [...INITIAL_FEATURE_FLAGS];
let activeSessions = [...INITIAL_SESSIONS];
let maintenanceMode = false;

// Service Handlers
export function getChangeRequestsMock(filters?: {
  status?: ChangeRequestStatus | "ALL";
  entity_type?: ChangeRequestEntityType | "ALL";
  search?: string;
}): ChangeRequest[] {
  return changeRequests.filter((cr) => {
    if (filters?.status && filters.status !== "ALL" && cr.status !== filters.status) {
      return false;
    }
    if (filters?.entity_type && filters.entity_type !== "ALL" && cr.entity_type !== filters.entity_type) {
      return false;
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      const matchNum = cr.request_number.toLowerCase().includes(q);
      const matchTitle = cr.entity_title.toLowerCase().includes(q);
      const matchMaker = cr.maker_name.toLowerCase().includes(q);
      return matchNum || matchTitle || matchMaker;
    }
    return true;
  });
}

export function decideChangeRequestMock(
  id: string,
  payload: DecideChangeRequestPayload,
  checkerUser: { id: string; name: string; role: string },
): ChangeRequest {
  const target = changeRequests.find((cr) => cr.id === id);
  if (!target) throw new Error("Change request not found");
  if (target.status !== "PENDING") throw new Error("Change request has already been decided");

  // Rule M15.3: Maker cannot be Checker
  if (target.maker_id === checkerUser.id) {
    throw new Error(
      "Rule M15.3 Violation: Maker cannot be Checker. A different admin must approve or reject this change request.",
    );
  }

  target.status = payload.action === "APPROVE" ? "APPROVED" : "REJECTED";
  target.checker_id = checkerUser.id;
  target.checker_name = checkerUser.name;
  target.checker_role = checkerUser.role;
  target.comments = payload.comments;
  target.decided_at = new Date().toISOString();

  return target;
}

export function getSystemHealthMock(): SystemHealthStatus {
  return {
    api_status: "HEALTHY",
    uptime_seconds: 489240, // ~5.6 days
    db_replica_lag_ms: 12,
    redis_queue_depth: 4,
    active_bullmq_workers: 6,
    active_admin_sessions: activeSessions.length,
    maintenance_mode: maintenanceMode,
    min_supported_mobile_version: "v1.4.2 (Build 108)",
    updated_at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function toggleMaintenanceModeMock(enabled: boolean): boolean {
  maintenanceMode = enabled;
  return maintenanceMode;
}

export function getFeatureFlagsMock(): FeatureFlagConfig[] {
  return [...featureFlags];
}

export function toggleFeatureFlagMock(key: string, enabled: boolean): FeatureFlagConfig {
  const flag = featureFlags.find((f) => f.key === key);
  if (!flag) throw new Error("Feature flag not found");
  flag.enabled = enabled;
  return flag;
}

export function getActiveSessionsMock(): ActiveAdminSession[] {
  return [...activeSessions];
}

export function evictSessionMock(sessionId: string): { success: boolean } {
  activeSessions = activeSessions.filter((s) => s.id !== sessionId);
  return { success: true };
}
