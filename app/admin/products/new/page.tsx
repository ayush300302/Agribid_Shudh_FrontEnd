"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Package, ShieldAlert } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import { createProduct, listCategories } from "@/lib/catalog-api";
import type { UnitOfMeasure } from "@/types/catalog";

export default function NewProductPage() {
  const router = useRouter();

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Shudh Brand");
  const [categoryId, setCategoryId] = useState("cat-1");
  const [hsnCode, setHsnCode] = useState("");
  const [uom, setUom] = useState<UnitOfMeasure>("BAG");
  const [weightKg, setWeightKg] = useState("");
  const [mrp, setMrp] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["catalog-categories"],
    queryFn: () => listCategories(),
  });

  const categories = categoriesQuery.data || [];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await createProduct({
        sku: sku.toUpperCase().trim(),
        name: name.trim(),
        brand: brand.trim(),
        category_id: categoryId,
        hsn_code: hsnCode.trim(),
        uom,
        weight_grams: weightKg ? Math.round(Number(weightKg) * 1000) : undefined,
        mrp: mrp ? Number(mrp) : undefined,
        description: description.trim() || undefined,
      });

      router.push("/admin/products");
    } catch (err) {
      setErrorMessage(
        (err as Error).message ||
          "Failed to onboard product SKU. Please verify form details.",
      );
    } finally {
      setSubmitting(false);
    }
  }

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
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-[#64766a]">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 font-medium hover:text-[#1b5e20] transition-colors"
            >
              <ArrowLeft size={14} /> Back to Catalog
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#19392a]">Create New SKU</span>
          </div>

          {/* Form Header */}
          <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-[#1b5e20]/10 p-2 text-[#1b5e20]">
                <Package size={24} />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-[#19392a]">
                  Onboard Commodity SKU
                </h1>
                <p className="mt-1 text-sm text-[#64766a]">
                  Register a standardized agricultural product SKU, packaging unit, and HSN tax code into the master catalog.
                </p>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage ? (
            <div className="flex items-center gap-2 rounded-md border border-[#f5c2c7] bg-[#f8d7da] p-4 text-sm text-[#842029]">
              <ShieldAlert size={18} />
              <span>{errorMessage}</span>
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: SKU & Identification */}
            <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-[#19392a] border-b border-[#e8eee9] pb-3">
                1. SKU & Commodity Identification
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="sku"
                    className="block text-sm font-medium text-[#31483a]"
                  >
                    Standard SKU Code *
                  </label>
                  <input
                    id="sku"
                    type="text"
                    required
                    placeholder="e.g. RICE-SONA-MAS-25KG"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 font-mono text-sm text-[#19392a] uppercase outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                  />
                  <p className="mt-1 text-xs text-[#64766a]">
                    Unique enterprise identifier for warehousing & orders.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-medium text-[#31483a]"
                  >
                    Commodity Category *
                  </label>
                  <select
                    id="categoryId"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="cat-1">Rice & Grains</option>
                        <option value="cat-2">Edible Oils</option>
                        <option value="cat-3">Pulses & Dals</option>
                        <option value="cat-4">Sugar & Sweeteners</option>
                        <option value="cat-5">Fertilizers & Agri Inputs</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[#31483a]"
                  >
                    Full Product Title *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="e.g. Shudh Sona Masoori Raw Rice 25KG"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="brand"
                    className="block text-sm font-medium text-[#31483a]"
                  >
                    Brand Line
                  </label>
                  <input
                    id="brand"
                    type="text"
                    placeholder="e.g. Shudh Brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hsnCode"
                    className="block text-sm font-medium text-[#31483a]"
                  >
                    HSN Tax Code (4–8 Digits) *
                  </label>
                  <input
                    id="hsnCode"
                    type="text"
                    required
                    maxLength={8}
                    placeholder="e.g. 10063090"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 font-mono text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Packaging & Pricing */}
            <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-[#19392a] border-b border-[#e8eee9] pb-3">
                2. Packaging, Logistics & Pricing
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="uom"
                    className="block text-sm font-medium text-[#31483a]"
                  >
                    Unit of Measure (UOM) *
                  </label>
                  <select
                    id="uom"
                    value={uom}
                    onChange={(e) => setUom(e.target.value as UnitOfMeasure)}
                    required
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                  >
                    <option value="BAG">BAG · Bulk Sacks / Gunny</option>
                    <option value="TIN">TIN · Metal Oil Containers</option>
                    <option value="PACK">PACK · Consumer Pouches</option>
                    <option value="SACK">SACK · Jute Bags</option>
                    <option value="QUINTAL">QUINTAL · 100 KG Wholesale</option>
                    <option value="MT">MT · Metric Tonne</option>
                    <option value="KG">KG · Kilogram</option>
                    <option value="LITER">LITER · Fluid Volume</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="weightKg"
                    className="block text-sm font-medium text-[#31483a]"
                  >
                    Net Weight (KG)
                  </label>
                  <input
                    id="weightKg"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 25.0"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                  />
                  <p className="mt-1 text-xs text-[#64766a]">
                    Used for freight & delivery truck calculations.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="mrp"
                    className="block text-sm font-medium text-[#31483a]"
                  >
                    Printed MRP (₹)
                  </label>
                  <input
                    id="mrp"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1450"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                  />
                  <p className="mt-1 text-xs text-[#64766a]">
                    Pack retail price cap.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-[#31483a]"
                >
                  Commodity Description & Notes
                </label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Grain grade, processing details, moisture levels, harvest year..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 w-full rounded-md border border-[#cbd8ce] p-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/admin/products"
                className="rounded-md border border-[#cbd8ce] bg-white px-5 py-2.5 text-sm font-medium text-[#19392a] shadow-xs hover:bg-[#f1f5f1] transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-md bg-[#1b5e20] px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#154a19] disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 size={16} />
                {submitting ? "Onboarding SKU..." : "Save & Onboard SKU"}
              </button>
            </div>
          </form>
        </div>
      </AdminShell>
    </RoleGuard>
  );
}

