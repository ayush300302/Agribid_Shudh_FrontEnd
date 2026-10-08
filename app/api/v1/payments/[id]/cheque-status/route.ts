import { NextResponse } from "next/server";
import { updateChequeStatusMock } from "@/lib/mock-payments";
import type { UpdateChequeStatusRequest } from "@/types/payment";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateChequeStatusRequest;

    if (!body.cheque_status) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BAD_REQUEST", message: "cheque_status is required" },
        },
        { status: 400 },
      );
    }

    const updated = updateChequeStatusMock(id, body);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UPDATE_FAILED", message: err.message || "Failed to update cheque status" },
      },
      { status: 400 },
    );
  }
}
