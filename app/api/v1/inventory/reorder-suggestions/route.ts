import { NextResponse } from "next/server";
import { getReorderSuggestionsMock } from "@/lib/mock-inventory";

export async function GET() {
  try {
    const suggestions = getReorderSuggestionsMock();
    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Failed to get reorder suggestions" },
      },
      { status: 500 },
    );
  }
}
