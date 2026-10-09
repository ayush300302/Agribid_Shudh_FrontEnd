import { NextResponse } from "next/server";
import { getConfigParamsMock, updateConfigParamMock } from "@/lib/mock-audit-support";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const data = getConfigParamsMock(category);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "CONFIG_FETCH_FAILED", message: error.message || "Failed to fetch configurations" } },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { key, value, changedBy, reason } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: { code: "INVALID_PAYLOAD", message: "Key and value are required" } },
        { status: 400 },
      );
    }

    const updated = updateConfigParamMock(key, value, changedBy || "Admin", reason || "");
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "CONFIG_UPDATE_FAILED", message: error.message || "Failed to update configuration" } },
      { status: 500 },
    );
  }
}
