import { NextResponse } from "next/server";
import { getTemplatesMock, saveTemplateMock } from "@/lib/mock-notifications";

export async function GET() {
  try {
    const templates = getTemplatesMock();
    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "TEMPLATES_FETCH_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.code || !body?.title || !body?.body) {
      return NextResponse.json(
        { error: { code: "INVALID_TEMPLATE", message: "Template code, title, and body are required" } },
        { status: 400 },
      );
    }

    const saved = saveTemplateMock(body);
    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "TEMPLATE_SAVE_ERROR", message: error.message } },
      { status: 500 },
    );
  }
}
