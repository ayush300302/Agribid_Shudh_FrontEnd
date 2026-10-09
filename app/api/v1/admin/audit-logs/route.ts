import { NextResponse } from "next/server";
import { getAuditLogsMock } from "@/lib/mock-audit-support";
import type { AuditEntityType } from "@/types/audit-support";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = (searchParams.get("entity") || "ALL") as AuditEntityType | "ALL";
    const actor = searchParams.get("actor") || undefined;
    const action = searchParams.get("action") || undefined;
    const search = searchParams.get("search") || undefined;

    const data = getAuditLogsMock({ entity, actor, action, search });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "AUDIT_FETCH_FAILED", message: error.message || "Failed to fetch audit logs" } },
      { status: 500 },
    );
  }
}
