import { NextResponse } from "next/server";
import { listDeliveryPartnersMock } from "@/lib/mock-delivery";

export async function GET() {
  try {
    const partners = listDeliveryPartnersMock();
    return NextResponse.json({
      success: true,
      data: partners,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to list delivery partners" },
      },
      { status: 500 },
    );
  }
}
