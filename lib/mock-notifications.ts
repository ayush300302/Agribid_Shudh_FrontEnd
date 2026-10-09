/**
 * Module 13: Notifications & Alert Engine Mock Store & Logic
 * Matches Dev Spec M13 and Section 12 of Agribid Shudh PRD
 */

import type {
  NotificationChannel,
  NotificationLanguage,
  NotificationMetrics,
  NotificationPreferences,
  NotificationRecord,
  NotificationStatus,
  NotificationTemplate,
  SendTestNotificationRequest,
} from "@/types/notification";

// 1. Initial Notification Templates (DLT registered, Multi-lingual)
export const INITIAL_TEMPLATES: NotificationTemplate[] = [
  // ORDER_PLACED_SELLER
  {
    code: "ORDER_PLACED_SELLER",
    name: "New Order Alert for Seller",
    channel: "WHATSAPP",
    language: "en",
    category: "ORDERS",
    title: "New Purchase Order Received",
    body: "Agribid Shudh: New PO #{{orderNo}} placed by {{buyerName}} for ₹{{amount}}. Please review and accept stock allocation within 4 hours.",
    wa_template_name: "agribid_new_po_alert_v1",
    transactional: true,
    variables: ["orderNo", "buyerName", "amount"],
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
  {
    code: "ORDER_PLACED_SELLER",
    name: "New Order Alert for Seller (Hindi)",
    channel: "WHATSAPP",
    language: "hi",
    category: "ORDERS",
    title: "नया खरीद ऑर्डर प्राप्त हुआ",
    body: "एग्रीबिड शुद्ध: {{buyerName}} द्वारा ₹{{amount}} का नया ऑर्डर #{{orderNo}} दर्ज किया गया है। कृपया 4 घंटे के भीतर स्टॉक स्वीकार करें।",
    wa_template_name: "agribid_new_po_alert_hi",
    transactional: true,
    variables: ["orderNo", "buyerName", "amount"],
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
  {
    code: "ORDER_PLACED_SELLER",
    name: "New Order Alert for Seller (Marathi)",
    channel: "WHATSAPP",
    language: "mr",
    category: "ORDERS",
    title: "नवीन खरेदी ऑर्डर प्राप्त झाली",
    body: "ॲग्रीबीड शुद्ध: {{buyerName}} द्वारे ₹{{amount}} ची नवीन ऑर्डर #{{orderNo}} प्राप्त झाली आहे. कृपया 4 तासांत स्वीकृती द्या.",
    wa_template_name: "agribid_new_po_alert_mr",
    transactional: true,
    variables: ["orderNo", "buyerName", "amount"],
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },

  // DELIVERY_OTP (DLT Mandatory SMS)
  {
    code: "DELIVERY_OTP",
    name: "Dispatch POD Delivery OTP",
    channel: "SMS",
    language: "en",
    category: "DELIVERY",
    title: "Delivery Verification OTP",
    body: "Agribid: Your delivery verification OTP for Order #{{orderNo}} is {{otp}}. Share only with driver upon inspecting bags. Valid for 30 mins.",
    dlt_template_id: "1407161829304192002",
    transactional: true,
    variables: ["orderNo", "otp"],
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
  {
    code: "DELIVERY_OTP",
    name: "Dispatch POD Delivery OTP (Hindi)",
    channel: "SMS",
    language: "hi",
    category: "DELIVERY",
    title: "डिलीवरी सत्यापन ओटीपी",
    body: "एग्रीबिड: ऑर्डर #{{orderNo}} के लिए आपका सत्यापन ओटीपी {{otp}} है। माल जांचने के बाद ही ड्राइवर को दें।",
    dlt_template_id: "1407161829304192003",
    transactional: true,
    variables: ["orderNo", "otp"],
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },

  // ORDER_DISPATCHED
  {
    code: "ORDER_DISPATCHED",
    name: "Shipment Dispatched & Vehicle Manifest",
    channel: "WHATSAPP",
    language: "en",
    category: "DELIVERY",
    title: "Consignment Dispatched",
    body: "Agribid Shudh: Order #{{orderNo}} is loaded on Vehicle {{vehicleNo}} (Driver: {{driverName}}, Mob: {{driverPhone}}). E-Way Bill: {{ewayBill}}.",
    wa_template_name: "agribid_dispatched_alert_v1",
    transactional: true,
    variables: ["orderNo", "vehicleNo", "driverName", "driverPhone", "ewayBill"],
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },

  // PAYMENT_RECEIVED
  {
    code: "PAYMENT_RECEIVED",
    name: "Payment Receipt Settlement Confirmation",
    channel: "SMS",
    language: "en",
    category: "PAYMENTS",
    title: "Payment Receipt Confirmed",
    body: "Agribid: Received ₹{{amount}} via {{mode}} for Order #{{orderNo}}. Ref: {{txnRef}}. Updated Ledger Balance: ₹{{balance}}. -Agribid Shudh",
    dlt_template_id: "1407161829304192004",
    transactional: true,
    variables: ["amount", "mode", "orderNo", "txnRef", "balance"],
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },

  // CREDIT_HOLD_TRIGGERED
  {
    code: "CREDIT_HOLD_TRIGGERED",
    name: "Credit Hold Alert (Rule PY-06)",
    channel: "IN_APP",
    language: "en",
    category: "PAYMENTS",
    title: "Account Placed on Credit Hold",
    body: "Automated Credit Hold triggered for {{partnerName}}: Outstanding of ₹{{outstanding}} exceeds approved limit or contains overdues beyond {{overdueDays}} days.",
    transactional: true,
    variables: ["partnerName", "outstanding", "overdueDays"],
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },

  // CLAIM_RAISED
  {
    code: "CLAIM_RAISED",
    name: "New Return / Quality Claim Alert",
    channel: "IN_APP",
    language: "en",
    category: "CLAIMS",
    title: "Quality Claim Filed",
    body: "Claim #{{claimNo}} filed for Order #{{orderNo}} by {{buyerName}}. Reason: {{reason}}. Photo evidence submitted. Action needed within 48h.",
    transactional: true,
    variables: ["claimNo", "orderNo", "buyerName", "reason"],
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },

  // LOW_STOCK_ALERT
  {
    code: "LOW_STOCK_ALERT",
    name: "Godown Buffer Reorder Warning",
    channel: "PUSH",
    language: "en",
    category: "STOCK",
    title: "Low Inventory Warning",
    body: "Warehouse alert: {{sku}} in {{godownName}} has fallen to {{currentStock}} Bags (Safety minimum: {{reorderLevel}}). Create stock transfer PO.",
    transactional: false,
    variables: ["sku", "godownName", "currentStock", "reorderLevel"],
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
];

// 2. Initial Notification History / Delivery Logs
export const INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: "notif-001",
    recipient_id: "p-001",
    recipient_name: "MahaAgro State Stockist Pvt Ltd",
    recipient_phone: "+91 98220 12345",
    recipient_role: "state_stockist",
    template_code: "ORDER_PLACED_SELLER",
    channel: "WHATSAPP",
    category: "ORDERS",
    title: "New Purchase Order Received",
    body: "Agribid Shudh: New PO #ORD-2609-000101 placed by Sahyadri Krishi Kendra for ₹2,10,672. Please review and accept stock allocation within 4 hours.",
    payload: {
      screen: "ORDER_DETAIL",
      id: "ord-001",
      actionUrl: "/admin/orders/ord-001",
    },
    status: "DELIVERED",
    transactional: true,
    retry_count: 0,
    max_retries: 3,
    provider_message_id: "wa_msg_981240129",
    sent_at: "2026-03-10T10:15:30Z",
    delivered_at: "2026-03-10T10:15:32Z",
    read_at: "2026-03-10T10:18:00Z",
    created_at: "2026-03-10T10:15:30Z",
  },
  {
    id: "notif-002",
    recipient_id: "p-002",
    recipient_name: "Sahyadri Krishi Kendra",
    recipient_phone: "+91 98231 67890",
    recipient_role: "distributor",
    template_code: "DELIVERY_OTP",
    channel: "SMS",
    category: "DELIVERY",
    title: "Delivery Verification OTP",
    body: "Agribid: Your delivery verification OTP for Order #ORD-2609-000101 is 918234. Share only with driver upon inspecting bags. Valid for 30 mins.",
    payload: {
      screen: "ORDER_POD",
      id: "ord-001",
      actionUrl: "/admin/delivery",
    },
    status: "DELIVERED",
    transactional: true,
    retry_count: 0,
    max_retries: 3,
    dlt_template_id: "1407161829304192002",
    provider_message_id: "sms_airtel_8912304",
    sent_at: "2026-03-10T14:40:00Z",
    delivered_at: "2026-03-10T14:40:03Z",
    created_at: "2026-03-10T14:40:00Z",
  },
  {
    id: "notif-003",
    recipient_id: "usr-admin-01",
    recipient_name: "Ayush Patil (Credit Risk Desk)",
    recipient_phone: "+91 99887 76655",
    recipient_role: "admin",
    template_code: "CREDIT_HOLD_TRIGGERED",
    channel: "IN_APP",
    category: "PAYMENTS",
    title: "Account Placed on Credit Hold",
    body: "Automated Credit Hold triggered for Kisan Seva Krishi Kendra: Outstanding of ₹1,85,000 exceeds approved limit or contains overdues beyond 15 days.",
    payload: {
      screen: "CREDIT_MANAGEMENT",
      id: "p-003",
      actionUrl: "/admin/credit",
    },
    status: "SENT",
    transactional: true,
    retry_count: 0,
    max_retries: 3,
    sent_at: "2026-03-10T16:00:00Z",
    created_at: "2026-03-10T16:00:00Z",
  },
  {
    id: "notif-004",
    recipient_id: "usr-admin-01",
    recipient_name: "Ayush Patil",
    recipient_phone: "+91 99887 76655",
    recipient_role: "admin",
    template_code: "CLAIM_RAISED",
    channel: "IN_APP",
    category: "CLAIMS",
    title: "Quality Claim Filed",
    body: "Claim #CLM-2609-000001 filed for Order #ORD-2609-000101 by Sahyadri Krishi Kendra. Reason: DAMAGE. Photo evidence submitted. Action needed within 48h.",
    payload: {
      screen: "CLAIM_INSPECTION",
      id: "CLM-2609-000001",
      actionUrl: "/admin/claims",
    },
    status: "READ",
    transactional: true,
    retry_count: 0,
    max_retries: 3,
    sent_at: "2026-03-10T16:30:00Z",
    delivered_at: "2026-03-10T16:30:01Z",
    read_at: "2026-03-10T16:45:00Z",
    created_at: "2026-03-10T16:30:00Z",
  },
  {
    id: "notif-005",
    recipient_id: "p-003",
    recipient_name: "Kisan Seva Krishi Kendra",
    recipient_phone: "+91 97654 32109",
    recipient_role: "sub_distributor",
    template_code: "PAYMENT_RECEIVED",
    channel: "SMS",
    category: "PAYMENTS",
    title: "Payment Receipt Confirmed",
    body: "Agribid: Received ₹75,000 via NEFT for Order #ORD-2609-000102. Ref: SBI20260310991. Updated Ledger Balance: ₹1,10,000. -Agribid Shudh",
    status: "FAILED",
    transactional: true,
    retry_count: 2,
    max_retries: 3,
    dlt_template_id: "1407161829304192004",
    failed_reason: "TRAI DLT Handshake Timeout (Telco routing queue full)",
    sent_at: "2026-03-10T18:10:00Z",
    created_at: "2026-03-10T18:10:00Z",
  },
  {
    id: "notif-006",
    recipient_id: "usr-admin-01",
    recipient_name: "Warehouse In-Charge",
    recipient_phone: "+91 98901 23456",
    recipient_role: "admin",
    template_code: "LOW_STOCK_ALERT",
    channel: "PUSH",
    category: "STOCK",
    title: "Low Inventory Warning",
    body: "Warehouse alert: RICE-BAS-PRM-50KG in Bhosari Central Godown has fallen to 45 Bags (Safety minimum: 100). Create stock transfer PO.",
    payload: {
      screen: "INVENTORY_LEDGER",
      actionUrl: "/admin/inventory",
    },
    status: "DELIVERED",
    transactional: false,
    retry_count: 0,
    max_retries: 3,
    provider_message_id: "fcm_push_881923",
    sent_at: "2026-03-10T19:00:00Z",
    delivered_at: "2026-03-10T19:00:02Z",
    created_at: "2026-03-10T19:00:00Z",
  },
];

// In-memory store
let notificationTemplates = [...INITIAL_TEMPLATES];
let notificationLog = [...INITIAL_NOTIFICATIONS];
let systemPreferences: NotificationPreferences = {
  user_id: "default-admin",
  quiet_hours_enabled: true,
  quiet_hours_start: "21:00",
  quiet_hours_end: "08:00",
  categories: [
    {
      category: "ORDERS",
      push_enabled: true,
      sms_enabled: true,
      whatsapp_enabled: true,
      in_app_enabled: true,
    },
    {
      category: "PAYMENTS",
      push_enabled: true,
      sms_enabled: true,
      whatsapp_enabled: true,
      in_app_enabled: true,
    },
    {
      category: "DELIVERY",
      push_enabled: true,
      sms_enabled: true,
      whatsapp_enabled: true,
      in_app_enabled: true,
    },
    {
      category: "CLAIMS",
      push_enabled: true,
      sms_enabled: true,
      whatsapp_enabled: true,
      in_app_enabled: true,
    },
    {
      category: "STOCK",
      push_enabled: true,
      sms_enabled: false,
      whatsapp_enabled: false,
      in_app_enabled: true,
    },
    {
      category: "OFFERS",
      push_enabled: true,
      sms_enabled: false,
      whatsapp_enabled: true,
      in_app_enabled: false,
    },
  ],
};

// Check if currently within Quiet Hours (IST: 21:00 - 08:00)
export function isCurrentlyQuietHours(): boolean {
  if (!systemPreferences.quiet_hours_enabled) return false;
  const now = new Date();
  // IST is UTC+5:30
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istMinutes = (utcMinutes + 330) % 1440;
  const istHour = Math.floor(istMinutes / 60);

  // 21:00 to 08:00 IST means hour >= 21 or hour < 8
  return istHour >= 21 || istHour < 8;
}

// 3. Service operations
export function getNotificationsMock(filters?: {
  channel?: NotificationChannel | "ALL";
  category?: string;
  status?: NotificationStatus | "ALL";
  search?: string;
}): NotificationRecord[] {
  return notificationLog.filter((item) => {
    if (filters?.channel && filters.channel !== "ALL" && item.channel !== filters.channel) {
      return false;
    }
    if (filters?.category && filters.category !== "ALL" && item.category !== filters.category) {
      return false;
    }
    if (filters?.status && filters.status !== "ALL" && item.status !== filters.status) {
      return false;
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      const matchText =
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        item.recipient_name.toLowerCase().includes(q) ||
        item.recipient_phone.includes(q) ||
        item.template_code.toLowerCase().includes(q);
      if (!matchText) return false;
    }
    return true;
  });
}

export function getUnreadCountMock(): number {
  return notificationLog.filter(
    (n) => n.channel === "IN_APP" && (n.status === "SENT" || n.status === "DELIVERED"),
  ).length;
}

export function markNotificationsAsReadMock(ids?: string[]): { success: boolean; count: number } {
  let count = 0;
  const now = new Date().toISOString();
  notificationLog = notificationLog.map((n) => {
    if (n.channel === "IN_APP" && (!ids || ids.includes(n.id)) && n.status !== "READ") {
      count++;
      return { ...n, status: "READ" as NotificationStatus, read_at: now };
    }
    return n;
  });
  return { success: true, count };
}

export function retryFailedNotificationMock(id: string): NotificationRecord {
  const target = notificationLog.find((n) => n.id === id);
  if (!target) throw new Error("Notification not found");

  target.retry_count += 1;
  target.status = "DELIVERED";
  target.sent_at = new Date().toISOString();
  target.delivered_at = new Date().toISOString();
  target.failed_reason = undefined;
  target.provider_message_id = `retry_prov_${Date.now()}`;

  return target;
}

export function getTemplatesMock(): NotificationTemplate[] {
  return [...notificationTemplates];
}

export function getTemplateByCodeMock(
  code: string,
  lang: NotificationLanguage = "en",
): NotificationTemplate | undefined {
  return notificationTemplates.find(
    (t) => t.code === code && t.language === lang,
  ) || notificationTemplates.find((t) => t.code === code);
}

export function saveTemplateMock(template: NotificationTemplate): NotificationTemplate {
  const existingIdx = notificationTemplates.findIndex(
    (t) => t.code === template.code && t.language === template.language,
  );
  if (existingIdx >= 0) {
    notificationTemplates[existingIdx] = {
      ...template,
      updated_at: new Date().toISOString(),
    };
    return notificationTemplates[existingIdx];
  } else {
    const created: NotificationTemplate = {
      ...template,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    notificationTemplates.push(created);
    return created;
  }
}

export function sendTestNotificationMock(
  req: SendTestNotificationRequest,
): NotificationRecord {
  const template = getTemplateByCodeMock(req.template_code, req.language);
  let renderedBody = template?.body || "Test Notification Body";
  let renderedTitle = template?.title || "Test Notification";

  // Replace handlebars variables
  if (req.variables) {
    Object.entries(req.variables).forEach(([key, val]) => {
      renderedBody = renderedBody.replace(new RegExp(`{{${key}}}`, "g"), val);
      renderedTitle = renderedTitle.replace(new RegExp(`{{${key}}}`, "g"), val);
    });
  }

  // Quiet hours rule: non-transactional messages are QUEUED during quiet hours
  const quietHours = isCurrentlyQuietHours();
  const willQueue = quietHours && !template?.transactional;

  const newRecord: NotificationRecord = {
    id: `notif-${Date.now().toString(36)}`,
    recipient_id: "test-user-custom",
    recipient_name: req.recipient_name || "Test Recipient",
    recipient_phone: req.recipient_phone,
    recipient_role: "partner",
    template_code: req.template_code,
    channel: req.channel,
    category: template?.category || "SYSTEM",
    title: renderedTitle,
    body: renderedBody,
    status: willQueue ? "QUEUED" : "DELIVERED",
    transactional: template?.transactional ?? true,
    retry_count: 0,
    max_retries: 3,
    dlt_template_id: template?.dlt_template_id,
    provider_message_id: `live_gw_${Date.now()}`,
    sent_at: willQueue ? undefined : new Date().toISOString(),
    delivered_at: willQueue ? undefined : new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  notificationLog.unshift(newRecord);
  return newRecord;
}

export function getNotificationMetricsMock(): NotificationMetrics {
  const total = notificationLog.length;
  const delivered = notificationLog.filter(
    (n) => n.status === "DELIVERED" || n.status === "READ",
  ).length;
  const failed = notificationLog.filter((n) => n.status === "FAILED").length;
  const unread = getUnreadCountMock();

  return {
    total_dispatched: total,
    delivered_percentage: total > 0 ? Math.round((delivered / total) * 100) : 100,
    failed_count: failed,
    unread_inbox_count: unread,
    channel_distribution: {
      in_app: notificationLog.filter((n) => n.channel === "IN_APP").length,
      sms: notificationLog.filter((n) => n.channel === "SMS").length,
      whatsapp: notificationLog.filter((n) => n.channel === "WHATSAPP").length,
      push: notificationLog.filter((n) => n.channel === "PUSH").length,
    },
    is_quiet_hours_active: isCurrentlyQuietHours(),
  };
}

export function getPreferencesMock(): NotificationPreferences {
  return { ...systemPreferences };
}

export function updatePreferencesMock(
  prefs: Partial<NotificationPreferences>,
): NotificationPreferences {
  systemPreferences = {
    ...systemPreferences,
    ...prefs,
  };
  return systemPreferences;
}
