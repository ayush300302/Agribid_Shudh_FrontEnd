"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2, ShieldAlert } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AdminShell from "@/components/layout/AdminShell";
import { createPartner } from "@/lib/partner-api";
import type { PartnerType } from "@/types/partner";

export default function NewPartnerPage() {
  const router = useRouter();

  const [type, setType] = useState<PartnerType>("distributor");
  const [businessName, setBusinessName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [stateCode, setStateCode] = useState("27");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await createPartner({
        type,
        business_name: businessName,
        trade_name: tradeName || undefined,
        gstin: gstin ? gstin.toUpperCase() : undefined,
        pan: pan ? pan.toUpperCase() : undefined,
        state_code: stateCode,
        address: {
          line1,
          city,
          state,
          pincode,
        },
      });

      router.push("/admin/partners");
    } catch (err) {
      setErrorMessage(
        (err as Error).message ||
          "Failed to onboard partner. Please verify form details.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RoleGuard
      allowedRoles={["ADM_SUPER", "ADM_SALES_OPS", "ADM_STATE_MGR"]}
    >
      <AdminShell>
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#64766a]">
            <Link
              href="/admin/partners"
              className="inline-flex items-center gap-1 font-medium hover:text-[#1b5e20] transition-colors"
            >
              <ArrowLeft size={14} /> Back to Partners
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#19392a]">Onboard New Partner</span>
          </div>

          {/* Form Header */}
          <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-[#1b5e20]/10 p-2 text-[#1b5e20]">
                <Building2 size={24} />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-[#19392a]">
                  Onboard Supply Chain Partner
                </h1>
                <p className="mt-1 text-sm text-[#64766a]">
                  Register an authorized business entity into the Agribid Shudh distribution hierarchy.
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

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Tier Classification */}
            <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-[#19392a] border-b border-[#e8eee9] pb-3">
                1. Network Tier Classification
              </h2>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-[#31483a]"
                >
                  Partner Tier *
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as PartnerType)}
                  required
                  className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                >
                  <option value="state_stockist">State Stockist (SS) · Apex Regional Node</option>
                  <option value="distributor">Distributor (DS) · District Hub</option>
                  <option value="sub_distributor">Sub-Distributor (SD) · Taluka Level</option>
                  <option value="retailer">Retailer (RT) · Local Agri Shop</option>
                  <option value="manufacturer">Manufacturer (MF) · Source Producer</option>
                  <option value="delivery_partner">Delivery Partner · Logistics Fleet</option>
                </select>
                <p className="mt-1.5 text-xs text-[#64766a]">
                  Tier defines catalog visibility, credit authority, and ordering hierarchy.
                </p>
              </div>
            </div>

            {/* Section 2: Business & Tax Identification */}
            <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-[#19392a] border-b border-[#e8eee9] pb-3">
                2. Business & Tax Identification
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="businessName"
                    className="block text-sm font-medium text-[#31483a]"
                  >
                    Legal Business Name *
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    required
                    placeholder="e.g. Sahyadri Krishi Kendra Pvt Ltd"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tradeName"
                    className="block text-sm font-medium text-[#31483a]"
                  >
                    Trade / Board Name (Optional)
                  </label>
                  <input
                    id="tradeName"
                    type="text"
                    placeholder="e.g. Sahyadri Agro Agency"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gstin"
                    className="block text-sm font-medium text-[#31483a]"
                  >
                    GSTIN Number (15 Digits)
                  </label>
                  <input
                    id="gstin"
                    type="text"
                    maxLength={15}
                    placeholder="27AAPFK5678B1Z2"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 font-mono text-sm text-[#19392a] uppercase outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pan"
                    className="block text-sm font-medium text-[#31483a]"
                  >
                    PAN Number (10 Digits)
                  </label>
                  <input
                    id="pan"
                    type="text"
                    maxLength={10}
                    placeholder="AAPFK5678B"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 font-mono text-sm text-[#19392a] uppercase outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Registered Address */}
            <div className="rounded-lg border border-[#dce5dd] bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-[#19392a] border-b border-[#e8eee9] pb-3">
                3. Physical Location & Shop Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="line1"
                    className="block text-sm font-medium text-[#31483a]"
                  >
                    Shop / Warehouse Address *
                  </label>
                  <input
                    id="line1"
                    type="text"
                    required
                    placeholder="Shop No., Market Yard, APMC Road"
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-[#31483a]"
                    >
                      City / Taluka *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      placeholder="e.g. Nashik"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-[#31483a]"
                    >
                      State *
                    </label>
                    <select
                      id="state"
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        if (e.target.value === "Maharashtra") setStateCode("27");
                        if (e.target.value === "Gujarat") setStateCode("24");
                        if (e.target.value === "Madhya Pradesh") setStateCode("23");
                      }}
                      className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                    >
                      <option value="Maharashtra">Maharashtra (27)</option>
                      <option value="Gujarat">Gujarat (24)</option>
                      <option value="Madhya Pradesh">Madhya Pradesh (23)</option>
                      <option value="Karnataka">Karnataka (29)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="pincode"
                      className="block text-sm font-medium text-[#31483a]"
                    >
                      Pincode *
                    </label>
                    <input
                      id="pincode"
                      type="text"
                      required
                      maxLength={6}
                      placeholder="422003"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="mt-2 h-11 w-full rounded-md border border-[#cbd8ce] bg-white px-3 font-mono text-sm text-[#19392a] outline-none focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit / Cancel Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/admin/partners"
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
                {submitting ? "Onboarding Partner..." : "Register & Onboard Partner"}
              </button>
            </div>
          </form>
        </div>
      </AdminShell>
    </RoleGuard>
  );
}

