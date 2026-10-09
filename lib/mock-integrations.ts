/**
 * Module 17: Integrations Hub Mock State & Store
 */

import type {
  AdapterType,
  IntegrationConnector,
  IntegrationLogEntry,
  TallyJobType,
  TallySyncJob,
  WebhookSubscription,
} from "@/types/integrations";

let mockConnectors: IntegrationConnector[] = [
  {
    id: "conn-01",
    adapter: "SmsProvider",
    name: "TRAI DLT SMS Gateway",
    vendor: "MSG91 Enterprise",
    direction: "IN_OUT",
    env: "PRODUCTION",
    status: "HEALTHY",
    uptime_pct: 99.98,
    circuit_breaker: "CLOSED",
    avg_latency_ms: 184,
    total_calls_24h: 1420,
    failed_calls_24h: 2,
    last_sync_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    description: "DLT Header AGRIBD; Entity ID 140155209000; Transactional OTP & dispatch alerts.",
  },
  {
    id: "conn-02",
    adapter: "PushProvider",
    name: "Mobile Push Notifications",
    vendor: "Firebase Cloud Messaging (FCM)",
    direction: "OUT",
    env: "PRODUCTION",
    status: "HEALTHY",
    uptime_pct: 100.0,
    circuit_breaker: "CLOSED",
    avg_latency_ms: 112,
    total_calls_24h: 3890,
    failed_calls_24h: 0,
    last_sync_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    description: "Topic-based broadcast by partner tier and direct device token dispatch.",
  },
  {
    id: "conn-03",
    adapter: "MapsProvider",
    name: "Geo & Distance Matrix",
    vendor: "Google Maps Platform",
    direction: "OUT",
    env: "PRODUCTION",
    status: "HEALTHY",
    uptime_pct: 99.95,
    circuit_breaker: "CLOSED",
    avg_latency_ms: 245,
    total_calls_24h: 840,
    failed_calls_24h: 1,
    last_sync_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    description: "Geocoding partner depot GPS coords and calculating delivery route distance.",
  },
  {
    id: "conn-04",
    adapter: "StorageProvider",
    name: "Cloud Document Vault",
    vendor: "AWS S3 (ap-south-1)",
    direction: "OUT",
    env: "PRODUCTION",
    status: "HEALTHY",
    uptime_pct: 100.0,
    circuit_breaker: "CLOSED",
    avg_latency_ms: 88,
    total_calls_24h: 1950,
    failed_calls_24h: 0,
    last_sync_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    description: "Encrypted pre-signed URLs for GST Invoices, POD photos, and KYC documents.",
  },
  {
    id: "conn-05",
    adapter: "KycVerifier",
    name: "Statutory KYC Verifier",
    vendor: "Signzy / Cashfree Verify",
    direction: "OUT",
    env: "PRODUCTION",
    status: "HEALTHY",
    uptime_pct: 99.82,
    circuit_breaker: "CLOSED",
    avg_latency_ms: 640,
    total_calls_24h: 320,
    failed_calls_24h: 4,
    last_sync_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    description: "Automated GSTIN active verification, PAN check & penny-drop bank account validation.",
  },
  {
    id: "conn-06",
    adapter: "PaymentGateway",
    name: "Instant Payment Gateway & UPI",
    vendor: "Razorpay / Cashfree",
    direction: "IN_OUT",
    env: "PRODUCTION",
    status: "HEALTHY",
    uptime_pct: 99.99,
    circuit_breaker: "CLOSED",
    avg_latency_ms: 320,
    total_calls_24h: 2150,
    failed_calls_24h: 3,
    last_sync_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    description: "Dynamic QR generation, s.269ST cash compliance checks, and real-time webhook callback.",
  },
  {
    id: "conn-07",
    adapter: "GspProvider",
    name: "GSTN e-Invoice & E-Way Bill",
    vendor: "ClearTax GSP Bridge",
    direction: "OUT",
    env: "PRODUCTION",
    status: "HEALTHY",
    uptime_pct: 99.78,
    circuit_breaker: "CLOSED",
    avg_latency_ms: 580,
    total_calls_24h: 760,
    failed_calls_24h: 5,
    last_sync_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    description: "Real-time 64-char IRN hashing, QR signing, and E-Way Bill Part-A/Part-B generation.",
  },
  {
    id: "conn-08",
    adapter: "WhatsAppProvider",
    name: "WhatsApp Business API",
    vendor: "Meta Cloud API / Gupshup",
    direction: "IN_OUT",
    env: "PRODUCTION",
    status: "HEALTHY",
    uptime_pct: 99.91,
    circuit_breaker: "CLOSED",
    avg_latency_ms: 390,
    total_calls_24h: 1100,
    failed_calls_24h: 1,
    last_sync_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    description: "HSM pre-approved templates for invoice PDFs and dispatch tracking links.",
  },
  {
    id: "conn-09",
    adapter: "ErpConnector",
    name: "Tally Prime ERP Accounting Bridge",
    vendor: "Tally XML / ODBC Sync",
    direction: "IN_OUT",
    env: "PRODUCTION",
    status: "HEALTHY",
    uptime_pct: 99.65,
    circuit_breaker: "CLOSED",
    avg_latency_ms: 1240,
    total_calls_24h: 180,
    failed_calls_24h: 2,
    last_sync_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    description: "Bidirectional sync: Sales Vouchers, Credit Notes, and statutory ledger closing balances.",
  },
];

