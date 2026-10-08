import { NextResponse } from "next/server";
import { bulkAcceptOrdersMock } from "@/lib/mock-fulfilment";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.order_ids || !Array.isArray(body.order_ids) || body.order_ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Missing order_ids array in bulk accept request",
          },
        },
        { status: 400 },
      );
    }

    const updated = bulkAcceptOrdersMock(body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FULFILMENT_ERROR",
          message: err.message || "Failed to bulk accept orders",
        },
      },
      { status: 400 },
    );
  }
}
