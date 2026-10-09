/**
 * Module 14: Dashboards & Reports API Client
 */

import {
  generateReportCsv,
  MOCK_AGING_REPORT,
  MOCK_EXECUTIVE_KPIS,
  MOCK_FULFILMENT_PERF,
  MOCK_LEVEL_SALES,
  MOCK_PARTNER_RANKINGS,
  MOCK_SALES_SUMMARY,
  MOCK_STOCK_COVER,
} from "@/lib/mock-reports";
import type {
  AgingBucketItem,
  ExecutiveKpiSummary,
  FulfilmentPerformanceItem,
  LevelSalesItem,
  PartnerRankingItem,
  ReportCode,
  ReportFilterParams,
  SalesSummaryItem,
  StockCoverItem,
} from "@/types/report";

async function unwrapResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Report request failed");
  }
  return data.data ?? data;
}

export async function getExecutiveKpis(): Promise<ExecutiveKpiSummary> {
  try {
    const res = await fetch("/api/v1/dashboard/home");
    return await unwrapResponse<ExecutiveKpiSummary>(res);
  } catch {
    return MOCK_EXECUTIVE_KPIS;
  }
}

export async function getReportData(code: ReportCode, params?: ReportFilterParams): Promise<any> {
  try {
    const query = new URLSearchParams();
    if (params?.timeRange) query.set("timeRange", params.timeRange);
    if (params?.tier) query.set("tier", params.tier);
    if (params?.search) query.set("search", params.search);

    const res = await fetch(`/api/v1/reports/${code}?${query.toString()}`);
    return await unwrapResponse(res);
  } catch {
    switch (code) {
      case "SALES_SUMMARY":
        return MOCK_SALES_SUMMARY;
      case "LEVEL_SALES":
        return MOCK_LEVEL_SALES;
      case "OUTSTANDING_AGEING":
        return MOCK_AGING_REPORT;
      case "STOCK_COVER":
        return MOCK_STOCK_COVER;
      case "FULFILMENT":
        return MOCK_FULFILMENT_PERF;
      case "PARTNER_PERF":
        return MOCK_PARTNER_RANKINGS;
      default:
        return [];
    }
  }
}

export function downloadReportCsvClient(code: ReportCode) {
  const csvContent = generateReportCsv(code);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `agribid_${code.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
