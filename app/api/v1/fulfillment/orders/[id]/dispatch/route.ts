import { NextResponse } from "next/server";
import { dispatchOrderMock } from "@/lib/mock-fulfilment";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.transporter_name || !body.vehicle_number) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Transporter name and vehicle number are required for dispatch",
          },
        },
        { status: 400 },
      );
    }

    const updated = dispatchOrderMock(id, body);

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
          message: err.message || "Failed to dispatch order",
        },
      },
      { status: 400 },
    );
  }
}
