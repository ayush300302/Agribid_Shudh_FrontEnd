import { NextResponse } from "next/server";
import { listPaymentsMock, recordPaymentMock } from "@/lib/mock-payments";
import type { RecordPaymentRequest } from "@/types/payment";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const mode = searchParams.get("mode") || undefined;
    const payerId = searchParams.get("payerId") || undefined;
    const search = searchParams.get("search") || undefined;

    const payments = listPaymentsMock({ status, mode, payerId, search });
    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to list payments" },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RecordPaymentRequest;

    if (!body.payer_id || !body.amount || !body.mode) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BAD_REQUEST", message: "payer_id, amount, and mode are required" },
        },
        { status: 400 },
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BAD_REQUEST", message: "Payment amount must be greater than zero" },
        },
        { status: 400 },
      );
    }

    const payment = recordPaymentMock(body);
    return NextResponse.json(
      {
        success: true,
        data: payment,
      },
      { status: 201 },
    );
  } catch (err: any) {
    const status = err.status || 500;
    const code = err.code || "SERVER_ERROR";
    return NextResponse.json(
      {
        success: false,
        error: { code, message: err.message || "Failed to record payment" },
      },
      { status },
    );
  }
}
