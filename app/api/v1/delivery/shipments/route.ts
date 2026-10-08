import { NextResponse } from "next/server";
import { createShipmentMock, listShipmentsMock } from "@/lib/mock-delivery";

export async function GET() {
  try {
    const shipments = listShipmentsMock();
    return NextResponse.json({
      success: true,
      data: shipments,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to list shipments" },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.order_ids || !Array.isArray(body.order_ids) || body.order_ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "At least one order_id is required" },
        },
        { status: 400 },
      );
    }

    const newShipment = createShipmentMock(body);

    return NextResponse.json(
      {
        success: true,
        data: newShipment,
      },
      { status: 201 },
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SHIPMENT_ERROR", message: err.message || "Failed to create shipment" },
      },
      { status: 400 },
    );
  }
}
