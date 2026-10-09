import { NextResponse } from "next/server";
import { getNotificationsMock } from "@/lib/mock-notifications";
import type { NotificationChannel, NotificationStatus } from "@/types/notification";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get("channel") as NotificationChannel | "ALL" | null;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") as NotificationStatus | "ALL" | null;
    const search = searchParams.get("search") || undefined;

    const notifications = getNotificationsMock({
      channel: channel || undefined,
      category,
      status: status || undefined,
      search,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      total: notifications.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "NOTIFICATIONS_FETCH_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}
