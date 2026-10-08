import { NextResponse } from "next/server";
import { updateOrderStatusFulfilment } from "@/lib/mock-fulfilment";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = updateOrderStatusFulfilment(
      id,
      body.status,
      body.reason,
      "Seller Operations",
    );

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
          message: err.message || "Failed to update fulfillment status",
        },
      },
      { status: 400 },
    );
  }
}
