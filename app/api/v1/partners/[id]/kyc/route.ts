import { NextResponse } from "next/server";
import type { KYCDocument } from "@/types/partner";

const mockDocs: KYCDocument[] = [
  {
    id: "doc-1",
    partner_id: "p-002",
    doc_type: "gst_certificate",
    file_url: "https://example.com/docs/gst_certificate_kisan_seva.pdf",
    status: "pending",
    submitted_at: "2026-02-10T12:00:00Z",
  },
  {
    id: "doc-2",
    partner_id: "p-002",
    doc_type: "pan_card",
    file_url: "https://example.com/docs/pan_card_proprietor.pdf",
    status: "pending",
    submitted_at: "2026-02-10T12:05:00Z",
  },
  {
    id: "doc-3",
    partner_id: "p-002",
    doc_type: "business_license",
    file_url: "https://example.com/docs/fssai_fertilizer_license.pdf",
    status: "pending",
    submitted_at: "2026-02-10T12:10:00Z",
  },
  {
    id: "doc-4",
    partner_id: "p-002",
    doc_type: "bank_details",
    file_url: "https://example.com/docs/cancelled_cheque_sbi.pdf",
    status: "approved",
    submitted_at: "2026-02-10T12:15:00Z",
    reviewed_at: "2026-02-11T10:00:00Z",
    review_note: "Bank account holder name matches business PAN.",
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockDocs,
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { status, review_note } = body;

  return NextResponse.json({
    success: true,
    data: {
      message: `KYC review submitted as ${status}. Review notes recorded.`,
      status,
      review_note,
    },
  });
}

