import { NextResponse } from "next/server";
import {
  getPartnerKycDocs,
  reviewIndividualKycDocMock,
  reviewPartnerKycMock,
} from "@/lib/mock-partners";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const docs = getPartnerKycDocs(id);

  return NextResponse.json({
    success: true,
    data: docs,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { doc_id, status, review_note } = body;

    const result = doc_id
      ? reviewIndividualKycDocMock(id, doc_id, status, review_note)
      : reviewPartnerKycMock(id, status, review_note);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: `Partner or document not found` },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `KYC review submitted as ${status}. Review notes recorded.`,
        partner: result.partner,
        documents: result.documents,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to process KYC review" },
      },
      { status: 500 },
    );
  }
}
