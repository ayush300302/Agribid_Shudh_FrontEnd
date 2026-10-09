import { NextResponse } from "next/server";
import { getSupportTicketsMock } from "@/lib/mock-audit-support";
import type { TicketCategory, TicketPriority, TicketStatus } from "@/types/audit-support";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") || "ALL") as TicketStatus | "ALL";
    const category = (searchParams.get("category") || "ALL") as TicketCategory | "ALL";
    const priority = (searchParams.get("priority") || "ALL") as TicketPriority | "ALL";
    const search = searchParams.get("search") || undefined;

    const data = getSupportTicketsMock({ status, category, priority, search });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "TICKETS_FETCH_FAILED", message: error.message || "Failed to fetch tickets" } },
      { status: 500 },
    );
  }
}

