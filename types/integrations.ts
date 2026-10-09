/**
 * Module 17: Integrations Hub Types
 * Matches Dev Spec M17 and Section 10.8 ADM-19..24 of Agribid Shudh PRD
 */

export type AdapterType =
  | "SmsProvider"
  | "PushProvider"
  | "MapsProvider"
  | "StorageProvider"
  | "KycVerifier"
  | "PaymentGateway"
  | "GspProvider"
  | "WhatsAppProvider"
  | "ErpConnector";

export type ConnectorStatus = "HEALTHY" | "DEGRADED" | "DOWN" | "DISABLED";
export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface IntegrationConnector {
  id: string;
  adapter: AdapterType;
  name: string;
  vendor: string;
  direction: "OUT" | "IN_OUT";
  env: "SANDBOX" | "PRODUCTION";
  status: ConnectorStatus;
  uptime_pct: number;
  circuit_breaker: CircuitBreakerState;
  avg_latency_ms: number;
  total_calls_24h: number;
  failed_calls_24h: number;
  last_sync_at: string;
  description: string;
}

export type IntegrationLogStatus = "SUCCESS" | "FAILURE" | "CIRCUIT_BROKEN";

export interface IntegrationLogEntry {
  id: string;
  adapter: AdapterType;
  vendor: string;
  operation: string;
  ref_type?: string;
  ref_id?: string;
  status: IntegrationLogStatus;
  http_code: number;
  latency_ms: number;
  attempt: number;
  circuit_breaker_status: CircuitBreakerState;
  request_payload: Record<string, any>;
  response_payload: Record<string, any>;
  created_at: string;
}

export type TallyJobType =
  | "SALES_VOUCHERS"
  | "PURCHASE_RECEIPTS"
  | "LEDGER_BALANCES"
  | "STOCK_JOURNAL";

export type TallyJobStatus = "SUCCESS" | "PENDING" | "RUNNING" | "FAILED";

export interface TallySyncJob {
  id: string;
  job_type: TallyJobType;
  status: TallyJobStatus;
  records_synced: number;
  export_format: "XML" | "JSON";
  started_at: string;
  completed_at: string;
  download_filename: string;
}

export interface WebhookSubscription {
  id: string;
  target_service: string;
  endpoint_url: string;
  events: string[];
  secret_key_masked: string;
  is_active: boolean;
  failed_deliveries: number;
  last_delivered_at?: string;
}

export interface ProbeTestPayload {
  adapter: AdapterType;
}

export interface TriggerTallyExportPayload {
  job_type: TallyJobType;
  export_format: "XML" | "JSON";
}

