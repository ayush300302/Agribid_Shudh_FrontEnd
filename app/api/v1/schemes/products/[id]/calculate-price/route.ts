import { NextResponse } from "next/server";
import { calculateQuote } from "@/lib/mock-pricing";
import type { PriceQuoteRequest } from "@/types/pricing";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const quoteReq: PriceQuoteRequest = {
      sku_id: id,
      buyer_tier: body.buyer_tier || "distributor",
      buyer_id: body.buyer_id,
      quantity: Number(body.quantity) || 1,
      seller_state_code: body.seller_state_code || "27",
      buyer_state_code: body.buyer_state_code || "27",
    };

    const result = calculateQuote(quoteReq);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: err instanceof Error ? err.message : "Failed to calculate price quote",
        },
      },
      { status: 500 },
    );
  }
}
