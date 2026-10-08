import { NextResponse } from "next/server";
import { cancelOrderMock } from "@/lib/mock-orders";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    const cancelled = cancelOrderMock(id, reason);
    if (!cancelled) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: `Order with ID '${id}' not found` },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: cancelled,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to cancel order" },
      },
      { status: 500 },
    );
  }
}
