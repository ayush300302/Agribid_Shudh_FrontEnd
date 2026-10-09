import { NextResponse } from "next/server";
import { triggerTallyExportMock } from "@/lib/mock-integrations";
import type { TriggerTallyExportPayload } from "@/types/integrations";

export async function POST(request: Request) {
  try {
    const body: TriggerTallyExportPayload = await request.json();
    if (!body?.job_type) {
      return NextResponse.json(
        { error: { code: "INVALID_EXPORT", message: "Job type is required" } },
        { status: 400 },
      );
    }

    const job = triggerTallyExportMock(body.job_type, body.export_format || "XML");
    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "TALLY_EXPORT_FAILED", message: error.message || "Failed to trigger Tally export" } },
      { status: 500 },
    );
  }
}
