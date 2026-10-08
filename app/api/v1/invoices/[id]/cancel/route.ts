import { NextResponse } from "next/server";
import { cancelInvoiceMock } from "@/lib/mock-invoices";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.reason) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Cancellation reason is required" },
        },
        { status: 400 },
      );
    }

    const cancelled = cancelInvoiceMock(id, body.reason);

    return NextResponse.json({
      success: true,
      data: cancelled,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVOICE_ERROR", message: err.message || "Failed to cancel invoice" },
      },
      { status: 400 },
    );
  }
}

