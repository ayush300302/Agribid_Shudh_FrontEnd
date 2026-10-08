import { NextResponse } from "next/server";
import { packOrderMock } from "@/lib/mock-fulfilment";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is acceptable
    }

    const updated = packOrderMock(id, body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FULFILMENT_ERROR",
          message: err.message || "Failed to pack order",
        },
      },
      { status: 400 },
    );
  }
}
