import { NextResponse } from "next/server";
import { MOCK_ORDERS, placeOrderMock } from "@/lib/mock-orders";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const paymentStatus = searchParams.get("payment_status");
  const source = searchParams.get("source");
  const search = searchParams.get("search");

  let filtered = MOCK_ORDERS;

  if (status && status !== "all") {
    filtered = filtered.filter((o) => o.status === status);
  }
  if (paymentStatus && paymentStatus !== "all") {
    filtered = filtered.filter((o) => o.payment_status === paymentStatus);
  }
  if (source && source !== "all") {
    filtered = filtered.filter((o) => o.source === source);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.buyer_name.toLowerCase().includes(q) ||
        o.buyer_code.toLowerCase().includes(q) ||
        o.lines.some((l) => l.product_name.toLowerCase().includes(q)),
    );
  }

  return NextResponse.json({
    success: true,
    data: filtered,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newOrder = placeOrderMock(body);

    return NextResponse.json(
      {
        success: true,
        data: newOrder,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to place order" },
      },
      { status: 500 },
    );
  }
}
