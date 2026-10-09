import { NextResponse } from "next/server";
import { updateTicketStatusMock } from "@/lib/mock-audit-support";
import type { UpdateTicketStatusPayload } from "@/types/audit-support";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: UpdateTicketStatusPayload = await request.json();

    if (!body?.status) {
      return NextResponse.json(
        { error: { code: "INVALID_STATUS", message: "Status is required" } },
        { status: 400 },
      );
    }

    const updated = updateTicketStatusMock(id, body.status, body.resolution_notes, body.assignee);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "STATUS_UPDATE_FAILED", message: error.message || "Failed to update ticket status" } },
      { status: 500 },
    );
  }
}

