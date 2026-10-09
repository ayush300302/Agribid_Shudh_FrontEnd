/**
 * Module 14: Dashboards & Reports (BI) Mock Store & Data Aggregator
 * Matches Dev Spec M14 and Section 13 of Agribid Shudh PRD
 */

import type {
  AgingBucketItem,
  CollectionItem,
  ExecutiveKpiSummary,
  FulfilmentPerformanceItem,
  LevelSalesItem,
  PartnerRankingItem,
  ReportCode,
  ReportFilterParams,
  SalesSummaryItem,
  StockCoverItem,
} from "@/types/report";

// 1. Executive BI Overview
export const MOCK_EXECUTIVE_KPIS: ExecutiveKpiSummary = {
  gross_merchandise_value: 38450000, // ₹3.84 Cr
  net_revenue_collected: 32180000,   // ₹3.21 Cr
  total_outstanding_debt: 6270000,   // ₹62.7 Lakh
  high_risk_overdue_debt: 840000,    // ₹8.4 Lakh (30+ days)
  total_orders_placed: 412,
  average_fill_rate_pct: 96.8,
  total_active_partners: 88,
  average_stock_cover_days: 14.2,
  updated_at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
};

// 2. Sales Summary (Daily Trend)
export const MOCK_SALES_SUMMARY: SalesSummaryItem[] = [
  {
    date: "2026-03-05",
    orders_count: 14,
    quantity_bags: 620,
    gross_sales: 2356000,
    discounts: 94240,
    taxable_amount: 2261760,
    gst_amount: 113088,
    net_invoiced_amount: 2374848,
    collections_received: 2100000,
  },
  {
    date: "2026-03-06",
    orders_count: 18,
    quantity_bags: 840,
    gross_sales: 3192000,
    discounts: 127680,
    taxable_amount: 3064320,
    gst_amount: 153216,
    net_invoiced_amount: 3217536,
    collections_received: 2850000,
  },
  {
    date: "2026-03-07",
    orders_count: 22,
    quantity_bags: 1100,
    gross_sales: 4180000,
    discounts: 167200,
    taxable_amount: 4012800,
    gst_amount: 200640,
    net_invoiced_amount: 4213440,
    collections_received: 3900000,
  },
  {
    date: "2026-03-08",
    orders_count: 16,
    quantity_bags: 750,
    gross_sales: 2850000,
    discounts: 114000,
    taxable_amount: 2736000,
    gst_amount: 136800,
    net_invoiced_amount: 2872800,
    collections_received: 2600000,
  },
  {
    date: "2026-03-09",
    orders_count: 25,
    quantity_bags: 1320,
    gross_sales: 5016000,
    discounts: 200640,
    taxable_amount: 4815360,
    gst_amount: 240768,
    net_invoiced_amount: 5056128,
    collections_received: 4400000,
  },
  {
    date: "2026-03-10",
    orders_count: 28,
    quantity_bags: 1450,
    gross_sales: 5510000,
    discounts: 220400,
    taxable_amount: 5289600,
    gst_amount: 264480,
    net_invoiced_amount: 5554080,
    collections_received: 5100000,
  },
];

// 3. Level Sales (Primary / Secondary / Tertiary)
export const MOCK_LEVEL_SALES: LevelSalesItem[] = [
  {
    level: "PRIMARY",
    seller_tier: "Manufacturer (Agribid Plant)",
    buyer_tier: "State Stockist (SS)",
    total_orders: 45,
    quantity_bags: 5800,
    taxable_amount: 20996000,
    gst_amount: 1049800,
    total_amount: 22045800,
    share_pct: 57.3,
  },
  {
    level: "SECONDARY",
    seller_tier: "State Stockist (SS)",
    buyer_tier: "Distributor (DS)",
    total_orders: 142,
    quantity_bags: 2950,
    taxable_amount: 10679000,
    gst_amount: 533950,
    total_amount: 11212950,
    share_pct: 29.2,
  },
  {
    level: "TERTIARY",
    seller_tier: "Distributor (DS)",
    buyer_tier: "Sub-Distributor / Retailer (SD/RT)",
    total_orders: 225,
    quantity_bags: 1380,
    taxable_amount: 4943800,
    gst_amount: 247190,
    total_amount: 5190990,
    share_pct: 13.5,
  },
];

