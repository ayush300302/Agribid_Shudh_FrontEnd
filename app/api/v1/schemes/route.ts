import { NextResponse } from "next/server";
import { MOCK_SCHEMES } from "@/lib/mock-pricing";
import type { Scheme } from "@/types/pricing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  let filtered = MOCK_SCHEMES;

  if (status && status !== "all") {
    filtered = filtered.filter((s) => s.status === status);
  }
  if (type && type !== "all") {
    filtered = filtered.filter((s) => s.type === type);
  }

  return NextResponse.json({
    success: true,
    data: filtered,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newScheme: Scheme = {
      id: `sch-${Date.now()}`,
      code: `SCH-PROMO-${Math.floor(100 + Math.random() * 900)}`,
      name: body.name,
      description: body.description,
      type: body.type,
      discount_value: body.discount_value ? Number(body.discount_value) : undefined,
      buy_qty: body.buy_qty ? Number(body.buy_qty) : undefined,
      get_qty: body.get_qty ? Number(body.get_qty) : undefined,
      slabs: body.slabs,
      valid_from: body.valid_from || new Date().toISOString(),
      valid_to: body.valid_to || new Date(Date.now() + 30 * 86400000).toISOString(),
      is_exclusive: Boolean(body.is_exclusive),
      budget_amount: body.budget_amount ? Number(body.budget_amount) : 100000,
      budget_used: 0,
      targets: body.targets || [],
      target_tiers: body.target_tiers || ["distributor", "retailer"],
      status: "active",
      created_by: "Commercial Ops (Active Admin)",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    MOCK_SCHEMES.unshift(newScheme);

    return NextResponse.json(
      {
        success: true,
        data: newScheme,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to create scheme" },
      },
      { status: 500 },
    );
  }
}

