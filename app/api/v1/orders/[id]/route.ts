import { NextResponse } from "next/server";
import { MOCK_ORDERS } from "@/lib/mock-orders";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const order = MOCK_ORDERS.find((o) => o.id === id || o.order_number === id);

  if (!order) {
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
    data: order,
  });
}
