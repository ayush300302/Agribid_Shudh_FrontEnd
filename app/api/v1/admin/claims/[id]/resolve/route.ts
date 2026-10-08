import { NextResponse } from "next/server";
import { adminResolveClaimMock } from "@/lib/mock-claims";
import type { AdminResolveClaimRequest } from "@/types/claim";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as AdminResolveClaimRequest;

    if (!body.action || !body.note?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BAD_REQUEST", message: "Action and resolution note are required" },
        },
        { status: 400 },
      );
    }

    const updated = adminResolveClaimMock(id, body);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "ARBITRATION_FAILED", message: err.message || "Failed to resolve claim arbitration" },
      },
      { status: 400 },
    );
  }
}
