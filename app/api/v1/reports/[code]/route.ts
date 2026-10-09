import { NextResponse } from "next/server";
import {
  MOCK_AGING_REPORT,
  MOCK_FULFILMENT_PERF,
  MOCK_LEVEL_SALES,
  MOCK_PARTNER_RANKINGS,
  MOCK_SALES_SUMMARY,
  MOCK_STOCK_COVER,
} from "@/lib/mock-reports";
import type { ReportCode } from "@/types/report";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const reportCode = code.toUpperCase() as ReportCode;

    let data: any = [];
    switch (reportCode) {
      case "SALES_SUMMARY":
        data = MOCK_SALES_SUMMARY;
        break;
      case "LEVEL_SALES":
        data = MOCK_LEVEL_SALES;
        break;
      case "OUTSTANDING_AGEING":
        data = MOCK_AGING_REPORT;
        break;
      case "STOCK_COVER":
        data = MOCK_STOCK_COVER;
        break;
      case "FULFILMENT":
        data = MOCK_FULFILMENT_PERF;
        break;
      case "PARTNER_PERF":
        data = MOCK_PARTNER_RANKINGS;
        break;
      default:
        data = [];
    }

    return NextResponse.json({
      success: true,
      report_code: reportCode,
      data,
      total: Array.isArray(data) ? data.length : 1,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "REPORT_FETCH_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}
