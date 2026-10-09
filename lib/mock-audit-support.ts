/**
 * Module 16: Audit, Configuration & Support Mock State & Store
 */

import type {
  AuditEntityType,
  AuditLogEntry,
  SupportTicket,
  SystemConfigParam,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/types/audit-support";

let mockAuditLogs: AuditLogEntry[] = [
  {
    id: "aud-001",
    actor_user_id: "usr-admin-01",
    actor_name: "Ayush Patil",
    actor_role: "ADM_SUPER",
    actor_type: "ADMIN",
    action: "order.status_override",
    entity_type: "ORDER",
    entity_id: "ORD-2026-0042",
    before: { status: "AWAITING_PAYMENT", total_amount: 142500, partner_gstin: "27AAACB1234F1Z5" },
    after: { status: "CONFIRMED", total_amount: 142500, partner_gstin: "27AAACB1234F1Z5" },
    reason: "Bank NEFT utr 30894103 verified manually against Axis Current Account",
    ip: "103.21.144.12",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0",
    geo: "Pune, MH, IN",
    trace_id: "trace-91bf84a2",
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: "aud-002",
    actor_user_id: "usr-admin-02",
    actor_name: "Sneha Deshmukh",
    actor_role: "FINANCE_CONTROLLER",
    actor_type: "ADMIN",
    action: "credit.limit_changed",
    entity_type: "PARTNER",
    entity_id: "PRT-MH-DS-01",
    before: { credit_limit: 1000000, credit_days: 14, tier: "DISTRIBUTOR" },
    after: { credit_limit: 1500000, credit_days: 21, tier: "DISTRIBUTOR" },
    reason: "Seasonal pre-sowing season demand surge approved per Board sanction",
    ip: "103.21.144.15",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/127.0.0.0",
    geo: "Mumbai, MH, IN",
    trace_id: "trace-10ac73bd",
    created_at: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
  },
  {
    id: "aud-003",
    actor_user_id: "usr-admin-01",
    actor_name: "Ayush Patil",
    actor_role: "ADM_SUPER",
    actor_type: "ADMIN",
    action: "config.update",
    entity_type: "CONFIG",
    entity_id: "order.mov_by_tier",
    before: { SS: 180000, DS: 20000, SD: 5000, RT: 1000 },
    after: { SS: 200000, DS: 25000, SD: 5000, RT: 1000 },
    reason: "Revised Minimum Order Value thresholds aligned with Q3 logistics costs",
    ip: "103.21.144.12",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0",
    geo: "Pune, MH, IN",
    trace_id: "trace-7e88029c",
    created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
  },
  {
    id: "aud-004",
    actor_user_id: "usr-ops-04",
    actor_name: "Vikram Rathi",
    actor_role: "LOGISTICS_HEAD",
    actor_type: "ADMIN",
    action: "dispatch.force_manifest",
    entity_type: "DISPATCH",
    entity_id: "MAN-2026-0811",
    before: { manifest_status: "DRAFT", total_orders: 8 },
    after: { manifest_status: "DISPATCHED", total_orders: 8 },
    reason: "Early morning route departure requested by driver MH-12-RN-9944",
    ip: "103.45.22.9",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0",
    geo: "Nagpur, MH, IN",
    trace_id: "trace-3a4bc091",
    created_at: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
  },
  {
    id: "aud-005",
    actor_user_id: "system-scheduler",
    actor_name: "System Worker",
    actor_role: "SYSTEM",
    actor_type: "SYSTEM",
    action: "invoice.irn_auto_generated",
    entity_type: "INVOICE",
    entity_id: "INV-2026-0922",
    before: { irn_status: "PENDING" },
    after: { irn_status: "GENERATED", irn: "7b0451a44e6b..." },
    reason: "ClearTax GSP sync auto-callback accepted",
    ip: "127.0.0.1",
    user_agent: "NestJS-Worker/BullMQ",
    geo: "AWS ap-south-1 (Mumbai)",
    trace_id: "trace-bb90192a",
    created_at: new Date(Date.now() - 540 * 60 * 1000).toISOString(),
  },
];

let mockConfigParams: SystemConfigParam[] = [
  {
    key: "order.sla_hours",
    label: "Order SLA Fulfillment Window",
    description: "Maximum working hours to dispatch an accepted purchase order.",
    category: "ORDER",
    scope: "GLOBAL",
    scope_value: null,
    value: 4,
    value_type: "number",
    unit: "hours",
    effective_from: "2026-01-01T00:00:00Z",
    changed_by: "Ayush Patil (ADM_SUPER)",
    requires_maker_checker: false,
    updated_at: "2026-09-01T10:00:00Z",
  },
  {
    key: "order.mov_by_tier",
    label: "Minimum Order Value (MOV) by Partner Tier",
    description: "Cart checkout threshold requirement per hierarchy tier (₹).",
    category: "ORDER",
    scope: "GLOBAL",
    scope_value: null,
    value: { SS: 200000, DS: 25000, SD: 5000, RT: 1000 },
    value_type: "json",
    unit: "INR",
    effective_from: "2026-09-15T00:00:00Z",
    changed_by: "Ayush Patil (ADM_SUPER)",
    requires_maker_checker: true,
    updated_at: "2026-09-15T12:00:00Z",
  },
  {
    key: "order.cancel_window",
    label: "Order Cancellation Window",
    description: "Lifecycle threshold up to which buyer can self-cancel without penalty.",
    category: "ORDER",
    scope: "GLOBAL",
    scope_value: null,
    value: "Until ACCEPTED",
    value_type: "string",
    effective_from: "2026-01-01T00:00:00Z",
    changed_by: "Ayush Patil (ADM_SUPER)",
    requires_maker_checker: false,
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    key: "assisted.dispute_hours",
    label: "Assisted Ordering Dispute Window",
    description: "Time allotted to field retailer to dispute an assisted booking before auto-confirmation.",
    category: "ORDER",
    scope: "GLOBAL",
    scope_value: null,
    value: 24,
    value_type: "number",
    unit: "hours",
    effective_from: "2026-01-01T00:00:00Z",
    changed_by: "Ayush Patil (ADM_SUPER)",
    requires_maker_checker: false,
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    key: "credit.grace_days",
    label: "Credit Due Date Grace Period",
    description: "Additional days permitted post due-date before account lockdown & dunning.",
    category: "CREDIT",
    scope: "GLOBAL",
    scope_value: null,
    value: 7,
    value_type: "number",
    unit: "days",
    effective_from: "2026-01-01T00:00:00Z",
    changed_by: "Sneha Deshmukh (FINANCE_CONTROLLER)",
    requires_maker_checker: true,
    updated_at: "2026-08-10T14:30:00Z",
  },
  {
    key: "credit.cap_by_tier",
    label: "Maximum Credit Line Ceiling by Tier",
    description: "Upper limit of unsecured credit line allowed per tier without Director approval.",
    category: "CREDIT",
    scope: "GLOBAL",
    scope_value: null,
    value: { SS: 5000000, DS: 1000000, SD: 200000, RT: 50000 },
    value_type: "json",
    unit: "INR",
    effective_from: "2026-08-01T00:00:00Z",
    changed_by: "Sneha Deshmukh (FINANCE_CONTROLLER)",
    requires_maker_checker: true,
    updated_at: "2026-08-01T09:00:00Z",
  },
  {
    key: "price.max_discount_pct",
    label: "Max Manual Sales Discount Cap",
    description: "Maximum percentage discount a field sales officer can apply during assisted booking.",
    category: "PRICING",
    scope: "GLOBAL",
    scope_value: null,
    value: 3.0,
    value_type: "number",
    unit: "%",
    effective_from: "2026-01-01T00:00:00Z",
    changed_by: "Ayush Patil (ADM_SUPER)",
    requires_maker_checker: true,
    updated_at: "2026-03-20T11:00:00Z",
  },
  {
    key: "claim.window_hours",
    label: "Return & Damage Claim Raising Window",
    description: "Hours elapsed since digital POD delivery OTP entry during which damage claims are valid.",
    category: "ORDER",
    scope: "GLOBAL",
    scope_value: null,
    value: 48,
    value_type: "number",
    unit: "hours",
    effective_from: "2026-01-01T00:00:00Z",
    changed_by: "Vikram Rathi (LOGISTICS_HEAD)",
    requires_maker_checker: false,
    updated_at: "2026-04-12T16:00:00Z",
  },
  {
    key: "eway.threshold",
    label: "GST E-Way Bill Trigger Threshold",
    description: "Invoice net value threshold above which E-Way Bill generation is mandatory by law.",
    category: "TAX_COMPLIANCE",
    scope: "GLOBAL",
    scope_value: null,
    value: 50000,
    value_type: "number",
    unit: "INR",
    effective_from: "2026-01-01T00:00:00Z",
    changed_by: "Ayush Patil (ADM_SUPER)",
    requires_maker_checker: true,
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    key: "notify.quiet_hours",
    label: "TRAI DLT Promotional Quiet Hours",
    description: "Window during which non-transactional marketing SMS & push are paused (IST).",
    category: "NOTIFICATIONS",
    scope: "GLOBAL",
    scope_value: null,
    value: "21:00-08:00",
    value_type: "string",
    unit: "IST",
    effective_from: "2026-01-01T00:00:00Z",
    changed_by: "Ayush Patil (ADM_SUPER)",
    requires_maker_checker: false,
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    key: "app.min_version",
    label: "Partner Mobile App Minimum Enforced Version",
    description: "Users on older versions are required to update before placing new orders.",
    category: "APP",
    scope: "GLOBAL",
    scope_value: null,
    value: "1.4.2",
    value_type: "string",
    effective_from: "2026-09-01T00:00:00Z",
    changed_by: "Ayush Patil (ADM_SUPER)",
    requires_maker_checker: false,
    updated_at: "2026-09-01T15:20:00Z",
  },
  {
    key: "kyc.auto_approve_rt_zero_credit",
    label: "Auto-Approve Retailers with Zero Credit",
    description: "Automatically grant ordering capability to Retailers on Advance Payment mode upon PAN verification.",
    category: "KYC",
    scope: "GLOBAL",
    scope_value: null,
    value: true,
    value_type: "boolean",
    effective_from: "2026-01-01T00:00:00Z",
    changed_by: "Ayush Patil (ADM_SUPER)",
    requires_maker_checker: false,
    updated_at: "2026-02-14T10:00:00Z",
  },
];

let mockTickets: SupportTicket[] = [
  {
    id: "tck-001",
    ticket_no: "TCK-2026-1042",
    partner_id: "PRT-MH-RT-01",
    partner_name: "Kisan Krishi Seva Kendra (Jalgaon)",
    partner_tier: "RT",
    user_id: "usr-p-104",
    category: "ORDER",
    subject: "Missing 5 units of Shudh DAP 50kg in Delivery Batch",
    description: "Invoice INV-2026-0811 billed for 50 bags, but delivery truck MH-19-BM-2210 offloaded only 45 bags at Jalgaon depot.",
    priority: "HIGH",
    ref_type: "ORDER",
    ref_id: "ORD-2026-0811",
    status: "IN_PROGRESS",
    assignee: "Suresh Patil (Support Lead)",
    sla_due_at: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    sla_breached: false,
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    messages: [
      {
        id: "msg-01",
        sender_type: "PARTNER",
        sender_name: "Ramesh Choudhary (Owner)",
        message: "We counted bags during offloading in presence of driver. 5 bags short. POD note endorsed.",
        created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
      {
        id: "msg-02",
        sender_type: "ADMIN",
        sender_name: "Suresh Patil (Support Lead)",
        message: "Acknowledged Ramesh ji. We are checking with Nashik Hub dispatch manifest and weight slip.",
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "tck-002",
    ticket_no: "TCK-2026-1043",
    partner_id: "PRT-MH-DS-01",
    partner_name: "Marathwada Agro Distributors (Aurangabad)",
    partner_tier: "DS",
    user_id: "usr-p-202",
    category: "PAYMENT",
    subject: "UPI Payment ₹45,000 debited from ICICI but order shows Pending",
    description: "Paid via Razorpay QR code at 08:30 AM. Bank reference 428819208391. Kindly reconcile ledger.",
    priority: "CRITICAL",
    ref_type: "PAYMENT",
    ref_id: "PAY-2026-0919",
    status: "OPEN",
    assignee: "Sneha Deshmukh (Finance)",
    sla_due_at: new Date(Date.now() + 1 * 3600 * 1000).toISOString(),
    sla_breached: false,
    created_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    messages: [
      {
        id: "msg-10",
        sender_type: "PARTNER",
        sender_name: "Santosh Joshi (Director)",
        message: "ICICI debit SMS received. Please confirm so our sub-distributors do not face stock hold.",
        created_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "tck-003",
    ticket_no: "TCK-2026-1039",
    partner_id: "PRT-MH-SD-02",
    partner_name: "Vidarbha Krishi Vikas (Akola)",
    partner_tier: "SD",
    user_id: "usr-p-311",
    category: "APP_BUG",
    subject: "Unable to download GST Tax Invoice PDF on Android 14",
    description: "Clicking 'Download Tax Invoice' button shows white screen spinner and returns back to dashboard.",
    priority: "MEDIUM",
    ref_type: "INVOICE",
    ref_id: "INV-2026-0799",
    status: "RESOLVED",
    assignee: "Gaurav Shinde (Tech Support)",
    sla_due_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    sla_breached: false,
    resolution_notes: "Advised updating to App v1.4.2 which resolved Android 14 scoped storage file permission. PDF successfully verified.",
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    messages: [
      {
        id: "msg-21",
        sender_type: "PARTNER",
        sender_name: "Amit Varma",
        message: "Invoice download fails on Samsung Galaxy M34.",
        created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      },
      {
        id: "msg-22",
        sender_type: "ADMIN",
        sender_name: "Gaurav Shinde (Tech Support)",
        message: "Please update the Agribid app from Play Store to v1.4.2 which includes the fix.",
        created_at: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
      },
      {
        id: "msg-23",
        sender_type: "PARTNER",
        sender_name: "Amit Varma",
        message: "Updated app, PDF opened properly now. Thank you!",
        created_at: new Date(Date.now() - 21 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "tck-004",
    ticket_no: "TCK-2026-1035",
    partner_id: "PRT-MH-SS-01",
    partner_name: "Maharashtra Agro Apex State Stockist",
    partner_tier: "SS",
    user_id: "usr-p-001",
    category: "OTHER",
    subject: "Request for Q3 Volume Rebate Credit Note certificate",
    description: "Need stamped quarterly scheme settlement ledger report for statutory audit.",
    priority: "LOW",
    status: "CLOSED",
    assignee: "Sneha Deshmukh (Finance)",
    sla_due_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    sla_breached: false,
    resolution_notes: "Credit note settlement ledger exported and emailed to accounts@mh-apex.com",
    created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 70 * 3600 * 1000).toISOString(),
    messages: [
      {
        id: "msg-31",
        sender_type: "PARTNER",
        sender_name: "K. R. Rao (CFO)",
        message: "Please share Q3 rebate certificate signed by Head of Accounts.",
        created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
      },
      {
        id: "msg-32",
        sender_type: "ADMIN",
        sender_name: "Sneha Deshmukh (Finance)",
        message: "Certificate CN-2026-Q3-001 issued and dispatched via registered email.",
        created_at: new Date(Date.now() - 71 * 3600 * 1000).toISOString(),
      },
    ],
  },
];

export function getAuditLogsMock(filters?: {
  entity?: AuditEntityType | "ALL";
  actor?: string;
  action?: string;
  search?: string;
}): AuditLogEntry[] {
  let list = [...mockAuditLogs];
  if (filters?.entity && filters.entity !== "ALL") {
    list = list.filter((l) => l.entity_type === filters.entity);
  }
  if (filters?.actor) {
    const a = filters.actor.toLowerCase();
    list = list.filter(
      (l) =>
        l.actor_name.toLowerCase().includes(a) ||
        l.actor_user_id.toLowerCase().includes(a) ||
        l.actor_role.toLowerCase().includes(a),
    );
  }
  if (filters?.action) {
    list = list.filter((l) => l.action.toLowerCase().includes(filters.action!.toLowerCase()));
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (l) =>
        l.entity_id.toLowerCase().includes(s) ||
        l.reason.toLowerCase().includes(s) ||
        l.trace_id.toLowerCase().includes(s) ||
        l.action.toLowerCase().includes(s),
    );
  }
  return list;
}

export function addAuditLogMock(entry: Omit<AuditLogEntry, "id" | "created_at">): AuditLogEntry {
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `aud-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  mockAuditLogs.unshift(newEntry);
  return newEntry;
}

export function getConfigParamsMock(category?: string): SystemConfigParam[] {
  if (category && category !== "ALL") {
    return mockConfigParams.filter((c) => c.category === category);
  }
  return mockConfigParams;
}

export function updateConfigParamMock(
  key: string,
  value: any,
  changedBy: string,
  reason: string,
): SystemConfigParam {
  const idx = mockConfigParams.findIndex((c) => c.key === key);
  if (idx === -1) throw new Error(`Config parameter ${key} not found`);

  const prev = mockConfigParams[idx];
  const updated: SystemConfigParam = {
    ...prev,
    value,
    changed_by: changedBy,
    updated_at: new Date().toISOString(),
  };
  mockConfigParams[idx] = updated;

  // Automatically write to audit log
  addAuditLogMock({
    actor_user_id: "usr-admin-01",
    actor_name: changedBy,
    actor_role: "ADM_SUPER",
    actor_type: "ADMIN",
    action: "config.update",
    entity_type: "CONFIG",
    entity_id: key,
    before: { [key]: prev.value },
    after: { [key]: value },
    reason: reason || `Updated system configuration parameter ${key}`,
    ip: "103.21.144.12",
    user_agent: "Admin Web Console",
    geo: "Pune, MH, IN",
    trace_id: `trace-${Math.random().toString(16).slice(2, 10)}`,
  });

  return updated;
}

export function getSupportTicketsMock(filters?: {
  status?: TicketStatus | "ALL";
  category?: TicketCategory | "ALL";
  priority?: TicketPriority | "ALL";
  search?: string;
}): SupportTicket[] {
  let list = [...mockTickets];
  if (filters?.status && filters.status !== "ALL") {
    list = list.filter((t) => t.status === filters.status);
  }
  if (filters?.category && filters.category !== "ALL") {
    list = list.filter((t) => t.category === filters.category);
  }
  if (filters?.priority && filters.priority !== "ALL") {
    list = list.filter((t) => t.priority === filters.priority);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (t) =>
        t.ticket_no.toLowerCase().includes(s) ||
        t.partner_name.toLowerCase().includes(s) ||
        t.subject.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s),
    );
  }
  return list;
}

export function getSupportTicketByIdMock(id: string): SupportTicket | null {
  return mockTickets.find((t) => t.id === id || t.ticket_no === id) || null;
}

export function replyToTicketMock(
  id: string,
  message: string,
  senderName: string,
): SupportTicket {
  const ticket = mockTickets.find((t) => t.id === id || t.ticket_no === id);
  if (!ticket) throw new Error("Ticket not found");

  ticket.messages.push({
    id: `msg-${Date.now()}`,
    sender_type: "ADMIN",
    sender_name: senderName,
    message,
    created_at: new Date().toISOString(),
  });
  if (ticket.status === "OPEN") {
    ticket.status = "IN_PROGRESS";
  }
  ticket.updated_at = new Date().toISOString();
  return ticket;
}

export function updateTicketStatusMock(
  id: string,
  status: TicketStatus,
  resolutionNotes?: string,
  assignee?: string,
): SupportTicket {
  const ticket = mockTickets.find((t) => t.id === id || t.ticket_no === id);
  if (!ticket) throw new Error("Ticket not found");

  ticket.status = status;
  if (resolutionNotes) ticket.resolution_notes = resolutionNotes;
  if (assignee) ticket.assignee = assignee;
  ticket.updated_at = new Date().toISOString();
  return ticket;
}

