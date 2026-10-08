import { NextResponse } from "next/server";
import { createCreditNoteMock, listCreditNotesMock } from "@/lib/mock-invoices";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoice_id") || undefined;
    const notes = listCreditNotesMock(invoiceId);

    return NextResponse.json({
      success: true,
      data: notes,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to list credit notes" },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.invoice_id || !body.reason || !body.amount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "invoice_id, reason and amount are required to issue a credit note",
          },
        },
        { status: 400 },
      );
    }

    const newCN = createCreditNoteMock(body);

    return NextResponse.json(
      {
        success: true,
        data: newCN,
      },
      { status: 201 },
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "CREDIT_NOTE_ERROR", message: err.message || "Failed to create credit note" },
      },
      { status: 400 },
    );
  }
}

