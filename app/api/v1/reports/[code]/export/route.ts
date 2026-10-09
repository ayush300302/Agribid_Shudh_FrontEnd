import { NextResponse } from "next/server";
import { generateReportCsv } from "@/lib/mock-reports";
import type { ReportCode } from "@/types/report";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const reportCode = code.toUpperCase() as ReportCode;
    const csvContent = generateReportCsv(reportCode);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="agribid_${code.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "EXPORT_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}
