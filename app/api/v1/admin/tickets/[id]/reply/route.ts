import { NextResponse } from "next/server";
import { replyToTicketMock } from "@/lib/mock-audit-support";
import type { TicketReplyPayload } from "@/types/audit-support";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: TicketReplyPayload = await request.json();

    if (!body?.message) {
      return NextResponse.json(
        { error: { code: "INVALID_REPLY", message: "Message is required" } },
        { status: 400 },
      );
    }

    const updated = replyToTicketMock(id, body.message, body.sender_name || "Support Admin");
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "REPLY_FAILED", message: error.message || "Failed to post reply" } },
      { status: 500 },
    );
  }
}

