import { NextResponse } from "next/server";
import { acceptOrderMock } from "@/lib/mock-fulfilment";

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
      // Empty body is acceptable for full accept
    }

    const updated = acceptOrderMock(id, body);

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
          message: err.message || "Failed to accept order",
        },
      },
      { status: 400 },
    );
  }
}
