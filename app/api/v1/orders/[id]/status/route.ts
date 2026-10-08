import { NextResponse } from "next/server";
import { updateOrderStatusMock } from "@/lib/mock-orders";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, reason } = body;

    const updated = updateOrderStatusMock(id, status, reason);
    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: `Order with ID '${id}' not found` },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update order status" },
      },
      { status: 500 },
    );
  }
}
