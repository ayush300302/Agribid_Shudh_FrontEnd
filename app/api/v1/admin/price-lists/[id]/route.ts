import { NextResponse } from "next/server";
import {
  MOCK_PRICE_LISTS,
  MOCK_PRICE_LIST_ITEMS,
} from "@/lib/mock-pricing";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const priceList = MOCK_PRICE_LISTS.find((pl) => pl.id === id);

  if (!priceList) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: `Price list with ID '${id}' not found` },
      },
      { status: 404 },
    );
  }

  // Get items for this price list (fallback to pl-001 items if custom list)
  const items = MOCK_PRICE_LIST_ITEMS[id] || MOCK_PRICE_LIST_ITEMS["pl-001"];

  return NextResponse.json({
    success: true,
    data: {
      price_list: priceList,
      items,
    },
  });
}

