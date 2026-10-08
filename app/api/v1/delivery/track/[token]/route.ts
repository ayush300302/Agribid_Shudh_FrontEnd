import { NextResponse } from "next/server";
import { getTrackingInfoByTokenMock } from "@/lib/mock-delivery";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const trackingInfo = getTrackingInfoByTokenMock(token);

    if (!trackingInfo) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: `Tracking token '${token}' not found or expired` },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: trackingInfo,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to retrieve tracking info" },
      },
      { status: 500 },
    );
  }
}
