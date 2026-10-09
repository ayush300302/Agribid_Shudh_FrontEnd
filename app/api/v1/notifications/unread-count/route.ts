import { NextResponse } from "next/server";
import { getUnreadCountMock } from "@/lib/mock-notifications";

export async function GET() {
  try {
    const count = getUnreadCountMock();
    return NextResponse.json({
      success: true,
      data: { count },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "UNREAD_COUNT_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}
