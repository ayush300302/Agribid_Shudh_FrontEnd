import { NextResponse } from "next/server";
import { getPreferencesMock, updatePreferencesMock } from "@/lib/mock-notifications";

export async function GET() {
  try {
    const prefs = getPreferencesMock();
    return NextResponse.json({
      success: true,
      data: prefs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "PREFERENCES_FETCH_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = updatePreferencesMock(body);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "PREFERENCES_UPDATE_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}
