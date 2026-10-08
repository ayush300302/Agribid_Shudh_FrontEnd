import { NextResponse } from "next/server";
import { generateEwayBillMock } from "@/lib/mock-invoices";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.vehicle_number || !body.transporter_name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Vehicle number and Transporter name are required for E-Way Bill generation",
          },
        },
        { status: 400 },
      );
    }

    const updated = generateEwayBillMock(id, body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "EWAY_ERROR", message: err.message || "Failed to generate E-Way bill" },
      },
      { status: 400 },
    );
  }
}

