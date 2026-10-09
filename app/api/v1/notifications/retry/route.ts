import { NextResponse } from "next/server";
import { retryFailedNotificationMock } from "@/lib/mock-notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.id) {
      return NextResponse.json(
        { error: { code: "NOTIFICATION_ID_REQUIRED", message: "Notification ID is required" } },
        { status: 400 },
      );
    }

    const updated = retryFailedNotificationMock(body.id);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "RETRY_NOTIFICATION_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}
