import type { KYCDocument, KYCStatus, Partner } from "@/types/partner";

export const MOCK_PARTNERS: Partner[] = [
  {
    id: "p-001",
    code: "AGB-SS-MH-001",
    type: "state_stockist",
    business_name: "Maharashtra Agro Hub Pvt Ltd",
    trade_name: "MahaAgro Stockist",
    gstin: "27AAACM1234A1Z5",
    pan: "AAACM1234A",
    state_code: "27",
    address: {
      line1: "Plot 42, MIDC Bhosari",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411026",
    },
    status: "active",
    kyc_status: "approved",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "p-002",
    code: "AGB-DS-MH-102",
    type: "distributor",
    business_name: "Kisan Seva Krishi Kendra",
    trade_name: "Kisan Seva",
    parent_id: "p-001",
    parent_name: "Maharashtra Agro Hub Pvt Ltd",
    gstin: "27AAPFK5678B1Z2",
    pan: "AAPFK5678B",
    state_code: "27",
    address: {
      line1: "Market Yard Shop #14",
      city: "Nashik",
      state: "Maharashtra",
      pincode: "422003",
    },
    status: "active",
    kyc_status: "approved",
    created_at: "2026-02-10T11:30:00Z",
    updated_at: "2026-02-10T11:30:00Z",
  },
  {
    id: "p-003",
    code: "AGB-SD-MH-204",
    type: "sub_distributor",
    business_name: "Vidarbha Fertilizers & Seeds",
    trade_name: "Vidarbha Agri",
    parent_id: "p-002",
    parent_name: "Kisan Seva Krishi Kendra",
    gstin: "27AABCV9988C1Z9",
    pan: "AABCV9988C",
    state_code: "27",
    address: {
      line1: "Station Road Near APMC",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440002",
    },
    status: "active",
    kyc_status: "submitted",
    created_at: "2026-03-01T09:15:00Z",
    updated_at: "2026-03-01T09:15:00Z",
  },
  {
    id: "p-004",
    code: "AGB-RT-MH-501",
    type: "retailer",
    business_name: "Shri Ganesh Krishi Dukan",
    trade_name: "Ganesh Agro",
    parent_id: "p-003",
    parent_name: "Vidarbha Fertilizers & Seeds",
    gstin: "27AALPS3344D1Z1",
    pan: "AALPS3344D",
    state_code: "27",
    address: {
      line1: "Main Bazaar Ward 2",
      city: "Baramati",
      state: "Maharashtra",
      pincode: "413102",
    },
    status: "pending",
    kyc_status: "submitted",
    created_at: "2026-03-12T14:40:00Z",
    updated_at: "2026-03-12T14:40:00Z",
  },
  {
    id: "p-005",
    code: "AGB-DS-GJ-109",
    type: "distributor",
    business_name: "Gujarat Agro Trade Corp",
    trade_name: "G-Agro",
    gstin: "24AAACG8899E1Z8",
    pan: "AAACG8899E",
    state_code: "24",
    address: {
      line1: "GIDC Industrial Area",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "382445",
    },
    status: "blocked",
    kyc_status: "rejected",
    created_at: "2026-01-20T08:00:00Z",
    updated_at: "2026-02-18T16:20:00Z",
  },
];

export const MOCK_KYC_DOCS: Record<string, KYCDocument[]> = {
  "p-004": [
    {
      id: "doc-401",
      partner_id: "p-004",
      doc_type: "gst_certificate",
      file_url: "https://example.com/docs/gst_certificate_ganesh.pdf",
      status: "pending",
      submitted_at: "2026-03-12T14:45:00Z",
    },
    {
      id: "doc-402",
      partner_id: "p-004",
      doc_type: "pan_card",
      file_url: "https://example.com/docs/pan_card_ganesh.pdf",
      status: "pending",
      submitted_at: "2026-03-12T14:46:00Z",
    },
    {
      id: "doc-403",
      partner_id: "p-004",
      doc_type: "business_license",
      file_url: "https://example.com/docs/retail_license_baramati.pdf",
      status: "pending",
      submitted_at: "2026-03-12T14:50:00Z",
    },
    {
      id: "doc-404",
      partner_id: "p-004",
      doc_type: "bank_details",
      file_url: "https://example.com/docs/passbook_sbi_baramati.pdf",
      status: "pending",
      submitted_at: "2026-03-12T14:52:00Z",
    },
  ],
  "p-002": [
    {
      id: "doc-1",
      partner_id: "p-002",
      doc_type: "gst_certificate",
      file_url: "https://example.com/docs/gst_certificate_kisan_seva.pdf",
      status: "approved",
      submitted_at: "2026-02-10T12:00:00Z",
      reviewed_at: "2026-02-11T10:00:00Z",
      review_note: "Verified via GST portal.",
    },
    {
      id: "doc-2",
      partner_id: "p-002",
      doc_type: "pan_card",
      file_url: "https://example.com/docs/pan_card_proprietor.pdf",
      status: "approved",
      submitted_at: "2026-02-10T12:05:00Z",
      reviewed_at: "2026-02-11T10:00:00Z",
      review_note: "Matches legal entity name.",
    },
  ],
};

