import { NextResponse } from "next/server";
import { sendTestNotificationMock } from "@/lib/mock-notifications";
import type { SendTestNotificationRequest } from "@/types/notification";

export async function POST(request: Request) {
  try {
    const body: SendTestNotificationRequest = await request.json();
    if (!body?.template_code || !body?.recipient_phone || !body?.channel) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_TEST_REQUEST",
            message: "Template code, recipient phone, and channel are required",
          },
        },
        { status: 400 },
      );
    }

    const record = sendTestNotificationMock(body);
    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "TEST_SEND_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}
