import { NextResponse } from "next/server";
import type { Partner } from "@/types/partner";
import { MOCK_PARTNERS } from "@/lib/mock-partners";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let filtered = MOCK_PARTNERS;
  if (type && type !== "all") {
    filtered = filtered.filter((p) => p.type === type);
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

    const tierPrefix =
      body.type === "state_stockist"
        ? "SS"
        : body.type === "distributor"
        ? "DS"
        : body.type === "sub_distributor"
        ? "SD"
        : body.type === "retailer"
        ? "RT"
        : "MF";

    const state = body.state_code || "MH";
    const randomCode = Math.floor(100 + Math.random() * 900);

    const newPartner: Partner = {
      id: `p-${Date.now()}`,
      code: `AGB-${tierPrefix}-${state}-${randomCode}`,
      type: body.type || "distributor",
      business_name: body.business_name,
      trade_name: body.trade_name,
      parent_id: body.parent_id,
      parent_name: body.parent_id ? "Mapped Parent Entity" : undefined,
      gstin: body.gstin,
      pan: body.pan,
      state_code: body.state_code || "27",
      address: body.address,
      status: "active",
      kyc_status: "submitted",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    MOCK_PARTNERS.unshift(newPartner);

    return NextResponse.json(
      {
        success: true,
        data: newPartner,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to create partner" },
      },
      { status: 500 },
    );
  }
}