// 4. Outstanding Aging Analysis (Rule PY-06 Debt Monitoring)
export const MOCK_AGING_REPORT: AgingBucketItem[] = [
  {
    partner_id: "p-001",
    partner_name: "MahaAgro State Stockist Pvt Ltd",
    partner_code: "AGB-SS-MH-0001",
    tier: "State Stockist",
    credit_limit: 2500000,
    total_outstanding: 980000,
    current_0_15_days: 850000,
    overdue_16_30_days: 130000,
    overdue_31_60_days: 0,
    overdue_60_plus_days: 0,
    status: "NORMAL",
  },
  {
    partner_id: "p-002",
    partner_name: "Sahyadri Krishi Kendra",
    partner_code: "AGB-DS-MH-0012",
    tier: "Distributor",
    credit_limit: 500000,
    total_outstanding: 210672,
    current_0_15_days: 210672,
    overdue_16_30_days: 0,
    overdue_31_60_days: 0,
    overdue_60_plus_days: 0,
    status: "NORMAL",
  },
  {
    partner_id: "p-003",
    partner_name: "Kisan Seva Krishi Kendra",
    partner_code: "AGB-SD-MH-0044",
    tier: "Sub-Distributor",
    credit_limit: 150000,
    total_outstanding: 185000,
    current_0_15_days: 45000,
    overdue_16_30_days: 60000,
    overdue_31_60_days: 50000,
    overdue_60_plus_days: 30000,
    status: "CREDIT_HOLD",
  },
  {
    partner_id: "p-004",
    partner_name: "Balaji Agro Agencies",
    partner_code: "AGB-DS-MH-0019",
    tier: "Distributor",
    credit_limit: 400000,
    total_outstanding: 310000,
    current_0_15_days: 190000,
    overdue_16_30_days: 120000,
    overdue_31_60_days: 0,
    overdue_60_plus_days: 0,
    status: "WATCHLIST",
  },
  {
    partner_id: "p-005",
    partner_name: "Krushiratna Fertilizer & Seeds",
    partner_code: "AGB-RT-MH-0105",
    tier: "Retailer",
    credit_limit: 100000,
    total_outstanding: 95000,
    current_0_15_days: 25000,
    overdue_16_30_days: 40000,
    overdue_31_60_days: 30000,
    overdue_60_plus_days: 0,
    status: "WATCHLIST",
  },
];

// 5. Stock Cover Days (Inventory Health)
export const MOCK_STOCK_COVER: StockCoverItem[] = [
  {
    sku: "RICE-BAS-PRM-50KG",
    product_name: "Shudh Premium 1121 Basmati Rice (50kg)",
    godown_name: "Bhosari Central Godown (Pune)",
    on_hand_bags: 1450,
    reserved_bags: 320,
    available_bags: 1130,
    daily_run_rate_bags: 95,
    stock_cover_days: 11.9,
    status: "OPTIMAL",
  },
  {
    sku: "WHEAT-SHRB-50KG",
    product_name: "Shudh Golden Sharbati Wheat (50kg)",
    godown_name: "Bhosari Central Godown (Pune)",
    on_hand_bags: 480,
    reserved_bags: 210,
    available_bags: 270,
    daily_run_rate_bags: 70,
    stock_cover_days: 3.8,
    status: "REORDER_TRIGGERED",
  },
  {
    sku: "OIL-MST-15L",
    product_name: "Shudh Kachi Ghani Mustard Oil Tin (15L)",
    godown_name: "Nashik Regional Godown",
    on_hand_bags: 80,
    reserved_bags: 65,
    available_bags: 15,
    daily_run_rate_bags: 25,
    stock_cover_days: 0.6,
    status: "CRITICAL_LOW",
  },
  {
    sku: "PULSE-TUR-50KG",
    product_name: "Shudh Premium Desi Toor Dal (50kg)",
    godown_name: "Nagpur Hub Warehouse",
    on_hand_bags: 1850,
    reserved_bags: 120,
    available_bags: 1730,
    daily_run_rate_bags: 45,
    stock_cover_days: 38.4,
    status: "EXCESS",
  },
];

