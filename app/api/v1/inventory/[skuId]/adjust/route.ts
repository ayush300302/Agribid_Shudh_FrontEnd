import { NextResponse } from "next/server";
import { adjustStockMock } from "@/lib/mock-inventory";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ skuId: string }> },
) {
  try {
    const { skuId } = await params;
    const body = await request.json();

    if (body.quantity_change === undefined || !body.reason) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "quantity_change and reason are required to adjust stock",
          },
        },
        { status: 400 },
      );
    }

    const updated = adjustStockMock(skuId, body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "STOCK_CONFLICT", message: err.message || "Failed to adjust stock" },
      },
      { status: 409 },
    );
  }
}

