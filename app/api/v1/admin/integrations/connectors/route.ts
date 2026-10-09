import { NextResponse } from "next/server";
import { getIntegrationConnectorsMock } from "@/lib/mock-integrations";

export async function GET() {
  try {
    const data = getIntegrationConnectorsMock();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "CONNECTORS_FETCH_FAILED", message: error.message || "Failed to fetch connectors" } },
      { status: 500 },
    );
  }
}
