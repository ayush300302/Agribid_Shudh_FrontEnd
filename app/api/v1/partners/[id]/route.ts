import { NextResponse } from "next/server";
import { MOCK_PARTNERS } from "@/lib/mock-partners";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const partner = MOCK_PARTNERS.find((p) => p.id === id);

  if (!partner) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: `Partner with ID '${id}' not found` },
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: partner,
  });
}
