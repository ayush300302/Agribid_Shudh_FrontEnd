"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Gavel,
  History,
  Image as ImageIcon,
  PackageMinus,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Shuffle,
  Truck,
  User,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import {
  adminResolveClaim,
  decideClaim,
  escalateClaim,
  listClaims,
  raiseClaim,
} from "@/lib/claim-api";
import { listOrders } from "@/lib/order-api";
import type {
  AdminResolveClaimRequest,
  Claim,
  ClaimResolution,
  ClaimStatus,
  ClaimType,
  DecideClaimRequest,
  RaiseClaimRequest,
} from "@/types/claim";

function formatINR(val: number) {
  return "₹" + Number(val || 0).toLocaleString("en-IN");
}

function getClaimTypeBadge(type: ClaimType) {
  switch (type) {
    case "DAMAGE":
      return {
        label: "Goods Damaged",
        className: "bg-rose-50 text-rose-800 border-rose-200",
        icon: AlertTriangle,
      };
    case "SHORTAGE":
      return {
        label: "Quantity Shortage",
        className: "bg-blue-50 text-blue-800 border-blue-200",
        icon: PackageMinus,
      };
    case "WRONG_ITEM":
      return {
        label: "Wrong SKU Dispatched",
        className: "bg-purple-50 text-purple-800 border-purple-200",
        icon: Shuffle,
      };
    case "QUALITY":
      return {
        label: "Quality / Grading Issue",
        className: "bg-teal-50 text-teal-800 border-teal-200",
        icon: ShieldCheck,
      };
    case "EXPIRY":
      return {
        label: "Expired / Near Expiry",
        className: "bg-amber-50 text-amber-800 border-amber-200",
        icon: Clock,
      };
    default:
      return {
        label: type,
        className: "bg-slate-50 text-slate-800 border-slate-200",
        icon: FileText,
      };
  }
}

function getClaimStatusBadge(status: ClaimStatus) {
  switch (status) {
    case "OPEN":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "APPROVED":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "PARTIALLY_APPROVED":
      return "bg-teal-50 text-teal-800 border-teal-200";
    case "REJECTED":
      return "bg-red-50 text-red-800 border-red-200";
    case "ESCALATED":
      return "bg-rose-50 text-rose-800 border-rose-200 animate-pulse font-bold";
    case "CLOSED":
    default:
      return "bg-slate-50 text-slate-800 border-slate-200";
  }
}

