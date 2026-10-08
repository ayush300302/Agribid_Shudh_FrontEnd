import { NextResponse } from "next/server";
import { reversePaymentMock } from "@/lib/mock-payments";
import type { ReversePaymentRequest } from "@/types/payment";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as ReversePaymentRequest;

    if (!body.reason || !body.reason.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "REASON_REQUIRED", message: "Mandatory justification reason is required for payment reversal (Rule PY-05)" },
        },
        { status: 400 },
      );
    }

    const reversed = reversePaymentMock(id, body);
    return NextResponse.json({
      success: true,
      data: reversed,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "REVERSAL_FAILED", message: err.message || "Failed to reverse payment" },
      },
      { status: 400 },
    );
  }
}
