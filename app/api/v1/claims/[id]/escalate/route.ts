import { NextResponse } from "next/server";
import { escalateClaimMock } from "@/lib/mock-claims";
import type { EscalateClaimRequest } from "@/types/claim";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as EscalateClaimRequest;

    if (!body.reason || !body.reason.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BAD_REQUEST", message: "Escalation reason is required" },
        },
        { status: 400 },
      );
    }

    const updated = escalateClaimMock(id, body);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "ESCALATION_FAILED", message: err.message || "Failed to escalate claim" },
      },
      { status: 400 },
    );
  }
}
