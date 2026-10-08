import { NextResponse } from "next/server";
import { MOCK_SCHEMES } from "@/lib/mock-pricing";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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

  return NextResponse.json({
    success: true,
    data: scheme,
  });
}

