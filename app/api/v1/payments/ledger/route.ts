import { NextResponse } from "next/server";
import { listLedgerMock } from "@/lib/mock-payments";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partnerId") || undefined;
    const counterpartyId = searchParams.get("counterpartyId") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    const entries = listLedgerMock({ partnerId, counterpartyId, from, to });
    return NextResponse.json({
      success: true,
      data: entries,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to list ledger entries" },
      },
      { status: 500 },
    );
  }
}
