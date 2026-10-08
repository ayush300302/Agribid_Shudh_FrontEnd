import { NextResponse } from "next/server";
import { placeOnBehalfOrderMock } from "@/lib/mock-orders";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newOrder = placeOnBehalfOrderMock(body);

    return NextResponse.json(
      {
        success: true,
        data: newOrder,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to place on-behalf assisted order" },
      },
      { status: 500 },
    );
  }
}
