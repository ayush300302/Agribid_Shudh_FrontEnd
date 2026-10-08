import { NextResponse } from "next/server";
import { MOCK_PRICE_LISTS } from "@/lib/mock-pricing";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { decision } = body;

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

    if (decision === "approve") {
      priceList.status = "published";
      priceList.approved_by = "Checker (Finance Controller - USR-FIN-01)";
    } else {
      priceList.status = "draft";
    }

    priceList.updated_at = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: priceList,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to process review" },
      },
      { status: 500 },
    );
  }
}

