import { NextResponse } from "next/server";
import { dispatchShipmentMock } from "@/lib/mock-delivery";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const dispatched = dispatchShipmentMock(id);

    return NextResponse.json({
      success: true,
      data: dispatched,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "DISPATCH_ERROR", message: err.message || "Failed to dispatch shipment" },
      },
      { status: 400 },
    );
  }
}
