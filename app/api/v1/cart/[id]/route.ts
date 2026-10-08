import { NextResponse } from "next/server";
import {
  removeCartItemMock,
  updateCartItemMock,
} from "@/lib/mock-orders";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity } = body;

    const cart = updateCartItemMock(id, Number(quantity));

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update cart item" },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cart = removeCartItemMock(id);

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to remove cart item" },
      },
      { status: 500 },
    );
  }
}
