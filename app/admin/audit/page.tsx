"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  ShieldCheck,
  Eye,
  RefreshCw,
  Clock,
  MapPin,
  Terminal,
  X,
  AlertCircle,
  Filter,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { listAuditLogs } from "@/lib/audit-support-api";
import type { AuditEntityType, AuditLogEntry } from "@/types/audit-support";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<AuditEntityType | "ALL">("ALL");
  const [actionFilter, setActionFilter] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await listAuditLogs({
        entity: entityFilter,
        action: actionFilter || undefined,
        search: search || undefined,
      });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [entityFilter, actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  const getEntityBadge = (entity: AuditEntityType) => {
    switch (entity) {
      case "ORDER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PARTNER":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "CONFIG":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "INVOICE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "LEDGER":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "DISPATCH":
        return "bg-teal-100 text-teal-800 border-teal-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <RoleGuard allowedRoles={["ADM_SUPER", "admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#1b5e20]/10 px-2 py-0.5 text-xs font-semibold text-[#1b5e20]">
                Module 16 · Dev Spec M16.1
              </span>
              <span className="flex items-center gap-1 text-xs text-[#64766a]">
                <ShieldCheck size={14} className="text-[#1b5e20]" />
                Immutable Partitioned Log
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#19392a]">
              Audit Trail & Compliance Inspector
            </h1>
            <p className="text-sm text-[#64766a]">
              Append-only statutory audit trail recording every state, price, and financial override with PII-masked before/after diffs and trace IDs.
            </p>
          </div>

          <button
            onClick={() => loadLogs()}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-[#dce5dd] bg-white px-3.5 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1]"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#1b5e20]" : ""} />
            Refresh Trail
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-3 rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64766a]"
            />
            <input
              type="text"
              placeholder="Search by entity ID, trace ID, reason, or action keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#dce5dd] bg-[#f8faf8] py-2 pl-9 pr-4 text-xs text-[#19392a] focus:border-[#1b5e20] focus:bg-white focus:outline-hidden"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#64766a]">
              <Filter size={14} />
              <span>Entity:</span>
            </div>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value as AuditEntityType | "ALL")}
              aria-label="Filter by entity type"
              className="rounded-lg border border-[#dce5dd] bg-white px-2.5 py-1.5 text-xs font-medium text-[#19392a] focus:outline-hidden"
            >
              <option value="ALL">All Entities</option>
              <option value="ORDER">Orders</option>
              <option value="PARTNER">Partners</option>
              <option value="CONFIG">Configuration</option>
              <option value="INVOICE">Invoices</option>
              <option value="LEDGER">Ledgers</option>
              <option value="DISPATCH">Dispatches</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#64766a]">
                <tr>
                  <th className="px-4 py-3">Timestamp / Trace</th>
                  <th className="px-4 py-3">Actor / Origin</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity Target</th>
                  <th className="px-4 py-3">Audit Reason</th>
                  <th className="px-4 py-3 text-right">Inspect Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce5dd]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#64766a]">
                      <RefreshCw size={20} className="mx-auto mb-2 animate-spin text-[#1b5e20]" />
                      Loading tamper-evident audit records...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#64766a]">
                      No audit events matching criteria.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="transition-colors hover:bg-[#f8faf8]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-[#19392a]">
                          <Clock size={12} className="text-[#64766a]" />
                          {new Date(log.created_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </div>
                        <div className="mt-0.5 text-[10px] text-[#64766a]">
                          {new Date(log.created_at).toLocaleDateString("en-IN")}
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 rounded bg-[#f1f5f1] px-1.5 py-0.5 font-mono text-[10px] text-[#1b5e20]">
                          <Terminal size={10} />
                          {log.trace_id}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#19392a]">{log.actor_name}</p>
                        <p className="font-mono text-[10px] text-[#64766a]">
                          {log.actor_role} ({log.actor_type})
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-[#64766a]">
                          <MapPin size={10} className="text-[#1b5e20]" />
                          <span>{log.geo}</span>
                          <span className="font-mono">· {log.ip}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-block rounded-md border border-[#dce5dd] bg-[#f8faf8] px-2 py-1 font-mono text-[11px] font-semibold text-[#19392a]">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${getEntityBadge(
                            log.entity_type,
                          )}`}
                        >
                          {log.entity_type}
                        </span>
                        <p className="mt-1 font-mono text-[11px] font-semibold text-[#19392a]">
                          {log.entity_id}
                        </p>
                      </td>

                      <td className="max-w-xs px-4 py-3">
                        <p className="line-clamp-2 text-xs text-[#19392a]" title={log.reason}>
                          {log.reason || "System automated state mutation."}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#dce5dd] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1b5e20] shadow-xs hover:bg-[#1b5e20]/10"
                        >
                          <Eye size={13} />
                          Payload Diff
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diff Inspection Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[#dce5dd] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#dce5dd] bg-[#f8faf8] px-6 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#1b5e20]/10 px-2 py-0.5 font-mono text-xs font-bold text-[#1b5e20]">
                      {selectedLog.action}
                    </span>
                    <span className="font-mono text-xs text-[#64766a]">
                      Trace: {selectedLog.trace_id}
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-bold text-[#19392a]">
                    Audit Record Diff: {selectedLog.entity_type} · {selectedLog.entity_id}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="rounded-lg p-1 text-[#64766a] hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto p-6 text-xs max-h-[calc(90vh-140px)]">
                {/* Meta Summary */}
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-[#dce5dd] bg-[#f8faf8] p-4 sm:grid-cols-4">
                  <div>
                    <span className="text-[10px] uppercase text-[#64766a]">Actor</span>
                    <p className="font-semibold text-[#19392a]">{selectedLog.actor_name}</p>
                    <p className="text-[10px] text-[#64766a]">{selectedLog.actor_role}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#64766a]">Timestamp</span>
                    <p className="font-semibold text-[#19392a]">
                      {new Date(selectedLog.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#64766a]">Origin IP / Geo</span>
                    <p className="font-mono font-semibold text-[#19392a]">{selectedLog.ip}</p>
                    <p className="text-[10px] text-[#64766a]">{selectedLog.geo}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#64766a]">Client Agent</span>
                    <p className="truncate text-[11px] text-[#19392a]" title={selectedLog.user_agent}>
                      {selectedLog.user_agent}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold">
                    <AlertCircle size={15} />
                    <span>Mandatory Justification / Reason:</span>
                  </div>
                  <p className="mt-1 text-xs text-amber-900">{selectedLog.reason}</p>
                </div>

                {/* Before vs After JSON */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-3">
                    <p className="mb-2 font-mono text-[11px] font-bold uppercase text-rose-800">
                      Before Mutation (PII Masked)
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-[11px] text-rose-300">
                      {selectedLog.before
                        ? JSON.stringify(selectedLog.before, null, 2)
                        : "null (Initial Creation)"}
                    </pre>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-3">
                    <p className="mb-2 font-mono text-[11px] font-bold uppercase text-emerald-800">
                      After Mutation
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-[11px] text-emerald-300">
                      {selectedLog.after
                        ? JSON.stringify(selectedLog.after, null, 2)
                        : "null (Deleted / Nullified)"}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-[#dce5dd] bg-[#f8faf8] px-6 py-3">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="rounded-lg bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white hover:bg-[#154a19]"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
