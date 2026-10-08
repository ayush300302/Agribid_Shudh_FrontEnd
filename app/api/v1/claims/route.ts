import { NextResponse } from "next/server";
import { listClaimsMock } from "@/lib/mock-claims";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const isEscalatedStr = searchParams.get("isEscalated");
    const isEscalated =
      isEscalatedStr === "true"
        ? true
        : isEscalatedStr === "false"
        ? false
        : undefined;
    const search = searchParams.get("search") || undefined;

    const claims = listClaimsMock({ status, type, isEscalated, search });
    return NextResponse.json({
      success: true,
      data: claims,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to list claims" },
      },
      { status: 500 },
    );
  }
}
