import { NextResponse } from "next/server";
import { listMovementsMock } from "@/lib/mock-inventory";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skuOrId = searchParams.get("sku") || searchParams.get("productId") || undefined;
    const movements = listMovementsMock(skuOrId);
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

