import { NextResponse } from "next/server";
import { getSupportTicketByIdMock } from "@/lib/mock-audit-support";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ticket = getSupportTicketByIdMock(id);
    if (!ticket) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Ticket ${id} not found` } },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "TICKET_FETCH_FAILED", message: error.message || "Failed to fetch ticket" } },
      { status: 500 },
    );
  }
}
