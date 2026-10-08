import { NextResponse } from "next/server";
import { listInvoicesMock } from "@/lib/mock-invoices";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const irn_status = searchParams.get("irn_status") || "all";
    const search = searchParams.get("search") || "";

    const invoices = listInvoicesMock({
      status,
      irn_status,
      search,
    });

    return NextResponse.json({
      success: true,
      data: invoices,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to list invoices" },
      },
      { status: 500 },
    );
  }
}

