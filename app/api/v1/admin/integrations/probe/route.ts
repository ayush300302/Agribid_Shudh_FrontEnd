import { NextResponse } from "next/server";
import { testAdapterProbeMock } from "@/lib/mock-integrations";
import type { ProbeTestPayload } from "@/types/integrations";

export async function POST(request: Request) {
  try {
    const body: ProbeTestPayload = await request.json();
    if (!body?.adapter) {
      return NextResponse.json(
        { error: { code: "INVALID_PROBE", message: "Adapter is required" } },
        { status: 400 },
      );
    }

    const result = testAdapterProbeMock(body.adapter);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "PROBE_FAILED", message: error.message || "Failed to probe adapter" } },
      { status: 500 },
    );
  }
}
