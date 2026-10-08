import { NextResponse } from "next/server";
import { generatePickListMock } from "@/lib/mock-fulfilment";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Missing 'ids' query parameter (comma-separated order IDs)",
          },
        },
        { status: 400 },
      );
    }

    const orderIds = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const summary = generatePickListMock(orderIds);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FULFILMENT_ERROR",
          message: err.message || "Failed to generate pick list",
        },
      },
      { status: 400 },
    );
  }
}
