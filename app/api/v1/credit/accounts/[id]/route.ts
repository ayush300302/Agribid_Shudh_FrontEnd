import { NextResponse } from "next/server";
import { getCreditAccountMock, updateCreditTermsMock } from "@/lib/mock-payments";
import type { UpdateCreditTermsRequest } from "@/types/payment";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const account = getCreditAccountMock(id);

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: `Credit account '${id}' not found` },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: account,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to get credit account" },
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateCreditTermsRequest;

    const updated = updateCreditTermsMock(id, body);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    const status = err.status || 400;
    const code = err.code || "UPDATE_FAILED";
    return NextResponse.json(
      {
        success: false,
        error: { code, message: err.message || "Failed to update credit terms" },
      },
      { status },
    );
  }
}
