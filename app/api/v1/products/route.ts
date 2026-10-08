import { NextResponse } from "next/server";
import type { Product } from "@/types/catalog";
import { MOCK_PRODUCTS } from "@/lib/mock-catalog";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category_id");
  const status = searchParams.get("status");

  let filtered = MOCK_PRODUCTS;

  if (categoryId && categoryId !== "all") {
    filtered = filtered.filter((p) => p.category_id === categoryId);
  }
  if (status && status !== "all") {
    filtered = filtered.filter((p) => p.status === status);
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    meta: {
      page: 1,
      page_size: 20,
      total: filtered.length,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: body.sku.toUpperCase(),
      name: body.name,
      description: body.description,
      category_id: body.category_id,
      category_name: body.category_id === "cat-1" ? "Rice & Grains" : "General Commodity",
      brand: body.brand || "Shudh Brand",
      hsn_code: body.hsn_code,
      uom: body.uom || "BAG",
      weight_grams: body.weight_grams ? Number(body.weight_grams) : undefined,
      mrp: body.mrp ? Number(body.mrp) : undefined,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    MOCK_PRODUCTS.unshift(newProduct);

    return NextResponse.json(
      {
        success: true,
        data: newProduct,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to create product" },
      },
      { status: 500 },
    );
  }
}

