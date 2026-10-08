import { NextResponse } from "next/server";
import { decideClaimMock } from "@/lib/mock-claims";
import type { DecideClaimRequest } from "@/types/claim";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as DecideClaimRequest;

    if (!body.action || !body.note?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BAD_REQUEST", message: "Action and decision note are required" },
        },
        { status: 400 },
      );
    }

    const updated = decideClaimMock(id, body);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "DECISION_FAILED", message: err.message || "Failed to process claim decision" },
      },
      { status: 400 },
    );
  }
}
