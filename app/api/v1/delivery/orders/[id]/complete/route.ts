import { NextResponse } from "next/server";
import { completeDeliveryMock } from "@/lib/mock-delivery";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const pod = completeDeliveryMock({
      ...body,
      order_id: id,
    });

    return NextResponse.json({
      success: true,
      data: pod,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "POD_ERROR", message: err.message || "Failed to record proof of delivery" },
      },
      { status: 400 },
    );
  }
}