let mockIntegrationLogs: IntegrationLogEntry[] = [
  {
    id: "ilog-01",
    adapter: "GspProvider",
    vendor: "ClearTax GSP Bridge",
    operation: "gsp.generate_irn",
    ref_type: "INVOICE",
    ref_id: "INV-2026-0922",
    status: "SUCCESS",
    http_code: 200,
    latency_ms: 540,
    attempt: 1,
    circuit_breaker_status: "CLOSED",
    request_payload: { doc_type: "INV", doc_num: "INV-2026-0922", gstin_seller: "27AAACB0000A1Z5" },
    response_payload: { irn: "7b0451a44e6b91c8...", ack_no: 1226109401, status: "ACT" },
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "ilog-02",
    adapter: "PaymentGateway",
    vendor: "Razorpay / Cashfree",
    operation: "pg.webhook_payment_captured",
    ref_type: "PAYMENT",
    ref_id: "pay_Q8a9ZkdL291k",
    status: "SUCCESS",
    http_code: 200,
    latency_ms: 210,
    attempt: 1,
    circuit_breaker_status: "CLOSED",
    request_payload: { event: "payment.captured", amount: 14250000, currency: "INR" },
    response_payload: { acknowledged: true, ledger_entry: "LEDG-MH-0091" },
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: "ilog-03",
    adapter: "SmsProvider",
    vendor: "MSG91 Enterprise",
    operation: "sms.send_delivery_otp",
    ref_type: "DISPATCH",
    ref_id: "MAN-2026-0811",
    status: "SUCCESS",
    http_code: 200,
    latency_ms: 175,
    attempt: 1,
    circuit_breaker_status: "CLOSED",
    request_payload: { template_id: "1407168923", mobile: "98******10", dlt_te_id: "100789" },
    response_payload: { message_id: "msg_90a18bc", status: "DELIVRD" },
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: "ilog-04",
    adapter: "ErpConnector",
    vendor: "Tally XML / ODBC Sync",
    operation: "tally.export_sales_vouchers",
    ref_type: "SYNC_BATCH",
    ref_id: "BATCH-TALLY-2026-09",
    status: "SUCCESS",
    http_code: 200,
    latency_ms: 1420,
    attempt: 1,
    circuit_breaker_status: "CLOSED",
    request_payload: { batch_date: "2026-10-08", voucher_count: 48, format: "XML" },
    response_payload: { imported_count: 48, errors: 0, tally_guid: "e0374-2918-bb92" },
    created_at: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
  },
  {
    id: "ilog-05",
    adapter: "KycVerifier",
    vendor: "Signzy / Cashfree Verify",
    operation: "kyc.verify_gstin",
    ref_type: "PARTNER",
    ref_id: "PRT-MH-RT-01",
    status: "SUCCESS",
    http_code: 200,
    latency_ms: 610,
    attempt: 1,
    circuit_breaker_status: "CLOSED",
    request_payload: { gstin: "27AAACB1234F1Z5" },
    response_payload: { legal_name: "Kisan Krishi Seva Kendra", status: "Active", state_jurisdiction: "Ward 4 Jalgaon" },
    created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
  },
];

let mockTallyJobs: TallySyncJob[] = [
  {
    id: "tjob-001",
    job_type: "SALES_VOUCHERS",
    status: "SUCCESS",
    records_synced: 48,
    export_format: "XML",
    started_at: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    download_filename: "Tally_SalesVouchers_20261008.xml",
  },
  {
    id: "tjob-002",
    job_type: "PURCHASE_RECEIPTS",
    status: "SUCCESS",
    records_synced: 12,
    export_format: "XML",
    started_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 24 * 3600 * 1000 + 120000).toISOString(),
    download_filename: "Tally_PurchaseReceipts_20261007.xml",
  },
  {
    id: "tjob-003",
    job_type: "LEDGER_BALANCES",
    status: "SUCCESS",
    records_synced: 142,
    export_format: "JSON",
    started_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 48 * 3600 * 1000 + 180000).toISOString(),
    download_filename: "Tally_ClosingBalances_20261006.json",
  },
];

