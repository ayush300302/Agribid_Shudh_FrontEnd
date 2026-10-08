import { NextResponse } from "next/server";
import { getInvoiceByIdMock } from "@/lib/mock-invoices";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const invoice = getInvoiceByIdMock(id);

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: `Invoice ${id} not found` },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to retrieve invoice" },
      },
      { status: 500 },
    );
  }
}

