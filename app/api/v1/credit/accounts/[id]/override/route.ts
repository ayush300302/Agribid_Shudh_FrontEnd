import { NextResponse } from "next/server";
import { overrideCreditMock } from "@/lib/mock-payments";
import type { CreditOverrideRequest } from "@/types/payment";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as CreditOverrideRequest;

    if (!body.override_until || !body.reason?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BAD_REQUEST", message: "override_until and reason are required for credit override" },
        },
        { status: 400 },
      );
    }

    const overridden = overrideCreditMock(id, body);
    return NextResponse.json({
      success: true,
      data: overridden,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "OVERRIDE_FAILED", message: err.message || "Failed to override credit" },
      },
      { status: 400 },
    );
  }
}
