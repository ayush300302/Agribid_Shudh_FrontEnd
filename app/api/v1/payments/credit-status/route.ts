import { NextResponse } from "next/server";
import { getCreditAccountMock } from "@/lib/mock-payments";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get("buyerId") || "p-002";
    const account = getCreditAccountMock(buyerId);

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Credit account not found" },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: account,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to get credit status" },
      },
      { status: 500 },
    );
  }
}
