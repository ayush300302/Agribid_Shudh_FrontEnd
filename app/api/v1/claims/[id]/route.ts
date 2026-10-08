import { NextResponse } from "next/server";
import { getClaimMock } from "@/lib/mock-claims";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const claim = getClaimMock(id);

    if (!claim) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: `Claim '${id}' not found` },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: claim,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to get claim detail" },
      },
      { status: 500 },
    );
  }
}
