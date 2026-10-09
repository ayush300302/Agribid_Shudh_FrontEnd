"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Filter,
  IndianRupee,
  Layers,
  PieChart,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import {
  downloadReportCsvClient,
  getExecutiveKpis,
  getReportData,
} from "@/lib/report-api";
import type {
  AgingBucketItem,
  FulfilmentPerformanceItem,
  LevelSalesItem,
  PartnerRankingItem,
  ReportCode,
  SalesSummaryItem,
  StockCoverItem,
} from "@/types/report";

export default function ReportsConsolePage() {
  const [selectedReport, setSelectedReport] = useState<ReportCode>("SALES_SUMMARY");
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "THIS_MONTH" | "FY26_27">("THIS_MONTH");
  const [searchQuery, setSearchQuery] = useState("");

  // Executive KPIs
  const { data: kpis } = useQuery({
    queryKey: ["executive-kpis"],
    queryFn: () => getExecutiveKpis(),
  });

  // Report Data
  const { data: reportData = [], isLoading } = useQuery({
    queryKey: ["report-data", selectedReport, timeRange],
    queryFn: () => getReportData(selectedReport, { timeRange }),
  });

  const handleExport = () => {
    downloadReportCsvClient(selectedReport);
  };

  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "distributor"]}>
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <BarChart3 size={20} />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                  Reports & Business Intelligence
                </h1>
              </div>
              <p className="mt-0.5 text-xs text-[#64766a]">
                Multi-tier distribution analytics, 3-level sales volume, debtor aging buckets, and stock cover days.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] transition-colors"
              >
                <Download size={14} /> Export Report (CSV)
              </button>
            </div>
          </div>

          {/* 1. Executive KPI Metrics Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {/* GMV */}
            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase">
                Gross GMV
              </span>
              <p className="mt-1 text-2xl font-black text-[#19392a]">
                ₹{((kpis?.gross_merchandise_value || 38450000) / 10000000).toFixed(2)} Cr
              </p>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                <ArrowUpRight size={12} /> +18.4% vs last month
              </div>
            </div>

            {/* Net Collections */}
            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase">
                Net Collections
              </span>
              <p className="mt-1 text-2xl font-black text-[#1b5e20]">
                ₹{((kpis?.net_revenue_collected || 32180000) / 10000000).toFixed(2)} Cr
              </p>
              <span className="text-[10px] text-[#64766a]">83.7% collection velocity</span>
            </div>

            {/* Total Outstanding */}
            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase">
                Total Outstanding
              </span>
              <p className="mt-1 text-2xl font-black text-[#19392a]">
                ₹{((kpis?.total_outstanding_debt || 6270000) / 100000).toFixed(1)} Lakh
              </p>
              <span className="text-[10px] text-amber-700 font-semibold">
                ₹{((kpis?.high_risk_overdue_debt || 840000) / 100000).toFixed(1)}L overdue &gt;30d
              </span>
            </div>

            {/* Fill Rate */}
            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase">
                Order Fill Rate
              </span>
              <p className="mt-1 text-2xl font-black text-emerald-700">
                {kpis?.average_fill_rate_pct ?? 96.8}%
              </p>
              <span className="text-[10px] text-emerald-700 font-medium">98.2% on-time dispatch</span>
            </div>

            {/* Stock Cover */}
            <div className="col-span-2 sm:col-span-1 rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-[#87958b] uppercase">
                Avg Stock Cover
              </span>
              <p className="mt-1 text-2xl font-black text-[#19392a]">
                {kpis?.average_stock_cover_days ?? 14.2} Days
              </p>
              <span className="text-[10px] text-[#64766a]">Godown buffer health</span>
            </div>
          </div>

          {/* 2. Visual Analytics Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: 6-Day GMV vs Collections Daily Trend */}
            <div className="lg:col-span-2 rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#1b5e20]" />
                  <h3 className="text-sm font-bold text-[#19392a]">
                    Daily GMV vs Realized Collections (₹ Lakhs)
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-[#87958b] uppercase">
                  Daily OLTP Sync
                </span>
              </div>

              {/* Chart Bar Visualization */}
              <div className="grid grid-cols-6 gap-2 pt-4 items-end h-44">
                {[
                  { day: "05 Mar", gmv: 23.7, col: 21.0 },
                  { day: "06 Mar", gmv: 32.2, col: 28.5 },
                  { day: "07 Mar", gmv: 42.1, col: 39.0 },
                  { day: "08 Mar", gmv: 28.7, col: 26.0 },
                  { day: "09 Mar", gmv: 50.5, col: 44.0 },
                  { day: "10 Mar", gmv: 55.5, col: 51.0 },
                ].map((item) => (
                  <div key={item.day} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="flex items-end gap-1 w-full justify-center h-32">
                      {/* GMV Bar */}
                      <div
                        className="w-3.5 bg-[#1b5e20] rounded-t-sm transition-all hover:opacity-80"
                        style={{ height: `${(item.gmv / 60) * 100}%` }}
                        title={`GMV: ₹${item.gmv}L`}
                      />
                      {/* Collections Bar */}
                      <div
                        className="w-3.5 bg-emerald-300 rounded-t-sm transition-all hover:opacity-80"
                        style={{ height: `${(item.col / 60) * 100}%` }}
                        title={`Collections: ₹${item.col}L`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#64766a]">{item.day}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-6 pt-2 border-t border-[#eef2ef] text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-xs bg-[#1b5e20]" />
                  <span className="font-semibold text-[#19392a]">Invoiced GMV</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-xs bg-emerald-300" />
                  <span className="font-semibold text-[#19392a]">Realized Collections</span>
                </div>
              </div>
            </div>

            {/* Right 1 Col: 3-Tier Distribution Share */}
            <div className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#eef2ef] pb-3">
                <div className="flex items-center gap-2">
                  <PieChart size={16} className="text-[#1b5e20]" />
                  <h3 className="text-sm font-bold text-[#19392a]">Sales Level Breakdown</h3>
                </div>
                <span className="text-[10px] font-bold text-[#1b5e20] bg-emerald-50 px-2 py-0.5 rounded">
                  3-Tier
                </span>
              </div>

              <div className="space-y-4 text-xs pt-1">
                {/* Primary */}
                <div>
                  <div className="flex justify-between font-semibold text-[#19392a]">
                    <span>Primary (Plant → State Stockist)</span>
                    <span>57.3% (₹2.20 Cr)</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-[#1b5e20] rounded-full" style={{ width: "57.3%" }} />
                  </div>
                </div>

                {/* Secondary */}
                <div>
                  <div className="flex justify-between font-semibold text-[#19392a]">
                    <span>Secondary (Stockist → Distributor)</span>
                    <span>29.2% (₹1.12 Cr)</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "29.2%" }} />
                  </div>
                </div>

                {/* Tertiary */}
                <div>
                  <div className="flex justify-between font-semibold text-[#19392a]">
                    <span>Tertiary (Distributor → Retailer)</span>
                    <span>13.5% (₹51.9 Lakh)</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: "13.5%" }} />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#87958b] pt-2 border-t border-[#eef2ef] leading-relaxed">
                Primary dispatches drive bulk warehousing; Tertiary sales track village kirana consumption.
              </p>
            </div>
          </div>

          {/* 3. Report Category Tabs & Filters */}
          <div className="space-y-3 rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-[#eef2ef] pb-3">
              {[
                { code: "SALES_SUMMARY", label: "Sales Summary" },
                { code: "LEVEL_SALES", label: "3-Tier Level Sales" },
                { code: "OUTSTANDING_AGEING", label: "Debtor Aging (0-60d+)" },
                { code: "STOCK_COVER", label: "Stock Cover Days" },
                { code: "FULFILMENT", label: "Fulfilment & SLA" },
                { code: "PARTNER_PERF", label: "Partner GMV Rankings" },
              ].map((tab) => (
                <button
                  key={tab.code}
                  type="button"
                  onClick={() => setSelectedReport(tab.code as ReportCode)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selectedReport === tab.code
                      ? "bg-[#1b5e20] text-white shadow-xs"
                      : "bg-[#f1f5f1] text-[#64766a] hover:bg-[#e4ece5]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Time range & Search */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#87958b] mr-1 flex items-center gap-1">
                  <Calendar size={13} /> Period:
                </span>
                {(["7D", "30D", "THIS_MONTH", "FY26_27"] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTimeRange(range)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      timeRange === range
                        ? "bg-[#19392a] text-white"
                        : "bg-[#f8faf8] border border-[#dce5dd] text-[#64766a] hover:bg-[#eef2ef]"
                    }`}
                  >
                    {range === "7D"
                      ? "Last 7 Days"
                      : range === "30D"
                      ? "Last 30 Days"
                      : range === "THIS_MONTH"
                      ? "This Month"
                      : "FY 2026-27"}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search size={14} className="absolute left-2.5 top-2.5 text-[#87958b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter rows..."
                  className="w-full rounded-md border border-[#dce5dd] pl-8 pr-3 py-1.5 text-xs text-[#19392a] placeholder-[#87958b] focus:outline-none focus:ring-1 focus:ring-[#1b5e20]"
                />
              </div>
            </div>
          </div>

          {/* 4. Tabular Report View */}
          <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
            <div className="overflow-x-auto">
              {/* Case 1: SALES_SUMMARY */}
              {selectedReport === "SALES_SUMMARY" && (
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#19392a]">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-3 py-3 text-center">Orders</th>
                      <th className="px-3 py-3 text-center">Qty (Bags)</th>
                      <th className="px-4 py-3 text-right">Gross Sales (₹)</th>
                      <th className="px-4 py-3 text-right">Discount (₹)</th>
                      <th className="px-4 py-3 text-right">Taxable Amt (₹)</th>
                      <th className="px-3 py-3 text-right">GST (₹)</th>
                      <th className="px-4 py-3 text-right">Net Invoiced (₹)</th>
                      <th className="px-4 py-3 text-right">Collections (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2ef]">
                    {(reportData as SalesSummaryItem[]).map((row) => (
                      <tr key={row.date} className="hover:bg-[#fafbfa]">
                        <td className="px-4 py-3 font-semibold text-[#19392a]">{row.date}</td>
                        <td className="px-3 py-3 text-center font-bold">{row.orders_count}</td>
                        <td className="px-3 py-3 text-center">{row.quantity_bags.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right font-medium">₹{row.gross_sales.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right text-red-600">-₹{row.discounts.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right">₹{row.taxable_amount.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-3 text-right text-[#64766a]">₹{row.gst_amount.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right font-bold text-[#19392a]">₹{row.net_invoiced_amount.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right font-bold text-[#1b5e20]">₹{row.collections_received.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Case 2: LEVEL_SALES */}
              {selectedReport === "LEVEL_SALES" && (
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#19392a]">
                    <tr>
                      <th className="px-4 py-3">Distribution Tier Level</th>
                      <th className="px-4 py-3">Seller Entity</th>
                      <th className="px-4 py-3">Buyer Entity</th>
                      <th className="px-3 py-3 text-center">Orders</th>
                      <th className="px-3 py-3 text-center">Volume (Bags)</th>
                      <th className="px-4 py-3 text-right">Taxable Amt (₹)</th>
                      <th className="px-4 py-3 text-right">Total GMV (₹)</th>
                      <th className="px-4 py-3 text-right">Revenue Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2ef]">
                    {(reportData as LevelSalesItem[]).map((row) => (
                      <tr key={row.level} className="hover:bg-[#fafbfa]">
                        <td className="px-4 py-3 font-bold text-[#1b5e20]">
                          <span className="rounded bg-[#1b5e20]/10 px-2 py-0.5">{row.level}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-[#19392a]">{row.seller_tier}</td>
                        <td className="px-4 py-3 text-[#64766a]">{row.buyer_tier}</td>
                        <td className="px-3 py-3 text-center font-semibold">{row.total_orders}</td>
                        <td className="px-3 py-3 text-center font-bold">{row.quantity_bags.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right">₹{row.taxable_amount.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right font-extrabold text-[#19392a]">₹{row.total_amount.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right font-black text-emerald-700">{row.share_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Case 3: OUTSTANDING_AGEING */}
              {selectedReport === "OUTSTANDING_AGEING" && (
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#19392a]">
                    <tr>
                      <th className="px-4 py-3">Partner Entity</th>
                      <th className="px-3 py-3">Tier</th>
                      <th className="px-3 py-3 text-right">Credit Limit (₹)</th>
                      <th className="px-4 py-3 text-right">Total Debt (₹)</th>
                      <th className="px-3 py-3 text-right text-emerald-800">0-15d (Current)</th>
                      <th className="px-3 py-3 text-right text-amber-700">16-30d Overdue</th>
                      <th className="px-3 py-3 text-right text-orange-700">31-60d Overdue</th>
                      <th className="px-3 py-3 text-right text-red-700">60d+ Overdue</th>
                      <th className="px-4 py-3 text-center">Rule PY-06 Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2ef]">
                    {(reportData as AgingBucketItem[]).map((row) => (
                      <tr key={row.partner_id} className="hover:bg-[#fafbfa]">
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#19392a]">{row.partner_name}</p>
                          <p className="font-mono text-[10px] text-[#87958b]">{row.partner_code}</p>
                        </td>
                        <td className="px-3 py-3 text-[#64766a]">{row.tier}</td>
                        <td className="px-3 py-3 text-right">₹{row.credit_limit.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right font-black text-[#19392a]">₹{row.total_outstanding.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-3 text-right text-emerald-700 font-semibold">₹{row.current_0_15_days.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-3 text-right text-amber-700 font-semibold">₹{row.overdue_16_30_days.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-3 text-right text-orange-700 font-bold">₹{row.overdue_31_60_days.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-3 text-right text-red-700 font-extrabold">₹{row.overdue_60_plus_days.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              row.status === "NORMAL"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : row.status === "WATCHLIST"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Case 4: STOCK_COVER */}
              {selectedReport === "STOCK_COVER" && (
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#19392a]">
                    <tr>
                      <th className="px-4 py-3">Commodity SKU</th>
                      <th className="px-4 py-3">Godown Warehouse</th>
                      <th className="px-3 py-3 text-center">On-Hand Bags</th>
                      <th className="px-3 py-3 text-center">Reserved Bags</th>
                      <th className="px-3 py-3 text-center font-bold">Available Bags</th>
                      <th className="px-3 py-3 text-center">Daily Burn (Bags/Day)</th>
                      <th className="px-4 py-3 text-center font-bold">Cover Days</th>
                      <th className="px-4 py-3 text-center">Buffer Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2ef]">
                    {(reportData as StockCoverItem[]).map((row) => (
                      <tr key={row.sku} className="hover:bg-[#fafbfa]">
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#19392a]">{row.product_name}</p>
                          <p className="font-mono text-[10px] text-[#87958b]">{row.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-[#64766a]">{row.godown_name}</td>
                        <td className="px-3 py-3 text-center">{row.on_hand_bags}</td>
                        <td className="px-3 py-3 text-center text-amber-700 font-medium">{row.reserved_bags}</td>
                        <td className="px-3 py-3 text-center font-extrabold text-[#19392a]">{row.available_bags}</td>
                        <td className="px-3 py-3 text-center">{row.daily_run_rate_bags}</td>
                        <td className="px-4 py-3 text-center font-black text-base text-[#1b5e20]">{row.stock_cover_days}d</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              row.status === "OPTIMAL"
                                ? "bg-emerald-50 text-emerald-700"
                                : row.status === "REORDER_TRIGGERED"
                                ? "bg-amber-50 text-amber-700"
                                : row.status === "CRITICAL_LOW"
                                ? "bg-red-50 text-red-700 animate-pulse"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Case 5: FULFILMENT */}
              {selectedReport === "FULFILMENT" && (
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#19392a]">
                    <tr>
                      <th className="px-4 py-3">PO Reference</th>
                      <th className="px-4 py-3">Buyer Partner</th>
                      <th className="px-3 py-3 text-center">Source</th>
                      <th className="px-3 py-3 text-center">Ordered</th>
                      <th className="px-3 py-3 text-center">Fulfilled</th>
                      <th className="px-3 py-3 text-center font-bold">Fill Rate (%)</th>
                      <th className="px-3 py-3 text-center">SLA Limit</th>
                      <th className="px-3 py-3 text-center">Actual Dispatch</th>
                      <th className="px-4 py-3 text-center">SLA Adherence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2ef]">
                    {(reportData as FulfilmentPerformanceItem[]).map((row) => (
                      <tr key={row.order_number} className="hover:bg-[#fafbfa]">
                        <td className="px-4 py-3 font-mono font-bold text-[#1b5e20]">{row.order_number}</td>
                        <td className="px-4 py-3 font-medium text-[#19392a]">{row.partner_name}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="rounded bg-[#f1f5f1] px-1.5 py-0.5 font-bold text-[10px]">
                            {row.source}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">{row.ordered_qty}</td>
                        <td className="px-3 py-3 text-center">{row.fulfilled_qty}</td>
                        <td className="px-3 py-3 text-center font-extrabold text-[#19392a]">{row.fill_rate_pct}%</td>
                        <td className="px-3 py-3 text-center text-[#87958b]">{row.sla_hours_limit}h</td>
                        <td className="px-3 py-3 text-center font-semibold">{row.actual_dispatch_hours}h</td>
                        <td className="px-4 py-3 text-center">
                          {row.sla_breached ? (
                            <span className="rounded-full bg-red-50 text-red-700 px-2 py-0.5 font-bold text-[10px] border border-red-200">
                              BREACHED
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 font-bold text-[10px] border border-emerald-200">
                              ON-TIME
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Case 6: PARTNER_PERF */}
              {selectedReport === "PARTNER_PERF" && (
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#19392a]">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">Rank</th>
                      <th className="px-4 py-3">Partner Entity</th>
                      <th className="px-3 py-3">Tier</th>
                      <th className="px-3 py-3">District</th>
                      <th className="px-3 py-3 text-center">Orders Count</th>
                      <th className="px-4 py-3 text-right font-bold">Total GMV (₹)</th>
                      <th className="px-4 py-3 text-right font-bold">On-Time Pay %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2ef]">
                    {(reportData as PartnerRankingItem[]).map((row) => (
                      <tr key={row.partner_id} className="hover:bg-[#fafbfa]">
                        <td className="px-4 py-3 text-center font-black text-sm text-[#1b5e20]">#{row.rank}</td>
                        <td className="px-4 py-3 font-bold text-[#19392a]">{row.partner_name}</td>
                        <td className="px-3 py-3 text-[#64766a]">{row.tier}</td>
                        <td className="px-3 py-3 text-[#19392a]">{row.district}</td>
                        <td className="px-3 py-3 text-center font-semibold">{row.orders_count}</td>
                        <td className="px-4 py-3 text-right font-black text-[#19392a]">₹{row.total_gmv.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right font-black text-emerald-700">{row.on_time_payment_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </AdminShell>
    </RoleGuard>
  );
}
