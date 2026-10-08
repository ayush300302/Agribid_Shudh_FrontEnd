import { NextResponse } from "next/server";
import { getCashReconciliationMock } from "@/lib/mock-payments";

export async function GET() {
  try {
    const data = getCashReconciliationMock();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to get cash reconciliation" },
      },
      { status: 500 },
    );
  }
}