let mockWebhooks: WebhookSubscription[] = [
  {
    id: "wh-01",
    target_service: "Razorpay Payment Gateway Webhook",
    endpoint_url: "https://api.agribidshudh.com/api/v1/webhooks/razorpay",
    events: ["payment.captured", "payment.failed", "refund.processed"],
    secret_key_masked: "rzp_sec_••••••••••••92ab",
    is_active: true,
    failed_deliveries: 0,
    last_delivered_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: "wh-02",
    target_service: "ClearTax GSP IRN & e-Way DLR",
    endpoint_url: "https://api.agribidshudh.com/api/v1/webhooks/cleartax",
    events: ["irn.generated", "irn.cancelled", "eway.part_b_updated"],
    secret_key_masked: "ctx_sec_••••••••••••551e",
    is_active: true,
    failed_deliveries: 0,
    last_delivered_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "wh-03",
    target_service: "MSG91 SMS DLT Delivery Receipts",
    endpoint_url: "https://api.agribidshudh.com/api/v1/webhooks/msg91/dlr",
    events: ["sms.delivered", "sms.failed"],
    secret_key_masked: "msg_auth_••••••••••••77a1",
    is_active: true,
    failed_deliveries: 0,
    last_delivered_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
];

export function getIntegrationConnectorsMock(): IntegrationConnector[] {
  return mockConnectors;
}

export function getIntegrationLogsMock(filters?: {
  adapter?: string;
  status?: string;
  search?: string;
}): IntegrationLogEntry[] {
  let list = [...mockIntegrationLogs];
  if (filters?.adapter && filters.adapter !== "ALL") {
    list = list.filter((l) => l.adapter === filters.adapter);
  }
  if (filters?.status && filters.status !== "ALL") {
    list = list.filter((l) => l.status === filters.status);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (l) =>
        l.operation.toLowerCase().includes(s) ||
        l.vendor.toLowerCase().includes(s) ||
        l.ref_id?.toLowerCase().includes(s),
    );
  }
  return list;
}

export function testAdapterProbeMock(adapter: AdapterType): {
  success: boolean;
  latency_ms: number;
  message: string;
} {
  const conn = mockConnectors.find((c) => c.adapter === adapter);
  if (!conn) throw new Error(`Adapter ${adapter} not found`);

  const latency = Math.floor(Math.random() * 120) + 80;
  conn.last_sync_at = new Date().toISOString();
  conn.status = "HEALTHY";
  conn.circuit_breaker = "CLOSED";

  mockIntegrationLogs.unshift({
    id: `ilog-${Date.now()}`,
    adapter,
    vendor: conn.vendor,
    operation: `${adapter.toLowerCase()}.health_probe`,
    status: "SUCCESS",
    http_code: 200,
    latency_ms: latency,
    attempt: 1,
    circuit_breaker_status: "CLOSED",
    request_payload: { ping: true, timestamp: Date.now() },
    response_payload: { pong: true, status: "OK", echo_latency_ms: latency },
    created_at: new Date().toISOString(),
  });

  return {
    success: true,
    latency_ms: latency,
    message: `Probe successfully responded from ${conn.vendor} in ${latency}ms`,
  };
}

export function resetCircuitBreakerMock(adapter: AdapterType): IntegrationConnector {
  const conn = mockConnectors.find((c) => c.adapter === adapter);
  if (!conn) throw new Error(`Adapter ${adapter} not found`);

  conn.circuit_breaker = "CLOSED";
  conn.status = "HEALTHY";
  return conn;
}

export function getTallyJobsMock(): TallySyncJob[] {
  return mockTallyJobs;
}

export function triggerTallyExportMock(
  job_type: TallyJobType,
  export_format: "XML" | "JSON",
): TallySyncJob {
  const newJob: TallySyncJob = {
    id: `tjob-${Date.now()}`,
    job_type,
    status: "SUCCESS",
    records_synced: Math.floor(Math.random() * 30) + 15,
    export_format,
    started_at: new Date(Date.now() - 5000).toISOString(),
    completed_at: new Date().toISOString(),
    download_filename: `Tally_${job_type}_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.${export_format.toLowerCase()}`,
  };

  mockTallyJobs.unshift(newJob);

  // Also log the operation
  mockIntegrationLogs.unshift({
    id: `ilog-${Date.now()}`,
    adapter: "ErpConnector",
    vendor: "Tally Prime XML Sync",
    operation: `tally.export_${job_type.toLowerCase()}`,
    ref_type: "TALLY_JOB",
    ref_id: newJob.id,
    status: "SUCCESS",
    http_code: 200,
    latency_ms: 850,
    attempt: 1,
    circuit_breaker_status: "CLOSED",
    request_payload: { job_type, export_format },
    response_payload: { records: newJob.records_synced, file: newJob.download_filename },
    created_at: new Date().toISOString(),
  });

  return newJob;
}

export function getWebhookSubscriptionsMock(): WebhookSubscription[] {
  return mockWebhooks;
}

