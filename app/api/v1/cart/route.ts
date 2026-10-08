import { NextResponse } from "next/server";
import {
  addCartItemMock,
  clearCartMock,
  getCartMock,
} from "@/lib/mock-orders";

export async function GET() {
  const cart = getCartMock();
  return NextResponse.json({
    success: true,
    data: cart,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id, quantity } = body;

    const cart = addCartItemMock(product_id, Number(quantity) || 1);

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to add item to cart" },
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const cart = clearCartMock();
  return NextResponse.json({
    success: true,
    data: cart,
  });
}
