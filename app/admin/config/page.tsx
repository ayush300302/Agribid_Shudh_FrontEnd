"use client";

import { useEffect, useState } from "react";
import {
  Sliders,
  ShieldAlert,
  Save,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { listConfigParams, updateConfigParam } from "@/lib/audit-support-api";
import type { ConfigCategory, SystemConfigParam } from "@/types/audit-support";

export default function SystemConfigPage() {
  const [params, setParams] = useState<SystemConfigParam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ConfigCategory | "ALL">("ALL");
  const [search, setSearch] = useState("");

  // Edit State
  const [editingParam, setEditingParam] = useState<SystemConfigParam | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editReason, setEditReason] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadParams = async () => {
    setLoading(true);
    try {
      const data = await listConfigParams(selectedCategory);
      setParams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParams();
  }, [selectedCategory]);

  const handleStartEdit = (param: SystemConfigParam) => {
    setEditingParam(param);
    setEditValue(
      typeof param.value === "object" ? JSON.stringify(param.value, null, 2) : String(param.value),
    );
    setEditReason("");
  };

  const handleSaveEdit = async () => {
    if (!editingParam) return;
    if (!editReason.trim()) {
      alert("Please provide a justification / audit reason for this configuration change.");
      return;
    }

    setSaving(true);
    try {
      let parsedValue: any = editValue;
      if (editingParam.value_type === "number") {
        parsedValue = Number(editValue);
      } else if (editingParam.value_type === "boolean") {
        parsedValue = editValue === "true";
      } else if (editingParam.value_type === "json") {
        parsedValue = JSON.parse(editValue);
      }

      await updateConfigParam(editingParam.key, parsedValue, "Ayush Patil (ADM_SUPER)", editReason);
      setSuccessToast(`Updated ${editingParam.key} successfully. Audit trail logged.`);
      setTimeout(() => setSuccessToast(null), 4000);
      setEditingParam(null);
      loadParams();
    } catch (err: any) {
      alert(err.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const filteredParams = params.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.key.toLowerCase().includes(s) ||
      p.label.toLowerCase().includes(s) ||
      p.description.toLowerCase().includes(s)
    );
  });

  return (
    <RoleGuard allowedRoles={["ADM_SUPER", "admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#1b5e20]/10 px-2 py-0.5 text-xs font-semibold text-[#1b5e20]">
                Module 16 · Dev Spec M16 Table 5 & 6
              </span>
              <span className="flex items-center gap-1 text-xs text-[#64766a]">
                <Sliders size={14} className="text-[#1b5e20]" />
                Scoped Runtime Parameters
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#19392a]">
              System Configuration & Business Rules
            </h1>
            <p className="text-sm text-[#64766a]">
              Manage business SLA hours, tier-wise MOV floors, credit grace periods, DLT quiet hours, and compliance thresholds.
            </p>
          </div>

          <button
            onClick={() => loadParams()}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-[#dce5dd] bg-white px-3.5 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1]"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#1b5e20]" : ""} />
            Refresh Config
          </button>
        </div>

        {/* Toast */}
        {successToast && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900 shadow-xs">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Categories Bar & Search */}
        <div className="flex flex-col gap-3 rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: "All Parameters" },
              { id: "ORDER", label: "Orders & MOVs" },
              { id: "CREDIT", label: "Credit & Caps" },
              { id: "PRICING", label: "Pricing & Schemes" },
              { id: "TAX_COMPLIANCE", label: "GST & E-Way" },
              { id: "NOTIFICATIONS", label: "TRAI Quiet Hours" },
              { id: "KYC", label: "KYC Rules" },
              { id: "APP", label: "App Versioning" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[#1b5e20] text-white"
                    : "bg-[#f1f5f1] text-[#64766a] hover:bg-[#e2e9e2] hover:text-[#19392a]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64766a]"
            />
            <input
              type="text"
              placeholder="Search keys or descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#dce5dd] bg-[#f8faf8] py-1.5 pl-8 pr-3 text-xs text-[#19392a] focus:border-[#1b5e20] focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {loading ? (
            <div className="col-span-2 py-12 text-center text-[#64766a]">
              <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-[#1b5e20]" />
              Loading configuration registry...
            </div>
          ) : filteredParams.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-[#64766a]">
              No parameters found in this category.
            </div>
          ) : (
            filteredParams.map((param) => (
              <div
                key={param.key}
                className="flex flex-col justify-between rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-[#1b5e20]">
                        {param.key}
                      </span>
                      <h3 className="mt-0.5 text-sm font-bold text-[#19392a]">{param.label}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-gray-700">
                        {param.scope}
                      </span>
                      {param.requires_maker_checker && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          <ShieldAlert size={11} />
                          Maker-Checker
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-[#64766a]">{param.description}</p>

                  {/* Current Value Display */}
                  <div className="mt-3 rounded-lg border border-[#dce5dd] bg-[#f8faf8] p-3">
                    <span className="text-[10px] font-semibold uppercase text-[#64766a]">
                      Active Value:
                    </span>
                    {param.value_type === "json" ? (
                      <pre className="mt-1 overflow-x-auto font-mono text-[11px] text-[#19392a]">
                        {JSON.stringify(param.value, null, 2)}
                      </pre>
                    ) : (
                      <div className="mt-0.5 flex items-baseline gap-1">
                        <span className="font-mono text-base font-bold text-[#19392a]">
                          {String(param.value)}
                        </span>
                        {param.unit && (
                          <span className="text-xs text-[#64766a] font-medium">{param.unit}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#dce5dd] pt-3 text-[11px] text-[#64766a]">
                  <span className="truncate max-w-[200px]" title={param.changed_by}>
                    By: {param.changed_by}
                  </span>
                  <button
                    onClick={() => handleStartEdit(param)}
                    className="rounded-lg bg-[#f1f5f1] px-3 py-1.5 font-semibold text-[#1b5e20] hover:bg-[#1b5e20] hover:text-white transition-colors"
                  >
                    Adjust Parameter
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Parameter Modal */}
        {editingParam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-[#dce5dd] bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#dce5dd] pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-[#1b5e20]">
                    {editingParam.key}
                  </span>
                  <h3 className="text-base font-bold text-[#19392a]">{editingParam.label}</h3>
                </div>
                {editingParam.requires_maker_checker && (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800 border border-amber-200">
                    <ShieldAlert size={12} />
                    Maker-Checker Rule M15.3
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#19392a]">
                    New Configuration Value ({editingParam.value_type}
                    {editingParam.unit ? ` - ${editingParam.unit}` : ""}):
                  </label>
                  {editingParam.value_type === "json" ? (
                    <textarea
                      rows={5}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#dce5dd] bg-[#f8faf8] p-2.5 font-mono text-xs text-[#19392a] focus:border-[#1b5e20] focus:bg-white focus:outline-hidden"
                    />
                  ) : editingParam.value_type === "boolean" ? (
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#dce5dd] bg-[#f8faf8] p-2.5 text-xs text-[#19392a] focus:border-[#1b5e20] focus:bg-white focus:outline-hidden"
                    >
                      <option value="true">true (Enabled)</option>
                      <option value="false">false (Disabled)</option>
                    </select>
                  ) : (
                    <input
                      type={editingParam.value_type === "number" ? "number" : "text"}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#dce5dd] bg-[#f8faf8] p-2.5 font-mono text-xs text-[#19392a] focus:border-[#1b5e20] focus:bg-white focus:outline-hidden"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#19392a]">
                    Mandatory Audit Justification / Reason:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Explain business justification, statutory circular, or operational rationale..."
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#dce5dd] bg-[#f8faf8] p-2.5 text-xs text-[#19392a] focus:border-[#1b5e20] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-[#dce5dd] pt-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setEditingParam(null)}
                  className="rounded-lg border border-[#dce5dd] px-4 py-2 text-xs font-semibold text-[#64766a] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white hover:bg-[#154a19] disabled:opacity-50"
                >
                  <Save size={14} />
                  {saving ? "Saving..." : "Commit Change"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

