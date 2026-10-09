import { NextResponse } from "next/server";
import { markNotificationsAsReadMock } from "@/lib/mock-notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body?.ids) ? body.ids : undefined;
    const result = markNotificationsAsReadMock(ids);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "MARK_READ_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}