// 6. Fulfilment Performance
export const MOCK_FULFILMENT_PERF: FulfilmentPerformanceItem[] = [
  {
    order_number: "ORD-2609-000101",
    partner_name: "Sahyadri Krishi Kendra",
    source: "SELF",
    ordered_qty: 55,
    fulfilled_qty: 55,
    fill_rate_pct: 100,
    sla_hours_limit: 24,
    actual_dispatch_hours: 8.5,
    sla_breached: false,
  },
  {
    order_number: "ORD-2609-000102",
    partner_name: "Kisan Seva Krishi Kendra",
    source: "ASSISTED",
    ordered_qty: 40,
    fulfilled_qty: 36,
    fill_rate_pct: 90,
    sla_hours_limit: 24,
    actual_dispatch_hours: 18.0,
    sla_breached: false,
  },
  {
    order_number: "ORD-2609-000103",
    partner_name: "Balaji Agro Agencies",
    source: "SELF",
    ordered_qty: 80,
    fulfilled_qty: 60,
    fill_rate_pct: 75,
    sla_hours_limit: 24,
    actual_dispatch_hours: 29.5,
    sla_breached: true,
  },
];

// 7. Partner Performance Rankings
export const MOCK_PARTNER_RANKINGS: PartnerRankingItem[] = [
  {
    rank: 1,
    partner_id: "p-001",
    partner_name: "MahaAgro State Stockist Pvt Ltd",
    tier: "State Stockist",
    district: "Pune",
    orders_count: 145,
    total_gmv: 22045800,
    on_time_payment_pct: 98.5,
  },
  {
    rank: 2,
    partner_id: "p-002",
    partner_name: "Sahyadri Krishi Kendra",
    tier: "Distributor",
    district: "Nashik",
    orders_count: 52,
    total_gmv: 4890000,
    on_time_payment_pct: 100.0,
  },
  {
    rank: 3,
    partner_id: "p-004",
    partner_name: "Balaji Agro Agencies",
    tier: "Distributor",
    district: "Solapur",
    orders_count: 38,
    total_gmv: 3450000,
    on_time_payment_pct: 92.0,
  },
  {
    rank: 4,
    partner_id: "p-003",
    partner_name: "Kisan Seva Krishi Kendra",
    tier: "Sub-Distributor",
    district: "Ahmednagar",
    orders_count: 24,
    total_gmv: 1850000,
    on_time_payment_pct: 68.0,
  },
];

// Helper to generate CSV export string
export function generateReportCsv(code: ReportCode): string {
  switch (code) {
    case "SALES_SUMMARY":
      return (
        "Date,Orders Count,Qty (Bags),Gross Sales (INR),Discounts (INR),Taxable Amount (INR),GST (INR),Net Invoiced (INR),Collections (INR)\n" +
        MOCK_SALES_SUMMARY.map(
          (r) =>
            `${r.date},${r.orders_count},${r.quantity_bags},${r.gross_sales},${r.discounts},${r.taxable_amount},${r.gst_amount},${r.net_invoiced_amount},${r.collections_received}`,
        ).join("\n")
      );

    case "LEVEL_SALES":
      return (
        "Level,Seller Tier,Buyer Tier,Total Orders,Quantity (Bags),Taxable Amount (INR),GST (INR),Total GMV (INR),Share (%)\n" +
        MOCK_LEVEL_SALES.map(
          (r) =>
            `"${r.level}","${r.seller_tier}","${r.buyer_tier}",${r.total_orders},${r.quantity_bags},${r.taxable_amount},${r.gst_amount},${r.total_amount},${r.share_pct}%`,
        ).join("\n")
      );

    case "OUTSTANDING_AGEING":
      return (
        "Partner Name,Partner Code,Tier,Credit Limit,Total Outstanding,0-15 Days (Current),16-30 Days,31-60 Days,60+ Days,Status\n" +
        MOCK_AGING_REPORT.map(
          (r) =>
            `"${r.partner_name}","${r.partner_code}","${r.tier}",${r.credit_limit},${r.total_outstanding},${r.current_0_15_days},${r.overdue_16_30_days},${r.overdue_31_60_days},${r.overdue_60_plus_days},${r.status}`,
        ).join("\n")
      );

    case "STOCK_COVER":
      return (
        "SKU,Product Name,Godown,On Hand,Reserved,Available,Daily Run Rate,Cover Days,Status\n" +
        MOCK_STOCK_COVER.map(
          (r) =>
            `"${r.sku}","${r.product_name}","${r.godown_name}",${r.on_hand_bags},${r.reserved_bags},${r.available_bags},${r.daily_run_rate_bags},${r.stock_cover_days},${r.status}`,
        ).join("\n")
      );

    default:
      return "Report,Generated\nDefault,Success\n";
  }
}
