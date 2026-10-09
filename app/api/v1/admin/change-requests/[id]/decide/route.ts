import { NextResponse } from "next/server";
import { decideChangeRequestMock } from "@/lib/mock-admin-console";
import type { DecideChangeRequestPayload } from "@/types/admin-console";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: DecideChangeRequestPayload = await request.json();

    if (!body?.action || !body?.comments) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DECISION",
            message: "Decision action (APPROVE/REJECT) and mandatory comments are required",
          },
        },
        { status: 400 },
      );
    }

    // Default checker: Super Admin
    const checkerUser = {
      id: "usr-admin-01",
      name: "Ayush Patil",
      role: "ADM_SUPER",
    };

    const updated = decideChangeRequestMock(id, body, checkerUser);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "MAKER_CHECKER_ERROR",
          message: error.message,
        },
      },
      { status: 400 },
    );
  }
}

