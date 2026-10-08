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
  FileText,
  MapPin,
  Network,
  ShieldCheck,
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
import type { KYCDocType } from "@/types/partner";

function formatDocTitle(type: KYCDocType): string {
  switch (type) {
    case "gst_certificate":
      return "GSTIN Registration Certificate";
    case "pan_card":
      return "Proprietor / Firm PAN Card";
    case "business_license":
      return "Fertilizer / Trade License (FSSAI/Agri)";
    case "bank_details":
      return "Bank Verification / Cancelled Cheque";
    case "address_proof":
      return "Shop / Warehouse Address Proof";
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

  async function handleKycDecision(status: "approved" | "rejected") {
    setSubmittingReview(true);
    setReviewFeedback(null);
    try {
      await reviewPartnerKyc(id, { status, review_note: reviewNote });
      setReviewFeedback(`KYC successfully marked as ${status.toUpperCase()}!`);
      kycQuery.refetch();
      partnerQuery.refetch();
    } catch {
      setReviewFeedback("Failed to update KYC status. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
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
            <div className="border-b border-[#dce5dd] bg-[#f9fbf9] px-6 py-4">
              <h3 className="text-sm font-semibold text-[#19392a]">
                Compliance Verification Documents
              </h3>
              <p className="text-xs text-[#64766a]">
                Inspect uploaded legal certificates before approving or rejecting partner status.
              </p>
            </div>

            <div className="divide-y divide-[#e8eee9]">
              {kycDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-[#e9f1e9] p-2 text-[#1b5e20]">
                      <FileText size={20} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#19392a]">
                        {formatDocTitle(doc.doc_type)}
                      </p>
                      <p className="text-xs text-[#64766a]">
                        Submitted: {new Date(doc.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-md border px-2.5 py-0.5 text-xs font-medium capitalize ${
                        doc.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : doc.status === "rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {doc.status}
                    </span>

                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1b5e20] hover:underline"
                    >
                      View Document <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Review Action Panel */}
          <div className="rounded-lg border border-[#cbd8ce] bg-white p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-[#19392a]">
              Administrative Decision & Review Notes
            </h3>
            <p className="mt-1 text-xs text-[#64766a]">
              Provide compliance feedback. Approving activates the account in the distribution network.
            </p>

            {reviewFeedback ? (
              <div className="mt-4 rounded-md border border-[#c3e6cb] bg-[#d4edda] p-3 text-sm text-[#155724]">
                {reviewFeedback}
              </div>
            ) : null}

            <div className="mt-4">
              <label
                htmlFor="reviewNote"
                className="block text-xs font-medium text-[#31483a]"
              >
                Compliance Officer Comments / Rejection Reason
              </label>
              <textarea
                id="reviewNote"
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Enter compliance verification remarks..."
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
                <CheckCircle2 size={16} /> Approve KYC
              </button>

              <button
                type="button"
                disabled={submittingReview}
                onClick={() => handleKycDecision("rejected")}
                className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                <XCircle size={16} /> Reject with Remarks
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

