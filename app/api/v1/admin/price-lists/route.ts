import { NextResponse } from "next/server";
import { MOCK_PRICE_LISTS } from "@/lib/mock-pricing";
import type { PriceList } from "@/types/pricing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stateCode = searchParams.get("state_code");
  const tier = searchParams.get("tier");
  const status = searchParams.get("status");

  let filtered = MOCK_PRICE_LISTS;

  if (stateCode && stateCode !== "all") {
    filtered = filtered.filter((p) => p.state_code === stateCode);
  }
  if (tier && tier !== "all") {
    filtered = filtered.filter((p) => p.tier === tier);
  }
  if (status && status !== "all") {
    filtered = filtered.filter((p) => p.status === status);
  }

  return NextResponse.json({
    success: true,
    data: filtered,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const stateMap: Record<string, string> = {
      "27": "Maharashtra",
      "24": "Gujarat",
      "23": "Madhya Pradesh",
      "03": "Punjab",
      "06": "Haryana",
    };

    const newPriceList: PriceList = {
      id: `pl-${Date.now()}`,
      state_code: body.state_code,
      state_name: stateMap[body.state_code] || "General State",
      tier: body.tier,
      version: 1,
      effective_from: body.effective_from || new Date().toISOString(),
      status: "draft",
      created_by: "Active Admin Session",
      items_count: 6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    MOCK_PRICE_LISTS.unshift(newPriceList);

    return NextResponse.json(
      {
        success: true,
        data: newPriceList,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to create price list" },
      },
      { status: 500 },
    );
  }
}

