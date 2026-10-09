import { NextResponse } from "next/server";
import { getFeatureFlagsMock, toggleFeatureFlagMock } from "@/lib/mock-admin-console";

export async function GET() {
  try {
    const data = getFeatureFlagsMock();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "FEATURE_FLAGS_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.key || typeof body?.enabled !== "boolean") {
      return NextResponse.json(
        { error: { code: "INVALID_FLAG_PAYLOAD", message: "Key and enabled state required" } },
        { status: 400 },
      );
    }

    const updated = toggleFeatureFlagMock(body.key, body.enabled);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "FLAG_UPDATE_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}