export default function ClaimsConsolePage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals & Drawers state
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Seller Decision form state
  const [decideAction, setDecideAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [decideResolution, setDecideResolution] = useState<ClaimResolution>("CREDIT_NOTE");
  const [decideNote, setDecideNote] = useState<string>("");
  const [decideError, setDecideError] = useState<string | null>(null);

  // Admin Arbitration form state
  const [adminAction, setAdminAction] = useState<"ISSUE_CREDIT_NOTE" | "OVERRULE_REJECT">("ISSUE_CREDIT_NOTE");
  const [adminNote, setAdminNote] = useState<string>("");
  const [adminError, setAdminError] = useState<string | null>(null);

  // Escalation form state
  const [escalateReason, setEscalateReason] = useState<string>("");
  const [showEscalatePrompt, setShowEscalatePrompt] = useState(false);

  // Raise Claim form state
  const [formOrderId, setFormOrderId] = useState<string>("ord-001");
  const [formType, setFormType] = useState<ClaimType>("DAMAGE");
  const [formPhysicalReturn, setFormPhysicalReturn] = useState(false);
  const [formProductSku, setFormProductSku] = useState("RICE-BAS-PRM-50KG");
  const [formDeliveredQty, setFormDeliveredQty] = useState("50");
  const [formClaimedQty, setFormClaimedQty] = useState("2");
  const [formUnitPrice, setFormUnitPrice] = useState("3800");
  const [formReason, setFormReason] = useState("");
  const [formPhotoUrl, setFormPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
  );
  const [raiseError, setRaiseError] = useState<string | null>(null);

  // Queries
  const { data: claims = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["claims-list"],
    queryFn: () => listClaims(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders-for-claims"],
    queryFn: () => listOrders(),
  });

  // Mutations
  const decideMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DecideClaimRequest }) =>
      decideClaim(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["claims-list"] });
      queryClient.invalidateQueries({ queryKey: ["payments-list"] });
      queryClient.invalidateQueries({ queryKey: ["credit-accounts-all"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      setSelectedClaim(updated);
      setDecideNote("");
    },
    onError: (err: any) => {
      setDecideError(err.message || "Failed to submit decision");
    },
  });

  const escalateMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      escalateClaim(id, { reason }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["claims-list"] });
      setSelectedClaim(updated);
      setShowEscalatePrompt(false);
      setEscalateReason("");
    },
  });

  const adminResolveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminResolveClaimRequest }) =>
      adminResolveClaim(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["claims-list"] });
      queryClient.invalidateQueries({ queryKey: ["credit-accounts-all"] });
      setSelectedClaim(updated);
      setAdminNote("");
    },
    onError: (err: any) => {
      setAdminError(err.message || "Failed to resolve arbitration");
    },
  });

  const raiseMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: RaiseClaimRequest }) =>
      raiseClaim(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims-list"] });
      setShowRaiseModal(false);
      resetRaiseForm();
    },
    onError: (err: any) => {
      setRaiseError(err.message || "Failed to raise claim");
    },
  });

  function resetRaiseForm() {
    setFormOrderId("ord-001");
    setFormType("DAMAGE");
    setFormPhysicalReturn(false);
    setFormClaimedQty("2");
    setFormReason("");
    setRaiseError(null);
  }

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      if (activeTab === "OPEN" && c.status !== "OPEN") return false;
      if (activeTab === "ESCALATED" && !c.is_escalated) return false;
      if (activeTab === "APPROVED" && c.status !== "APPROVED" && c.status !== "PARTIALLY_APPROVED") return false;
      if (activeTab === "REJECTED" && c.status !== "REJECTED") return false;

      if (selectedType !== "ALL" && c.type !== selectedType) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNo = c.claim_no.toLowerCase().includes(q);
        const matchOrder = c.order_number.toLowerCase().includes(q);
        const matchBuyer = c.buyer_name.toLowerCase().includes(q);
        const matchSeller = c.seller_name.toLowerCase().includes(q);
        if (!matchNo && !matchOrder && !matchBuyer && !matchSeller) return false;
      }
      return true;
    });
  }, [claims, activeTab, selectedType, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalClaimed = 0;
    let openCount = 0;
    let escalatedCount = 0;
    let approvedCount = 0;

    claims.forEach((c) => {
      totalClaimed += c.total_claimed_amount;
      if (c.status === "OPEN") openCount++;
      if (c.is_escalated) escalatedCount++;
      if (c.status === "APPROVED" || c.status === "PARTIALLY_APPROVED") approvedCount++;
    });

    return {
      totalCount: claims.length,
      totalClaimed,
      openCount,
      escalatedCount,
      approvedCount,
    };
  }, [claims]);

  // Handler to Raise Claim
  const handleRaiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRaiseError(null);

    const claimedQtyNum = parseFloat(formClaimedQty);
    const deliveredQtyNum = parseFloat(formDeliveredQty);
    const unitPriceNum = parseFloat(formUnitPrice);

    if (isNaN(claimedQtyNum) || claimedQtyNum <= 0) {
      setRaiseError("Claimed quantity must be greater than zero.");
      return;
    }

    if (claimedQtyNum > deliveredQtyNum) {
      setRaiseError(`Claimed quantity (${claimedQtyNum}) cannot exceed delivered quantity (${deliveredQtyNum}).`);
      return;
    }

    if ((formType === "DAMAGE" || formType === "WRONG_ITEM" || formType === "QUALITY") && !formPhotoUrl.trim()) {
      setRaiseError("At least one photo evidence is mandatory for damage, wrong item, or quality claims (Rule RC-02).");
      return;
    }

    raiseMutation.mutate({
      orderId: formOrderId,
      data: {
        order_id: formOrderId,
        type: formType,
        physical_return: formPhysicalReturn,
        lines: [
          {
            product_id: "prod-1",
            sku: formProductSku,
            product_name: "Shudh Premium 1121 Basmati Rice",
            uom: "BAG",
            unit_price: unitPriceNum,
            delivered_qty: deliveredQtyNum,
            claimed_qty: claimedQtyNum,
            reason: formReason.trim() || "Goods damaged during unloading.",
            photos: formPhotoUrl ? [formPhotoUrl.trim()] : [],
          },
        ],
      },
    });
  };

  return (
    <RoleGuard allowedRoles={["admin", "state_stockist", "distributor", "warehouse_manager"]}>
      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-[#1b5e20]/10 p-2 text-[#1b5e20]">
                  <RotateCcw size={22} />
                </span>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#19392a]">
                    Returns & Claims Console
                  </h1>
                  <p className="mt-0.5 text-sm text-[#64766a]">
                    Post-delivery shortage, damage & wrong SKU claims, photo evidence inspection, Credit Notes, and Admin arbitration.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/invoices"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
              >
                <FileText size={14} className="text-[#1b5e20]" />
                Invoices & Credit Notes
              </Link>

              <button
                type="button"
                onClick={() => setShowRaiseModal(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] transition-colors"
              >
                <Plus size={14} /> Raise Claim (Assisted)
              </button>
            </div>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#64766a]">Total Filed Claims</span>
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <RotateCcw size={16} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-[#19392a]">
                {metrics.totalCount}
              </p>
              <p className="mt-1 text-xs text-[#64766a]">
                Total Claim Value: {formatINR(metrics.totalClaimed)}
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-800">Open for Review</span>
                <span className="rounded-md bg-amber-100 p-1.5 text-amber-700">
                  <Clock size={16} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-amber-900">
                {metrics.openCount}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Seller review SLA: 48 hours
              </p>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-rose-800">Admin Escalations</span>
                <span className="rounded-md bg-rose-100 p-1.5 text-rose-700">
                  <Gavel size={16} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-rose-900">
                {metrics.escalatedCount}
              </p>
              <p className="mt-1 text-xs text-rose-700">
                Disputes awaiting central arbitration
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-800">Settled & Approved</span>
                <span className="rounded-md bg-emerald-100 p-1.5 text-emerald-700">
                  <CheckCircle2 size={16} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-900">
                {metrics.approvedCount}
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                Credit Notes & replacements issued
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "ALL", label: `All Claims (${claims.length})` },
                  { id: "OPEN", label: `Open (${metrics.openCount})` },
                  { id: "ESCALATED", label: `Escalations (${metrics.escalatedCount})` },
                  { id: "APPROVED", label: "Approved" },
                  { id: "REJECTED", label: "Rejected" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeTab === tab.id
                        ? "bg-[#1b5e20] text-white shadow-xs"
                        : "text-[#64766a] hover:bg-[#f1f5f1] hover:text-[#19392a]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
                <div className="w-full sm:w-auto min-w-[170px]">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full rounded-md border border-[#dce5dd] bg-white px-3 py-1.5 text-xs font-medium text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                  >
                    <option value="ALL">All Claim Types</option>
                    <option value="DAMAGE">Damage</option>
                    <option value="SHORTAGE">Shortage</option>
                    <option value="WRONG_ITEM">Wrong SKU</option>
                    <option value="QUALITY">Quality</option>
                    <option value="EXPIRY">Expiry</option>
                  </select>
                </div>

                <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64766a]"
                  />
                  <input
                    type="text"
                    placeholder="Search claim #, order, partner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-[#dce5dd] bg-white py-1.5 pl-8 pr-3 text-xs text-[#19392a] placeholder-[#64766a]/60 focus:border-[#1b5e20] focus:outline-hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="inline-flex items-center gap-1 rounded-md border border-[#dce5dd] bg-white p-2 text-xs text-[#64766a] hover:bg-[#f1f5f1]"
                  title="Refresh"
                >
                  <RefreshCw size={14} className={isRefetching ? "animate-spin text-[#1b5e20]" : ""} />
                </button>
              </div>
            </div>
          </div>

          {/* Claims Table */}
          <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
            <div className="border-b border-[#dce5dd] bg-[#f8faf8] px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#19392a]">
                  Claims Registry ({filteredClaims.length})
                </h2>
                <span className="text-xs text-[#64766a]">
                  SLA Rule RC-04: Seller 48h decision window
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <RefreshCw size={24} className="animate-spin text-[#1b5e20]" />
                <p className="mt-3 text-xs font-medium text-[#64766a]">Loading claims...</p>
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <RotateCcw size={36} className="text-[#64766a]/40" />
                <h3 className="mt-3 text-sm font-bold text-[#19392a]">No claims found</h3>
                <p className="mt-1 text-xs text-[#64766a]">
                  Try modifying your filter tab or search keywords.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#dce5dd] bg-[#f1f5f1]/60 text-[11px] font-semibold tracking-wider text-[#64766a] uppercase">
                    <tr>
                      <th scope="col" className="px-4 py-3 sm:px-6">Claim # & Order</th>
                      <th scope="col" className="px-4 py-3">Buyer Partner</th>
                      <th scope="col" className="px-4 py-3">Claim Type</th>
                      <th scope="col" className="px-4 py-3 text-right">Claim Value</th>
                      <th scope="col" className="px-4 py-3">SLA / Dispute</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3 sm:px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dce5dd]">
                    {filteredClaims.map((c) => {
                      const typeBadge = getClaimTypeBadge(c.type);
                      const TypeIcon = typeBadge.icon;
                      const formattedDate = new Date(c.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });

                      return (
                        <tr key={c.id} className="hover:bg-[#f8faf8] transition-colors">
                          {/* Claim # & Order */}
                          <td className="px-4 py-3.5 sm:px-6">
                            <div className="flex flex-col">
                              <span className="font-mono font-bold text-[#19392a]">
                                {c.claim_no}
                              </span>
                              <span className="font-mono text-[11px] text-[#1b5e20] font-medium">
                                {c.order_number}
                              </span>
                              <span className="text-[10px] text-[#64766a] mt-0.5">
                                Filed: {formattedDate}
                              </span>
                            </div>
                          </td>

                          {/* Buyer Partner */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#19392a]">
                                {c.buyer_name}
                              </span>
                              <span className="text-[10px] uppercase font-mono text-[#64766a]">
                                {c.buyer_tier.replace("_", " ")}
                              </span>
                            </div>
                          </td>

                          {/* Claim Type */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${typeBadge.className}`}
                            >
                              <TypeIcon size={12} />
                              {typeBadge.label}
                            </span>
                          </td>

                          {/* Claim Value */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <span className="font-mono font-bold text-sm text-[#19392a]">
                              {formatINR(c.total_claimed_amount)}
                            </span>
                            {c.total_approved_amount > 0 && (
                              <div className="text-[10px] font-mono font-bold text-[#1b5e20]">
                                Apprv: {formatINR(c.total_approved_amount)}
                              </div>
                            )}
                          </td>

                          {/* SLA / Dispute */}
                          <td className="px-4 py-3.5">
                            {c.is_escalated ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <Gavel size={12} />
                                Escalated to Admin
                              </span>
                            ) : c.status === "OPEN" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700">
                                <Clock size={11} />
                                48h SLA Active
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#64766a]">SLA Settled</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col gap-1 items-start">
                              <span
                                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getClaimStatusBadge(
                                  c.status,
                                )}`}
                              >
                                {c.status}
                              </span>
                              {c.credit_note_number && (
                                <span className="font-mono text-[10px] text-[#1b5e20] font-bold">
                                  CN: {c.credit_note_number}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3.5 sm:px-6 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedClaim(c);
                                setDecideAction("APPROVE");
                                setDecideResolution("CREDIT_NOTE");
                                setDecideNote("");
                                setDecideError(null);
                                setAdminNote("");
                                setAdminError(null);
                              }}
                              className="inline-flex items-center gap-1 rounded-md bg-white border border-[#dce5dd] px-2.5 py-1 text-[11px] font-semibold text-[#19392a] hover:bg-[#f1f5f1] transition-colors"
                            >
                              <Eye size={12} className="text-[#1b5e20]" />
                              Inspect / Decide
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Claim Review & Decision Modal */}
        {selectedClaim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-xl border border-[#dce5dd] bg-white p-6 shadow-2xl my-8">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="absolute right-4 top-4 text-[#64766a] hover:text-[#19392a]"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="border-b border-[#dce5dd] pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#1b5e20]/10 p-2 text-[#1b5e20]">
                      <RotateCcw size={20} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-[#19392a]">
                          {selectedClaim.claim_no}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getClaimStatusBadge(
                            selectedClaim.status,
                          )}`}
                        >
                          {selectedClaim.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#64766a]">
                        PO: {selectedClaim.order_number} · Invoice: {selectedClaim.invoice_number || "INV-001"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#64766a]">Claim Value:</span>
                    <p className="font-mono font-bold text-lg text-[#19392a]">
                      {formatINR(selectedClaim.total_claimed_amount)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-[#f8faf8] p-3 rounded-lg border border-[#dce5dd]">
                  <div>
                    <span className="text-[#64766a]">Buyer (Claimant):</span>
                    <p className="font-semibold text-[#19392a]">
                      {selectedClaim.buyer_name} ({selectedClaim.buyer_tier})
                    </p>
                  </div>
                  <div>
                    <span className="text-[#64766a]">Seller:</span>
                    <p className="font-semibold text-[#19392a]">
                      {selectedClaim.seller_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Line Items & Evidence */}
              <div className="mt-4 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#19392a]">
                  Claim Line Items & Photo Evidence (Rule RC-02)
                </h4>

                {selectedClaim.lines.map((line) => (
                  <div
                    key={line.id}
                    className="rounded-lg border border-[#dce5dd] p-3 bg-white space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-xs text-[#19392a]">
                          {line.sku}
                        </span>
                        <p className="text-xs text-[#64766a]">{line.product_name}</p>
                      </div>
                      <div className="text-right text-xs">
                        <span className="text-[#64766a]">Claimed: </span>
                        <span className="font-bold text-rose-700">
                          {line.claimed_qty} {line.uom}
                        </span>
                        <span className="text-[#64766a] text-[11px]"> / {line.delivered_qty} delivered</span>
                      </div>
                    </div>

                    <div className="rounded-md bg-[#f1f5f1]/60 p-2 text-xs text-[#19392a]">
                      <span className="font-semibold text-[#64766a]">Reason: </span>
                      {line.reason}
                    </div>

                    {/* Photos */}
                    {line.photos && line.photos.length > 0 ? (
                      <div className="pt-2">
                        <span className="text-[11px] font-semibold text-[#64766a] flex items-center gap-1">
                          <ImageIcon size={12} />
                          Attached Photographic Evidence:
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {line.photos.map((photo, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => setPreviewPhoto(photo)}
                              className="group relative overflow-hidden rounded-md border border-[#dce5dd] hover:border-[#1b5e20] transition-colors"
                            >
                              <img
                                src={photo}
                                alt="Claim damage evidence"
                                className="h-16 w-24 object-cover group-hover:opacity-90 transition-opacity"
                              />
                              <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-semibold">
                                View
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#64766a] italic">
                        No photos attached.
                      </div>
                    )}
                  </div>
                ))}

                {/* If already decided */}
                {selectedClaim.decision_note && (
                  <div className="rounded-lg bg-emerald-50/60 p-3 text-xs border border-emerald-200">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <CheckCircle2 size={14} className="text-emerald-700" />
                      Recorded Decision · {selectedClaim.decided_by}
                    </div>
                    <p className="mt-1 text-emerald-800">{selectedClaim.decision_note}</p>
                    {selectedClaim.credit_note_number && (
                      <p className="mt-1 font-mono font-bold text-emerald-900">
                        Credit Note #{selectedClaim.credit_note_number} posted to ledger.
                      </p>
                    )}
                  </div>
                )}

                {/* Dispute / Escalation section */}
                {selectedClaim.is_escalated && (
                  <div className="rounded-lg bg-rose-50 p-4 border border-rose-200 space-y-3">
                    <div className="flex items-center gap-1.5 font-bold text-rose-900">
                      <Gavel size={16} className="text-rose-700" />
                      Admin Dispute Arbitration Queue
                    </div>
                    <p className="text-xs text-rose-800">
                      <strong>Escalation Grounds:</strong> {selectedClaim.escalation_reason}
                    </p>

                    {adminError && (
                      <div className="rounded-md bg-red-100 p-2 text-xs text-red-800">
                        {adminError}
                      </div>
                    )}

                    <div className="pt-2 border-t border-rose-200 space-y-2">
                      <label className="block text-xs font-semibold text-rose-950">
                        Central QA Arbitration Ruling & Notes *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Weighbridge CCTV verified 5 tins missing in transit. Issue full Credit Note."
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="w-full rounded-md border border-[#dce5dd] bg-white p-2 text-xs text-[#19392a] focus:border-rose-600 focus:outline-hidden"
                      />

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          disabled={!adminNote.trim() || adminResolveMutation.isPending}
                          onClick={() =>
                            adminResolveMutation.mutate({
                              id: selectedClaim.id,
                              data: {
                                action: "OVERRULE_REJECT",
                                note: adminNote.trim(),
                              },
                            })
                          }
                          className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                        >
                          Overrule & Reject
                        </button>

                        <button
                          type="button"
                          disabled={!adminNote.trim() || adminResolveMutation.isPending}
                          onClick={() =>
                            adminResolveMutation.mutate({
                              id: selectedClaim.id,
                              data: {
                                action: "ISSUE_CREDIT_NOTE",
                                resolution: "CREDIT_NOTE",
                                note: adminNote.trim(),
                              },
                            })
                          }
                          className="rounded-md bg-rose-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 shadow-xs disabled:opacity-50"
                        >
                          Issue Central Credit Note
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seller Decision Form (Only if OPEN and NOT escalated) */}
                {selectedClaim.status === "OPEN" && !selectedClaim.is_escalated && (
                  <div className="rounded-lg bg-[#f8faf8] p-4 border border-[#dce5dd] space-y-3">
                    <h5 className="text-xs font-bold text-[#19392a] uppercase tracking-wider">
                      Seller Decision Action Desk
                    </h5>

                    {decideError && (
                      <div className="rounded-md bg-red-50 p-2 text-xs text-red-700 border border-red-200">
                        {decideError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#19392a]">
                          Decision *
                        </label>
                        <select
                          value={decideAction}
                          onChange={(e) => setDecideAction(e.target.value as any)}
                          className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-1.5 text-xs font-medium text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                        >
                          <option value="APPROVE">Approve Full Claim</option>
                          <option value="REJECT">Reject Claim</option>
                        </select>
                      </div>

                      {decideAction === "APPROVE" && (
                        <div>
                          <label className="block text-xs font-semibold text-[#19392a]">
                            Settlement Resolution (Rule RC-03)
                          </label>
                          <select
                            value={decideResolution}
                            onChange={(e) => setDecideResolution(e.target.value as any)}
                            className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-1.5 text-xs font-medium text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                          >
                            <option value="CREDIT_NOTE">Issue GST Credit Note (Credit Ledger)</option>
                            <option value="REPLACEMENT">Dispatch Free Replacement Order</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#19392a]">
                        Decision Justification / Reason *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Damage verified from photos. Issuing credit note per trade agreement."
                        value={decideNote}
                        onChange={(e) => setDecideNote(e.target.value)}
                        className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white p-2 text-xs text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#dce5dd]">
                      <button
                        type="button"
                        onClick={() => setShowEscalatePrompt(true)}
                        className="text-xs font-semibold text-rose-700 hover:underline"
                      >
                        Escalate Dispute to Admin
                      </button>

                      <button
                        type="button"
                        disabled={!decideNote.trim() || decideMutation.isPending}
                        onClick={() =>
                          decideMutation.mutate({
                            id: selectedClaim.id,
                            data: {
                              action: decideAction,
                              resolution: decideAction === "APPROVE" ? decideResolution : undefined,
                              note: decideNote.trim(),
                            },
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50"
                      >
                        {decideMutation.isPending ? "Executing..." : "Submit Decision"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Buyer Escalation Prompt */}
                {showEscalatePrompt && (
                  <div className="rounded-lg bg-rose-50 p-3 border border-rose-200 space-y-2">
                    <span className="text-xs font-bold text-rose-900">
                      Escalate to Admin for Central Arbitration
                    </span>
                    <input
                      type="text"
                      placeholder="Enter dispute justification grounds..."
                      value={escalateReason}
                      onChange={(e) => setEscalateReason(e.target.value)}
                      className="w-full rounded-md border border-rose-300 bg-white p-2 text-xs text-[#19392a]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowEscalatePrompt(false)}
                        className="text-xs text-[#64766a] hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!escalateReason.trim() || escalateMutation.isPending}
                        onClick={() =>
                          escalateMutation.mutate({
                            id: selectedClaim.id,
                            reason: escalateReason.trim(),
                          })
                        }
                        className="rounded-md bg-rose-700 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-800 disabled:opacity-50"
                      >
                        Confirm Escalation
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end pt-3 border-t border-[#dce5dd]">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="rounded-md border border-[#dce5dd] px-4 py-2 text-xs font-semibold text-[#19392a] hover:bg-[#f1f5f1]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Photo Preview Modal */}
        {previewPhoto && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
            <div className="relative max-w-2xl rounded-xl bg-white p-2 shadow-2xl">
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="absolute right-4 top-4 rounded-full bg-black/60 p-1.5 text-white hover:bg-black"
              >
                <X size={16} />
              </button>
              <img
                src={previewPhoto}
                alt="Enlarged claim evidence"
                className="max-h-[80vh] w-auto rounded-lg object-contain"
              />
            </div>
          </div>
        )}

        {/* Raise Claim Modal */}
        {showRaiseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-lg rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setShowRaiseModal(false);
                  resetRaiseForm();
                }}
                className="absolute right-4 top-4 text-[#64766a] hover:text-[#19392a]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#1b5e20]/10 p-1.5 text-[#1b5e20]">
                  <RotateCcw size={18} />
                </span>
                <h3 className="text-lg font-bold text-[#19392a]">
                  Raise Customer Claim (Assisted)
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#64766a]">
                File claim for damaged, short, or wrong items within 48h delivery window (Rule RC-01).
              </p>

              {raiseError && (
                <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{raiseError}</span>
                </div>
              )}

              <form onSubmit={handleRaiseSubmit} className="mt-4 space-y-4">
                {/* Order Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#19392a]">
                    Select Order / PO *
                  </label>
                  <select
                    value={formOrderId}
                    onChange={(e) => setFormOrderId(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                  >
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.order_number} · {o.buyer_name} ({o.status === "delivered" ? "Delivered ✓" : "In Transit"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Claim Type */}
                  <div>
                    <label className="block text-xs font-semibold text-[#19392a]">
                      Claim Type *
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as ClaimType)}
                      className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                    >
                      <option value="DAMAGE">Goods Damaged</option>
                      <option value="SHORTAGE">Quantity Shortage</option>
                      <option value="WRONG_ITEM">Wrong SKU</option>
                      <option value="QUALITY">Quality / Grading</option>
                      <option value="EXPIRY">Expiry Issue</option>
                    </select>
                  </div>

                  {/* Claimed Qty */}
                  <div>
                    <label className="block text-xs font-semibold text-[#19392a]">
                      Claimed Quantity (Bags / Tins) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={formClaimedQty}
                      onChange={(e) => setFormClaimedQty(e.target.value)}
                      required
                      className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-mono font-semibold text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Photo Evidence input (Rule RC-02) */}
                <div>
                  <label className="block text-xs font-semibold text-[#19392a]">
                    Photo Evidence URL * (Rule RC-02)
                  </label>
                  <input
                    type="url"
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    required={formType === "DAMAGE" || formType === "WRONG_ITEM" || formType === "QUALITY"}
                    className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white px-3 py-2 text-xs font-mono text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                  />
                  <p className="mt-1 text-[11px] text-[#64766a]">
                    Mandatory for Damage, Wrong SKU, and Quality complaints.
                  </p>
                </div>

                {/* Reason description */}
                <div>
                  <label className="block text-xs font-semibold text-[#19392a]">
                    Detailed Description / Reason *
                  </label>
                  <textarea
                    rows={2}
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    placeholder="Describe specific damage or shortage noted on delivery unloading..."
                    required
                    className="mt-1 w-full rounded-md border border-[#dce5dd] bg-white p-2 text-xs text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                  />
                </div>

                {/* Physical return toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="phys-ret"
                    checked={formPhysicalReturn}
                    onChange={(e) => setFormPhysicalReturn(e.target.checked)}
                    className="rounded border-[#dce5dd] text-[#1b5e20] focus:ring-[#1b5e20]"
                  />
                  <label htmlFor="phys-ret" className="text-xs font-medium text-[#19392a]">
                    Physical return expected at warehouse (goods will be brought back)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#dce5dd]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRaiseModal(false);
                      resetRaiseForm();
                    }}
                    className="rounded-md border border-[#dce5dd] px-4 py-2 text-xs font-semibold text-[#64766a] hover:bg-[#f1f5f1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={raiseMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50"
                  >
                    {raiseMutation.isPending ? "Submitting..." : "File Claim"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminShell>
    </RoleGuard>
  );
}
