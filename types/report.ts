/**
 * Module 14: Dashboards & Reports (BI) Types
 * Matches Dev Spec M14 and Section 13 of Agribid Shudh PRD
 */

export type ReportCode =
  | "SALES_SUMMARY"
  | "LEVEL_SALES"
  | "OUTSTANDING_AGEING"
  | "COLLECTIONS"
  | "STOCK_COVER"
  | "FULFILMENT"
  | "SCHEME_PERF"
  | "PARTNER_PERF"
  | "EXCEPTIONS";

export type SalesLevel = "PRIMARY" | "SECONDARY" | "TERTIARY";

export interface SalesSummaryItem {
  date: string;
  orders_count: number;
  quantity_bags: number;
  gross_sales: number;
  discounts: number;
  taxable_amount: number;
  gst_amount: number;
  net_invoiced_amount: number;
  collections_received: number;
}

export interface LevelSalesItem {
  level: SalesLevel;
  seller_tier: string;
  buyer_tier: string;
  total_orders: number;
  quantity_bags: number;
  taxable_amount: number;
  gst_amount: number;
  total_amount: number;
  share_pct: number;
}

export interface AgingBucketItem {
  partner_id: string;
  partner_name: string;
  partner_code: string;
  tier: string;
  credit_limit: number;
  total_outstanding: number;
  current_0_15_days: number;
  overdue_16_30_days: number;
  overdue_31_60_days: number;
  overdue_60_plus_days: number;
  status: "NORMAL" | "WATCHLIST" | "CREDIT_HOLD";
}

export interface CollectionItem {
  date: string;
  total_amount: number;
  neft_rtgs_amount: number;
  upi_amount: number;
  cheque_amount: number;
  cash_amount: number;
  avg_days_to_pay: number;
}

export interface StockCoverItem {
  sku: string;
  product_name: string;
  godown_name: string;
  on_hand_bags: number;
  reserved_bags: number;
  available_bags: number;
  daily_run_rate_bags: number;
  stock_cover_days: number;
  status: "OPTIMAL" | "REORDER_TRIGGERED" | "CRITICAL_LOW" | "EXCESS";
}

export interface FulfilmentPerformanceItem {
  order_number: string;
  partner_name: string;
  source: "SELF" | "ASSISTED";
  ordered_qty: number;
  fulfilled_qty: number;
  fill_rate_pct: number;
  sla_hours_limit: number;
  actual_dispatch_hours: number;
  sla_breached: boolean;
}

export interface PartnerRankingItem {
  rank: number;
  partner_id: string;
  partner_name: string;
  tier: string;
  district: string;
  orders_count: number;
  total_gmv: number;
  on_time_payment_pct: number;
}

export interface ReportFilterParams {
  from?: string;
  to?: string;
  timeRange?: "7D" | "30D" | "THIS_MONTH" | "FY26_27" | "CUSTOM";
  tier?: string;
  state?: string;
  search?: string;
}

export interface ExecutiveKpiSummary {
  gross_merchandise_value: number;
  net_revenue_collected: number;
  total_outstanding_debt: number;
  high_risk_overdue_debt: number;
  total_orders_placed: number;
  average_fill_rate_pct: number;
  total_active_partners: number;
  average_stock_cover_days: number;
  updated_at: string;
}