export function getPartnerKycDocs(partnerId: string): KYCDocument[] {
  if (MOCK_KYC_DOCS[partnerId]) {
    return MOCK_KYC_DOCS[partnerId];
  }
  // Default mock docs for any partner
  const defaultDocs: KYCDocument[] = [
    {
      id: `doc-${partnerId}-1`,
      partner_id: partnerId,
      doc_type: "gst_certificate",
      file_url: "https://example.com/docs/gst_certificate.pdf",
      status: "pending",
      submitted_at: new Date().toISOString(),
    },
    {
      id: `doc-${partnerId}-2`,
      partner_id: partnerId,
      doc_type: "pan_card",
      file_url: "https://example.com/docs/pan_card.pdf",
      status: "pending",
      submitted_at: new Date().toISOString(),
    },
    {
      id: `doc-${partnerId}-3`,
      partner_id: partnerId,
      doc_type: "business_license",
      file_url: "https://example.com/docs/license.pdf",
      status: "pending",
      submitted_at: new Date().toISOString(),
    },
    {
      id: `doc-${partnerId}-4`,
      partner_id: partnerId,
      doc_type: "bank_details",
      file_url: "https://example.com/docs/cancelled_cheque.pdf",
      status: "pending",
      submitted_at: new Date().toISOString(),
    },
  ];
  MOCK_KYC_DOCS[partnerId] = defaultDocs;
  return defaultDocs;
}

export function reviewPartnerKycMock(
  partnerId: string,
  status: "approved" | "rejected",
  reviewNote?: string,
): { partner: Partner; documents: KYCDocument[] } | null {
  const partner = MOCK_PARTNERS.find((p) => p.id === partnerId);
  if (!partner) return null;

  partner.kyc_status = status;
  if (status === "approved") {
    partner.status = "active";
  } else {
    partner.status = "blocked";
  }
  partner.updated_at = new Date().toISOString();

  const docs = getPartnerKycDocs(partnerId);
  for (const doc of docs) {
    doc.status = status;
    doc.reviewed_at = new Date().toISOString();
    doc.review_note = reviewNote || `Marked ${status} by Compliance Officer.`;
    doc.reviewed_by = "USR-COMPLIANCE-01";
  }

  return { partner, documents: docs };
}

export function reviewIndividualKycDocMock(
  partnerId: string,
  docId: string,
  status: "approved" | "rejected",
  reviewNote?: string,
): { partner: Partner; documents: KYCDocument[] } | null {
  const partner = MOCK_PARTNERS.find((p) => p.id === partnerId);
  if (!partner) return null;

  const docs = getPartnerKycDocs(partnerId);
  const targetDoc = docs.find((d) => d.id === docId);
  if (!targetDoc) return null;

  targetDoc.status = status;
  targetDoc.reviewed_at = new Date().toISOString();
  targetDoc.review_note = reviewNote || `Document ${status} by Compliance Officer.`;
  targetDoc.reviewed_by = "USR-COMPLIANCE-01";

  // Recompute overall partner KYC status:
  const hasRejected = docs.some((d) => d.status === "rejected");
  const allApproved = docs.every((d) => d.status === "approved");

  if (hasRejected) {
    partner.kyc_status = "rejected";
    partner.status = "blocked";
  } else if (allApproved) {
    partner.kyc_status = "approved";
    partner.status = "active";
  } else {
    partner.kyc_status = "submitted";
  }
  partner.updated_at = new Date().toISOString();

  return { partner, documents: docs };
}

