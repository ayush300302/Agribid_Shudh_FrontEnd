import { NextResponse } from "next/server";
import { resetCircuitBreakerMock } from "@/lib/mock-integrations";
import type { AdapterType } from "@/types/integrations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const adapter = body?.adapter as AdapterType;
    if (!adapter) {
      return NextResponse.json(
        { error: { code: "INVALID_ADAPTER", message: "Adapter is required" } },
        { status: 400 },
      );
    }

    const updated = resetCircuitBreakerMock(adapter);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "RESET_FAILED", message: error.message || "Failed to reset circuit breaker" } },
      { status: 500 },
    );
  }
}

