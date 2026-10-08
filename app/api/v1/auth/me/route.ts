import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      },
      { status: 401 },
    );
  }

  // Returns Vivek's exact UserContext model
  return NextResponse.json({
    success: true,
    data: {
      id: "11111111-1111-1111-1111-111111111111",
      user_id: "11111111-1111-1111-1111-111111111111",
      partner_id: "22222222-2222-2222-2222-222222222222",
      roles: ["ADM_SUPER"],
      is_admin: true,
      email: "admin@agribid.in",
      full_name: "Super Administrator",
    },
  });
}