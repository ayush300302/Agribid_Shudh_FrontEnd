import { NextResponse } from "next/server";
import { stockInMock } from "@/lib/mock-inventory";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.product_id || !body.quantity || body.quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "product_id and a positive quantity are required for stock-in",
          },
        },
        { status: 400 },
      );
    }

    const updated = stockInMock(body);

    return NextResponse.json(
      {
        success: true,
        data: updated,
      },
      { status: 201 },
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "STOCK_IN_ERROR", message: err.message || "Failed to stock in inventory" },
      },
      { status: 400 },
    );
  }
}

