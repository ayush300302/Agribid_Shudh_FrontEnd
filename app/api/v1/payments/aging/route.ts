import { NextResponse } from "next/server";
import { getAgingReportMock } from "@/lib/mock-payments";

export async function GET() {
  try {
    const report = getAgingReportMock();
    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to get aging report" },
      },
      { status: 500 },
    );
  }
}
