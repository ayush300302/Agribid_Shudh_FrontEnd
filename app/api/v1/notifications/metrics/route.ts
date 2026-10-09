import { NextResponse } from "next/server";
import { getNotificationMetricsMock } from "@/lib/mock-notifications";

export async function GET() {
  try {
    const metrics = getNotificationMetricsMock();
    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "METRICS_FETCH_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}
