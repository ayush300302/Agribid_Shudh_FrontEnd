import { NextResponse } from "next/server";
import { generateOrderInvoiceMock } from "@/lib/mock-invoices";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const invoice = generateOrderInvoiceMock(id);

    return NextResponse.json(
      {
        success: true,
        data: invoice,
      },
      { status: 201 },
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVOICE_ERROR", message: err.message || "Failed to generate invoice" },
      },
      { status: 400 },
    );
  }
}

