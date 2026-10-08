import { NextResponse } from "next/server";

function createMockJwt(payload: Record<string, unknown>): string {
  const header = { alg: "RS256", typ: "JWT" };
  const encode = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  return `${encode(header)}.${encode(payload)}.mock_signature`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email and password are required",
          },
        },
        { status: 400 },
      );
    }

    const exp = Math.floor(Date.now() / 1000) + 15 * 60;

    const accessToken = createMockJwt({
      sub: "11111111-1111-1111-1111-111111111111",
      user_id: "11111111-1111-1111-1111-111111111111",
      email,
      role: "ADM_SUPER",
      roles: ["ADM_SUPER"],
      is_admin: true,
      exp,
    });

    return NextResponse.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: "mock_refresh_token_30_days",
        expires_in: 900,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Internal server error during login",
        },
      },
      { status: 500 },
    );
  }
}