import { NextResponse } from "next/server";
import { rejectOrderMock } from "@/lib/mock-fulfilment";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.reason_code) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Mandatory reason_code required to reject order",
          },
        },
        { status: 400 },
      );
    }

    const updated = rejectOrderMock(id, body);

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
          message: err.message || "Failed to reject order",
        },
      },
      { status: 400 },
    );
  }
}
