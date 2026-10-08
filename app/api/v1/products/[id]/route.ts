import { NextResponse } from "next/server";
import type { Product } from "@/types/catalog";
import { MOCK_PRODUCTS } from "@/lib/mock-catalog";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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

  return NextResponse.json({
    success: true,
    data: product,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: `Product with ID '${id}' not found` },
      },
      { status: 404 },
    );
  }

  const existing = MOCK_PRODUCTS[index];
  const updatedProduct: Product = {
    ...existing,
    ...body,
    id,
    updated_at: new Date().toISOString(),
  };

  MOCK_PRODUCTS[index] = updatedProduct;

  return NextResponse.json({
    success: true,
    data: updatedProduct,
  });
}
