import { NextResponse } from "next/server";
import { getTallyJobsMock } from "@/lib/mock-integrations";

export async function GET() {
  try {
    const data = getTallyJobsMock();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "TALLY_JOBS_FAILED", message: error.message || "Failed to fetch Tally jobs" } },
      { status: 500 },
    );
  }
}

