import { NextResponse } from "next/server";
import { listCreditAccountsMock } from "@/lib/mock-payments";

export async function GET() {
  try {
    const accounts = listCreditAccountsMock();
    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to list credit accounts" },
      },
      { status: 500 },
    );
  }
}
