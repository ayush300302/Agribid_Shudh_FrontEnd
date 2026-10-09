import { NextResponse } from "next/server";
import { getIntegrationLogsMock } from "@/lib/mock-integrations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adapter = searchParams.get("adapter") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const data = getIntegrationLogsMock({ adapter, status, search });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "LOGS_FETCH_FAILED", message: error.message || "Failed to fetch integration logs" } },
      { status: 500 },
    );
  }
}
