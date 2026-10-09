import { NextResponse } from "next/server";
import { getActiveSessionsMock } from "@/lib/mock-admin-console";

export async function GET() {
  try {
    const data = getActiveSessionsMock();
    return NextResponse.json({
      success: true,
      data,
      total: data.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "SESSIONS_FETCH_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}

