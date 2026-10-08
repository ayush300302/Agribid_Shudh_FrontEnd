import { NextResponse } from "next/server";
import { raiseClaimMock } from "@/lib/mock-claims";
import type { RaiseClaimRequest } from "@/types/claim";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as RaiseClaimRequest;

    if (!body.type || !body.lines || body.lines.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BAD_REQUEST", message: "Claim type and at least one line item are required" },
        },
        { status: 400 },
      );
    }

    const created = raiseClaimMock(id, body);
    return NextResponse.json(
      {
        success: true,
        data: created,
      },
      { status: 201 },
    );
  } catch (err: any) {
    const status = err.status || 500;
    const code = err.code || "CLAIM_ERROR";
    return NextResponse.json(
      {
        success: false,
        error: { code, message: err.message || "Failed to raise claim" },
      },
      { status },
    );
  }
}
