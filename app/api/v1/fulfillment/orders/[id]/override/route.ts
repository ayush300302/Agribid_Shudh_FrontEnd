import { NextResponse } from "next/server";
import { overrideOrderStatusMock } from "@/lib/mock-fulfilment";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.status || !body.reason) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Both status and justification reason are required for admin override",
          },
        },
        { status: 400 },
      );
    }

    const updated = overrideOrderStatusMock(id, body.status, body.reason);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FULFILMENT_ERROR",
          message: err.message || "Failed to perform admin status override",
        },
      },
      { status: 400 },
    );
  }
}
