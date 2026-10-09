import { NextResponse } from "next/server";
import { getChangeRequestsMock } from "@/lib/mock-admin-console";
import type { ChangeRequestEntityType, ChangeRequestStatus } from "@/types/admin-console";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ChangeRequestStatus | "ALL" | null;
    const entityType = searchParams.get("entity_type") as ChangeRequestEntityType | "ALL" | null;
    const search = searchParams.get("search") || undefined;

    const data = getChangeRequestsMock({
      status: status || undefined,
      entity_type: entityType || undefined,
      search,
    });

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "CHANGE_REQUESTS_FETCH_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}
