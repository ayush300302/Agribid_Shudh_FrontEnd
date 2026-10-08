import { NextResponse } from "next/server";
import { getInvoiceByIdMock } from "@/lib/mock-invoices";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const invoice = getInvoiceByIdMock(id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: `Invoice ${id} not found` } },
        { status: 404 },
      );
    }

    // Simulate WhatsApp / SMS / Email dispatch
    return NextResponse.json({
      success: true,
      data: {
        success: true,
        message: `Tax invoice ${invoice.invoice_number} dispatched to ${body.recipient || "recipient"} via ${body.channel || "WhatsApp"} successfully.`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SHARE_ERROR", message: err.message || "Failed to share invoice" },
      },
      { status: 400 },
    );
  }
}

