"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileCheck,
  FileSearch,
  FileText,
  MapPin,
  Network,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import {
  getPartnerById,
  getPartnerChildren,
  getPartnerKyc,
  reviewPartnerKyc,
} from "@/lib/partner-api";
import type { KYCDocType, KYCDocument } from "@/types/partner";

function formatDocTitle(type: KYCDocType): string {
  switch (type) {
    case "gst_certificate":
      return "GST Registration Certificate (Form REG-06)";
    case "pan_card":
      return "Permanent Account Number (PAN Card)";
    case "business_license":
      return "Mandatory Trade / Pesticide / Fertilizer License";
    case "bank_details":
      return "Bank Account Verification (Cancelled Cheque / Passbook)";
    case "address_proof":
      return "Registered Address Proof (Electricity / Lease)";
    default:
      return type;
  }
}

function PartnerDetailContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [reviewNote, setReviewNote] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  // Individual Document Inspector Modal State
  const [inspectingDoc, setInspectingDoc] = useState<KYCDocument | null>(null);
  const [inspectingNote, setInspectingNote] = useState("");
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);

  // Queries
  const partnerQuery = useQuery({
    queryKey: ["partner", id],
    queryFn: () => getPartnerById(id),
  });

  const kycQuery = useQuery({
    queryKey: ["partner-kyc", id],
    queryFn: () => getPartnerKyc(id),
  });

  const childrenQuery = useQuery({
    queryKey: ["partner-children", id],
    queryFn: () => getPartnerChildren(id),
  });

  const partner = partnerQuery.data;
  const kycDocs = kycQuery.data || [];
  const children = childrenQuery.data || [];

  // Bulk / Overall Partner KYC review
  async function handleKycDecision(status: "approved" | "rejected") {
    setSubmittingReview(true);
    setReviewFeedback(null);
    try {
      await reviewPartnerKyc(id, { status, review_note: reviewNote });
      setReviewFeedback(`All KYC records updated to ${status.toUpperCase()}!`);
      await kycQuery.refetch();
      await partnerQuery.refetch();
    } catch {
      setReviewFeedback("Failed to update KYC status. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  }

  // Individual Document Review
  async function handleDocDecision(
    docId: string,
    status: "approved" | "rejected",
    customNote?: string,
  ) {
    setProcessingDocId(docId);
    setReviewFeedback(null);
    const note =
      customNote ||
      inspectingNote ||
      (status === "approved"
        ? "Document verified against government registrar."
        : "Rejected by compliance officer.");

    try {
      await reviewPartnerKyc(id, {
        doc_id: docId,
        status,
        review_note: note,
      });
      setReviewFeedback(`Document marked as ${status.toUpperCase()}!`);
      await kycQuery.refetch();
      await partnerQuery.refetch();
      if (inspectingDoc?.id === docId) {
        setInspectingDoc(null);
        setInspectingNote("");
      }
    } catch {
      setReviewFeedback("Failed to update document status.");
    } finally {
      setProcessingDocId(null);
    }
  }

  function openInspector(doc: KYCDocument) {
    setInspectingDoc(doc);
    setInspectingNote(doc.review_note || "");
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#64766a]">
        <Link
          href="/admin/partners"
          className="inline-flex items-center gap-1 font-medium hover:text-[#1b5e20] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Partners
        </Link>
        <span>/</span>
        <span className="font-mono text-[#19392a]">{partner?.code || id}</span>
      </div>

      {/* Partner Hero Header */}
      {partnerQuery.isLoading ? (
        <div className="h-28 rounded-lg bg-white border border-[#dce5dd] animate-pulse" />
      ) : partner ? (
        <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#19392a]">
                  {partner.business_name}
                </h1>
                <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-blue-800 border border-blue-200">
                  {partner.type.replace("_", " ")}
                </span>
              </div>
              {partner.trade_name ? (
                <p className="mt-1 text-sm text-[#64766a]">
                  Trade Name: {partner.trade_name}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#64766a]">
                <span className="font-mono font-medium text-[#1b5e20] bg-[#e9f1e9] px-2 py-0.5 rounded">
                  {partner.code}
                </span>
                <span>GST: {partner.gstin || "N/A"}</span>
                <span>PAN: {partner.pan || "N/A"}</span>
                <span>State: {partner.state_code || "MH"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-md border px-3 py-1 text-xs font-semibold uppercase ${
                  partner.kyc_status === "approved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : partner.kyc_status === "rejected"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                KYC: {partner.kyc_status.replace("_", " ")}
              </span>

              <span
                className={`rounded-md border px-3 py-1 text-xs font-semibold uppercase ${
                  partner.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                Account: {partner.status}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Tab Navigation */}
      <div className="border-b border-[#dce5dd]">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
              activeTab === "overview"
                ? "border-[#1b5e20] text-[#1b5e20]"
                : "border-transparent text-[#64766a] hover:text-[#19392a]"
            }`}
          >
            <Building2 size={16} /> Overview Dossier
          </button>

          <button
            onClick={() => setActiveTab("kyc")}
            className={`flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
              activeTab === "kyc"
                ? "border-[#1b5e20] text-[#1b5e20]"
                : "border-transparent text-[#64766a] hover:text-[#19392a]"
            }`}
          >
            <ShieldCheck size={16} /> KYC Verification ({kycDocs.length})
          </button>

          <button
            onClick={() => setActiveTab("hierarchy")}
            className={`flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
              activeTab === "hierarchy"
                ? "border-[#1b5e20] text-[#1b5e20]"
                : "border-transparent text-[#64766a] hover:text-[#19392a]"
            }`}
          >
            <Network size={16} /> Downline Hierarchy ({children.length})
          </button>
        </nav>
      </div>

      {/* TAB 1: OVERVIEW DOSSIER */}
      {activeTab === "overview" && partner ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Business Location Card */}
          <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#19392a]">
              <MapPin size={16} className="text-[#1b5e20]" />
              Registered Business Address
            </div>
            <div className="mt-4 space-y-2 text-sm text-[#31483a]">
              <p className="font-medium">{partner.address?.line1}</p>
              {partner.address?.line2 ? <p>{partner.address.line2}</p> : null}
              <p>
                {partner.address?.city}, {partner.address?.state} —{" "}
                <span className="font-mono font-medium">
                  {partner.address?.pincode}
                </span>
              </p>
            </div>
          </div>

          {/* Hierarchy Relationship Card */}
          <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#19392a]">
              <Network size={16} className="text-[#1b5e20]" />
              Parent Partner Mapping
            </div>
            <div className="mt-4 text-sm text-[#31483a]">
              {partner.parent_name ? (
                <div>
                  <p className="text-xs text-[#64766a]">Direct Parent:</p>
                  <p className="text-base font-semibold text-[#19392a] mt-1">
                    {partner.parent_name}
                  </p>
                  <p className="font-mono text-xs text-[#1b5e20] mt-1">
                    ID: {partner.parent_id}
                  </p>
                </div>
              ) : (
                <p className="text-[#64766a] italic">
                  This entity is at the root level of the distribution hierarchy.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* TAB 2: KYC VERIFICATION & REVIEW */}
      {activeTab === "kyc" ? (
        <div className="space-y-6">
          {/* Document List */}
          <div className="rounded-lg border border-[#dce5dd] bg-white shadow-xs overflow-hidden">
            <div className="border-b border-[#dce5dd] bg-[#f9fbf9] px-6 py-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#19392a]">
                  Compliance Verification Documents
                </h3>
                <p className="text-xs text-[#64766a]">
                  Inspect and approve or reject each certificate individually, or submit overall compliance decision below.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-[#64766a]">Verified:</span>
                <span className="font-bold text-emerald-700">
                  {kycDocs.filter((d) => d.status === "approved").length} / {kycDocs.length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#e8eee9]">
              {kycDocs.map((doc) => {
                const isProcessing = processingDocId === doc.id;

                return (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-[#fcfdfc]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="rounded-md bg-[#e9f1e9] p-2.5 text-[#1b5e20] mt-0.5">
                        <FileText size={22} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#19392a]">
                          {formatDocTitle(doc.doc_type)}
                        </p>
                        <p className="text-xs text-[#64766a] mt-0.5">
                          Submitted: {new Date(doc.submitted_at).toLocaleDateString("en-IN")} &bull;{" "}
                          <span className="font-mono text-[11px] text-[#87958b]">Ref: {doc.id}</span>
                        </p>

                        {doc.review_note ? (
                          <div
                            className={`mt-2 rounded px-2.5 py-1 text-xs inline-block font-medium ${
                              doc.status === "rejected"
                                ? "bg-red-50 text-red-800 border border-red-200"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            Remarks: {doc.review_note}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
                      {/* Status Badge */}
                      <span
                        className={`rounded-md border px-2.5 py-1 text-xs font-semibold capitalize ${
                          doc.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : doc.status === "rejected"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                        }`}
                      >
                        {doc.status}
                      </span>

                      {/* Inspect / View Certificate Button */}
                      <button
                        type="button"
                        onClick={() => openInspector(doc)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#cbd8ce] bg-white px-3 py-1.5 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
                      >
                        <Eye size={13} className="text-[#1b5e20]" />
                        Inspect Document
                      </button>

                      {/* Quick Approve Button */}
                      <button
                        type="button"
                        disabled={isProcessing || doc.status === "approved"}
                        onClick={() => handleDocDecision(doc.id, "approved", "Approved by Compliance Officer")}
                        className="rounded-md bg-emerald-50 border border-emerald-300 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 transition-colors"
                        title="Approve Document"
                      >
                        Approve
                      </button>

                      {/* Quick Reject Button */}
                      <button
                        type="button"
                        disabled={isProcessing || doc.status === "rejected"}
                        onClick={() => openInspector(doc)}
                        className="rounded-md bg-red-50 border border-red-300 px-2.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100 disabled:opacity-40 transition-colors"
                        title="Reject Document with Remarks"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Administrative Bulk Decision Panel */}
          <div className="rounded-lg border border-[#cbd8ce] bg-white p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-[#19392a]">
              Administrative Decision & Overall Review Notes
            </h3>
            <p className="mt-1 text-xs text-[#64766a]">
              Apply overall partner compliance decision. Approving activates the partner in the distribution hierarchy.
            </p>

            {reviewFeedback ? (
              <div className="mt-4 rounded-md border border-[#c3e6cb] bg-[#d4edda] p-3 text-sm text-[#155724] flex items-center justify-between">
                <span>{reviewFeedback}</span>
                <button
                  type="button"
                  onClick={() => setReviewFeedback(null)}
                  className="font-bold text-xs"
                >
                  &times;
                </button>
              </div>
            ) : null}

            <div className="mt-4">
              <label
                htmlFor="reviewNote"
                className="block text-xs font-medium text-[#31483a]"
              >
                Overall Compliance Comments / Master Notice
              </label>
              <textarea
                id="reviewNote"
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Enter compliance verification remarks for this partner..."
                className="mt-2 w-full rounded-md border border-[#cbd8ce] p-3 text-sm text-[#19392a] outline-none transition-colors placeholder:text-[#87958b] focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
              />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                disabled={submittingReview}
                onClick={() => handleKycDecision("approved")}
                className="inline-flex items-center gap-2 rounded-md bg-[#1b5e20] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 size={16} /> Approve Partner KYC
              </button>

              <button
                type="button"
                disabled={submittingReview}
                onClick={() => handleKycDecision("rejected")}
                className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                <XCircle size={16} /> Reject Partner with Remarks
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* TAB 3: DOWNLINE CHILDREN */}
      {activeTab === "hierarchy" ? (
        <div className="rounded-lg border border-[#dce5dd] bg-white shadow-xs overflow-hidden">
          <div className="border-b border-[#dce5dd] bg-[#f9fbf9] px-6 py-4">
            <h3 className="text-sm font-semibold text-[#19392a]">
              Direct Downline Network
            </h3>
            <p className="text-xs text-[#64766a]">
              Child businesses reporting directly to this partner in the hierarchy.
            </p>
          </div>

          {children.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#64766a]">
              No downline child partners currently mapped.
            </div>
          ) : (
            <div className="divide-y divide-[#e8eee9]">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between p-4 hover:bg-[#f9fbf9] transition-colors"
                >
                  <div>
                    <p className="font-semibold text-sm text-[#19392a]">
                      {child.business_name}
                    </p>
                    <p className="text-xs text-[#64766a]">
                      {child.address?.city}, {child.address?.state} ·{" "}
                      <span className="font-mono text-[#1b5e20]">
                        {child.code}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200 capitalize">
                      {child.type.replace("_", " ")}
                    </span>
                    <Link
                      href={`/admin/partners/${child.id}`}
                      className="rounded-md border border-[#cbd8ce] px-2.5 py-1 text-xs font-medium text-[#19392a] hover:bg-[#f1f5f1]"
                    >
                      View 360
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* DOCUMENT INSPECTION & VERIFICATION MODAL */}
      {inspectingDoc ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl rounded-lg border border-[#cbd8ce] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e8eee9] bg-[#f9fbf9] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="rounded-md bg-[#e9f1e9] p-2 text-[#1b5e20]">
                  <FileSearch size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-[#19392a]">
                    Document Verification Inspector
                  </h3>
                  <p className="text-xs text-[#64766a]">
                    Compliance review for {partner?.business_name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="rounded p-1 text-[#64766a] hover:bg-[#e8eee9] hover:text-[#19392a]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Document Preview & Certificate */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Certificate Preview Card */}
              <div className="rounded-lg border-2 border-dashed border-[#cbd8ce] bg-[#fafcfa] p-6 text-sm relative">
                <div className="flex items-start justify-between border-b border-[#e8eee9] pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#64766a] block">
                      Official Compliance Record
                    </span>
                    <h4 className="font-bold text-lg text-[#19392a] mt-0.5">
                      {formatDocTitle(inspectingDoc.doc_type)}
                    </h4>
                  </div>
                  <div className="size-10 rounded border border-[#cbd8ce] bg-white p-1 flex items-center justify-center">
                    <QrCode size={28} className="text-[#19392a]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 text-xs">
                  <div>
                    <span className="text-[#64766a] block">Legal Entity Name:</span>
                    <span className="font-semibold text-[#19392a] block mt-0.5">
                      {partner?.business_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64766a] block">Partner Code:</span>
                    <span className="font-mono font-semibold text-[#1b5e20] block mt-0.5">
                      {partner?.code}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64766a] block">Tax ID / PAN:</span>
                    <span className="font-mono font-semibold text-[#19392a] block mt-0.5">
                      {partner?.pan || "PAN Verified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64766a] block">GSTIN:</span>
                    <span className="font-mono font-semibold text-[#19392a] block mt-0.5">
                      {partner?.gstin || "State Exempted"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64766a] block">Submission Date:</span>
                    <span className="text-[#19392a] block mt-0.5">
                      {new Date(inspectingDoc.submitted_at).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64766a] block">Current Verification Status:</span>
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold uppercase mt-0.5 ${
                        inspectingDoc.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : inspectingDoc.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {inspectingDoc.status}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-3 border-t border-[#e8eee9] flex items-center justify-between text-xs text-[#64766a]">
                  <span>Source URL: {inspectingDoc.file_url}</span>
                  <a
                    href={inspectingDoc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#1b5e20] hover:underline"
                  >
                    Open Original <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Review Note Input */}
              <div>
                <label className="block text-xs font-semibold text-[#31483a] mb-1.5">
                  Inspection Remarks / Rejection Reason:
                </label>
                <textarea
                  rows={3}
                  value={inspectingNote}
                  onChange={(e) => setInspectingNote(e.target.value)}
                  placeholder="E.g. Verified against state GST portal, or: Address signature is illegible..."
                  className="w-full rounded-md border border-[#cbd8ce] p-3 text-xs text-[#19392a] outline-none placeholder:text-[#87958b] focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between border-t border-[#e8eee9] bg-[#f9fbf9] px-6 py-4">
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="rounded-md border border-[#cbd8ce] bg-white px-3.5 py-2 text-xs font-semibold text-[#64766a] hover:bg-[#e8eee9]"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={processingDocId === inspectingDoc.id}
                  onClick={() =>
                    handleDocDecision(
                      inspectingDoc.id,
                      "rejected",
                      inspectingNote || "Document rejected during compliance inspection",
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  <XCircle size={15} />
                  Reject Document
                </button>

                <button
                  type="button"
                  disabled={processingDocId === inspectingDoc.id}
                  onClick={() =>
                    handleDocDecision(
                      inspectingDoc.id,
                      "approved",
                      inspectingNote || "Certificate verified and accepted",
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white hover:bg-[#154a19] shadow-xs transition-colors"
                >
                  <CheckCircle2 size={15} />
                  Approve Document
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <RoleGuard
      allowedRoles={[
        "ADM_SUPER",
        "ADM_SALES_OPS",
        "ADM_STATE_MGR",
        "ADM_SUPPORT",
        "ADM_FINANCE",
      ]}
    >
      <AdminShell>
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-3 border-[#1b5e20] border-t-transparent" />
            </div>
          }
        >
          <PartnerDetailContent id={id} />
        </Suspense>
      </AdminShell>
    </RoleGuard>
  );
}
