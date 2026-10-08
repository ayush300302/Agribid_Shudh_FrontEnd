import { NextResponse } from "next/server";
import { MOCK_PRODUCTS } from "@/lib/mock-catalog";
import type { ProductStatus } from "@/types/catalog";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status: ProductStatus = body.status;

    const product = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: `Product with ID '${id}' not found` },
        },
        { status: 404 },
      );
    }

    product.status = status;
    product.updated_at = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: {
        message: `Product status successfully updated to ${status}.`,
        status,
        product,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update status" },
      },
      { status: 500 },
    );
  }
}
