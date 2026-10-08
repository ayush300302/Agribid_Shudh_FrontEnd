import { NextResponse } from "next/server";
import { listMovementsMock } from "@/lib/mock-inventory";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ skuId: string }> },
) {
  try {
    const { skuId } = await params;
    const movements = listMovementsMock(skuId);

    return NextResponse.json({
      success: true,
      data: movements,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to list movements" },
      },
      { status: 500 },
    );
  }
}

