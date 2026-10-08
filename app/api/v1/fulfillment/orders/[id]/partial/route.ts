import { NextResponse } from "next/server";
import { recordPartialFulfillmentMock } from "@/lib/mock-fulfilment";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.lines || !Array.isArray(body.lines) || body.lines.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Missing lines array in partial fulfillment request",
          },
        },
        { status: 400 },
      );
    }

    const updated = recordPartialFulfillmentMock(id, body.lines);

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
          message: err.message || "Failed to record partial fulfillment",
        },
      },
      { status: 400 },
    );
  }
}
