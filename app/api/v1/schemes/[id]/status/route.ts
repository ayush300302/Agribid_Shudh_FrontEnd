import { NextResponse } from "next/server";
import { MOCK_SCHEMES } from "@/lib/mock-pricing";
import type { SchemeStatus } from "@/types/pricing";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status: SchemeStatus = body.status;

    const scheme = MOCK_SCHEMES.find((s) => s.id === id);
    if (!scheme) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: `Scheme with ID '${id}' not found` },
        },
        { status: 404 },
      );
    }

    scheme.status = status;
    scheme.updated_at = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: scheme,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update scheme status" },
      },
      { status: 500 },
    );
  }
}

