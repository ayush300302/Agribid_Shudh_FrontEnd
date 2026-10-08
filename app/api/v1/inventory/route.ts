import { NextResponse } from "next/server";
import { listInventoryMock } from "@/lib/mock-inventory";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const lowOnly = searchParams.get("lowOnly") === "true";
    const search = searchParams.get("search") || "";

    const items = listInventoryMock({
      category,
      lowOnly,
      search,
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to list inventory" },
      },
      { status: 500 },
    );
  }
}

