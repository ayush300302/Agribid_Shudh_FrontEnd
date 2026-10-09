import { NextResponse } from "next/server";
import { toggleMaintenanceModeMock } from "@/lib/mock-admin-console";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const isMaintenance = toggleMaintenanceModeMock(Boolean(body?.enabled));
    return NextResponse.json({
      success: true,
      data: { enabled: isMaintenance },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "MAINTENANCE_TOGGLE_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}

