import { NextResponse } from "next/server";
import { MOCK_EXECUTIVE_KPIS } from "@/lib/mock-reports";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: MOCK_EXECUTIVE_KPIS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "DASHBOARD_KPI_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}
