import { NextResponse } from "next/server";
import { evictSessionMock } from "@/lib/mock-admin-console";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = evictSessionMock(id);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "SESSION_EVICT_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}
