import { NextResponse } from "next/server";
import { getWebhookSubscriptionsMock } from "@/lib/mock-integrations";

export async function GET() {
  try {
    const data = getWebhookSubscriptionsMock();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "WEBHOOKS_FETCH_FAILED", message: error.message || "Failed to fetch webhooks" } },
      { status: 500 },
    );
  }
}
