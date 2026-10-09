import { NextResponse } from "next/server";
import { getSystemHealthMock } from "@/lib/mock-admin-console";

export async function GET() {
  try {
    const data = getSystemHealthMock();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "SYSTEM_HEALTH_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}
