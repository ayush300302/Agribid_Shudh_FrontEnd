"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Package,
  Scale,
  ShieldCheck,
  Tag,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import { getProductById, setProductStatus } from "@/lib/catalog-api";
import type { ProductStatus } from "@/types/catalog";

function getStatusBadge(status: ProductStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "inactive":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "discontinued":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function ProductDetailContent({ id }: { id: string }) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  const product = productQuery.data;

  async function handleStatusChange(newStatus: ProductStatus) {
    setUpdatingStatus(true);
    setStatusFeedback(null);
    try {
      await setProductStatus(id, newStatus);
      setStatusFeedback(`Product status successfully updated to ${newStatus.toUpperCase()}!`);
      productQuery.refetch();
    } catch {
      setStatusFeedback("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#64766a]">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 font-medium hover:text-[#1b5e20] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
        <span>/</span>
        <span className="font-mono text-[#19392a]">{product?.sku || id}</span>
      </div>

      {/* Hero Header */}
      {productQuery.isLoading ? (
        <div className="h-28 rounded-lg bg-white border border-[#dce5dd] animate-pulse" />
      ) : product ? (
        <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#1b5e20] bg-[#e9f1e9] px-2.5 py-1 rounded">
                  {product.sku}
                </span>
                <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-blue-800 border border-blue-200">
                  {product.category_name || "Commodity"}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-[#19392a]">
                {product.name}
              </h1>
              <p className="mt-1 text-sm text-[#64766a]">
                Brand: <span className="font-medium text-[#19392a]">{product.brand || "Agribid Shudh"}</span>
              </p>
            </div>

            <div>
              <span
                className={`rounded-md border px-3.5 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusBadge(
                  product.status,
                )}`}
              >
                {product.status}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Grid */}
      {product ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Specifications & Tax */}
          <div className="space-y-6 lg:col-span-2">
            {/* Packaging & Logistics Specs */}
            <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-[#19392a] border-b border-[#e8eee9] pb-3 flex items-center gap-2">
                <Scale size={18} className="text-[#1b5e20]" />
                Packaging & Physical Specifications
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
                <div className="rounded-md bg-[#f9fbf9] p-3 border border-[#e8eee9]">
                  <p className="text-xs text-[#64766a]">Unit of Measure (UOM)</p>
                  <p className="mt-1 font-semibold text-base text-[#19392a]">
                    {product.uom || "BAG"}
                  </p>
                  <p className="text-[11px] text-[#87958b]">Standard bulk container</p>
                </div>

                <div className="rounded-md bg-[#f9fbf9] p-3 border border-[#e8eee9]">
                  <p className="text-xs text-[#64766a]">Net Weight</p>
                  <p className="mt-1 font-semibold text-base text-[#19392a]">
                    {product.weight_grams ? `${(product.weight_grams / 1000).toFixed(1)} KG` : "—"}
                  </p>
                  <p className="text-[11px] text-[#87958b]">For truck capacity calculation</p>
                </div>

                <div className="rounded-md bg-[#f9fbf9] p-3 border border-[#e8eee9]">
                  <p className="text-xs text-[#64766a]">Maximum Retail Price (MRP)</p>
                  <p className="mt-1 font-semibold text-base text-[#19392a]">
                    {product.mrp ? `₹${product.mrp.toLocaleString("en-IN")}` : "—"}
                  </p>
                  <p className="text-[11px] text-[#87958b]">Printed pack MRP</p>
                </div>
              </div>
            </div>

            {/* Tax & Legal Compliance */}
            <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-[#19392a] border-b border-[#e8eee9] pb-3 flex items-center gap-2">
                <FileText size={18} className="text-[#1b5e20]" />
                Tax Classification & GST Compliance
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                <div className="rounded-md bg-[#f9fbf9] p-3 border border-[#e8eee9]">
                  <p className="text-xs text-[#64766a]">HSN Code (8 Digits)</p>
                  <p className="mt-1 font-mono font-semibold text-base text-[#1b5e20]">
                    {product.hsn_code}
                  </p>
                  <p className="text-[11px] text-[#87958b]">
                    Harmonized System of Nomenclature for GST
                  </p>
                </div>

                <div className="rounded-md bg-[#f9fbf9] p-3 border border-[#e8eee9]">
                  <p className="text-xs text-[#64766a]">Applicable GST Rate</p>
                  <p className="mt-1 font-semibold text-base text-[#19392a]">
                    5% GST
                  </p>
                  <p className="text-[11px] text-[#87958b]">
                    2.5% CGST + 2.5% SGST (or 5% IGST interstate)
                  </p>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs space-y-3">
              <h2 className="text-base font-semibold text-[#19392a] flex items-center gap-2">
                <Tag size={18} className="text-[#1b5e20]" />
                Commodity Description & Notes
              </h2>
              <p className="text-sm leading-relaxed text-[#31483a]">
                {product.description || "No extended description provided for this SKU."}
              </p>
            </div>
          </div>

          {/* Right Column: Status & Operational Controls */}
          <div className="space-y-6">
            <div className="rounded-lg border border-[#cbd8ce] bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-[#19392a] border-b border-[#e8eee9] pb-3 flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#1b5e20]" />
                Availability & Status Controls
              </h2>

              <p className="text-xs text-[#64766a]">
                Manage the SKU lifecycle. Inactive items cannot be ordered in new purchase orders.
              </p>

              {statusFeedback ? (
                <div className="rounded-md border border-[#c3e6cb] bg-[#d4edda] p-3 text-xs text-[#155724]">
                  {statusFeedback}
                </div>
              ) : null}

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={updatingStatus || product.status === "active"}
                  onClick={() => handleStatusChange("active")}
                  className={`w-full flex items-center justify-between rounded-md px-3.5 py-2.5 text-xs font-semibold border transition-colors ${
                    product.status === "active"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400"
                      : "bg-white text-[#31483a] border-[#cbd8ce] hover:bg-[#f1f5f1]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Active (Ordering Enabled)
                  </span>
                  {product.status === "active" ? (
                    <span className="text-[10px] uppercase font-bold text-emerald-700">Current</span>
                  ) : null}
                </button>

                <button
                  type="button"
                  disabled={updatingStatus || product.status === "inactive"}
                  onClick={() => handleStatusChange("inactive")}
                  className={`w-full flex items-center justify-between rounded-md px-3.5 py-2.5 text-xs font-semibold border transition-colors ${
                    product.status === "inactive"
                      ? "bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400"
                      : "bg-white text-[#31483a] border-[#cbd8ce] hover:bg-[#f1f5f1]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Package size={16} className="text-amber-600" />
                    Inactive (Temporarily Paused)
                  </span>
                  {product.status === "inactive" ? (
                    <span className="text-[10px] uppercase font-bold text-amber-700">Current</span>
                  ) : null}
                </button>

                <button
                  type="button"
                  disabled={updatingStatus || product.status === "discontinued"}
                  onClick={() => handleStatusChange("discontinued")}
                  className={`w-full flex items-center justify-between rounded-md px-3.5 py-2.5 text-xs font-semibold border transition-colors ${
                    product.status === "discontinued"
                      ? "bg-red-50 text-red-800 border-red-300 ring-1 ring-red-400"
                      : "bg-white text-[#31483a] border-[#cbd8ce] hover:bg-[#f1f5f1]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <XCircle size={16} className="text-red-600" />
                    Discontinued (Permanently Retired)
                  </span>
                  {product.status === "discontinued" ? (
                    <span className="text-[10px] uppercase font-bold text-red-700">Current</span>
                  ) : null}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <RoleGuard
      allowedRoles={[
        "ADM_SUPER",
        "ADM_CATALOG",
        "ADM_SALES_OPS",
        "ADM_STATE_MGR",
      ]}
    >
      <AdminShell>
        <ProductDetailContent id={id} />
      </AdminShell>
    </RoleGuard>
  );
}

