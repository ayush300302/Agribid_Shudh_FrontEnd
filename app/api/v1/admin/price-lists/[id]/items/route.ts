import { NextResponse } from "next/server";
import { MOCK_PRICE_LIST_ITEMS } from "@/lib/mock-pricing";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedItems = body.items;

    if (Array.isArray(updatedItems)) {
      const existingItems = MOCK_PRICE_LIST_ITEMS[id] || MOCK_PRICE_LIST_ITEMS["pl-001"];
      for (const update of updatedItems) {
        const item = existingItems.find((i) => i.sku_id === update.sku_id);
        if (item) {
          if (update.buy_price !== undefined) item.buy_price = Number(update.buy_price);
          if (update.suggested_sell_price !== undefined)
            item.suggested_sell_price = Number(update.suggested_sell_price);
          if (update.max_discount_pct !== undefined)
            item.max_discount_pct = Number(update.max_discount_pct);
        }
      }
      MOCK_PRICE_LIST_ITEMS[id] = existingItems;
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Price list items successfully updated.",
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update price list items" },
      },
      { status: 500 },
    );
  }
}

