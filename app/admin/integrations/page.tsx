"use client";

import { useEffect, useState } from "react";
import {
  Cpu,
  RefreshCw,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Download,
  Terminal,
  ShieldCheck,
  Eye,
  X,
  Radio,
  FileCode,
  Link2,
  Database,
  Search,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import {
  listConnectors,
  listIntegrationLogs,
  listTallyJobs,
  listWebhooks,
  resetCircuitBreaker,
  testAdapterProbe,
  triggerTallyExport,
} from "@/lib/integrations-api";
import type {
  AdapterType,
  IntegrationConnector,
  IntegrationLogEntry,
  TallyJobType,
  TallySyncJob,
  WebhookSubscription,
} from "@/types/integrations";

export default function IntegrationsHubPage() {
  const [activeTab, setActiveTab] = useState<"CONNECTORS" | "TALLY" | "LOGS" | "WEBHOOKS">("CONNECTORS");

  // Connectors State
  const [connectors, setConnectors] = useState<IntegrationConnector[]>([]);
  const [probingAdapter, setProbingAdapter] = useState<string | null>(null);
  const [probeResult, setProbeResult] = useState<{ adapter: string; message: string; latency_ms: number } | null>(null);

  // Tally State
  const [tallyJobs, setTallyJobs] = useState<TallySyncJob[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<TallyJobType>("SALES_VOUCHERS");
  const [selectedFormat, setSelectedFormat] = useState<"XML" | "JSON">("XML");
  const [exporting, setExporting] = useState(false);

  // Logs State
  const [logs, setLogs] = useState<IntegrationLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<IntegrationLogEntry | null>(null);
  const [logAdapterFilter, setLogAdapterFilter] = useState("ALL");
  const [logSearch, setLogSearch] = useState("");

  // Webhooks State
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);

  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cData, tData, lData, wData] = await Promise.all([
        listConnectors(),
        listTallyJobs(),
        listIntegrationLogs(),
        listWebhooks(),
      ]);
      setConnectors(cData);
      setTallyJobs(tData);
      setLogs(lData);
      setWebhooks(wData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleProbe = async (adapter: AdapterType) => {
    setProbingAdapter(adapter);
    try {
      const res = await testAdapterProbe(adapter);
      setProbeResult({ adapter, message: res.message, latency_ms: res.latency_ms });
      setTimeout(() => setProbeResult(null), 5000);
      loadAll();
    } catch (err: any) {
      alert(err.message || "Probe failed");
    } finally {
      setProbingAdapter(null);
    }
  };

  const handleResetCircuit = async (adapter: AdapterType) => {
    try {
      await resetCircuitBreaker(adapter);
      loadAll();
      alert(`Circuit breaker for ${adapter} reset to CLOSED.`);
    } catch (err: any) {
      alert(err.message || "Failed to reset circuit breaker");
    }
  };

  const handleTriggerTally = async () => {
    setExporting(true);
    try {
      const newJob = await triggerTallyExport(selectedJobType, selectedFormat);
      alert(`Export generated successfully: ${newJob.download_filename} (${newJob.records_synced} records)`);
      loadAll();
    } catch (err: any) {
      alert(err.message || "Tally export failed");
    } finally {
      setExporting(false);
    }
  };

  const loadLogsFiltered = async () => {
    setLogsLoading(true);
    try {
      const data = await listIntegrationLogs({
        adapter: logAdapterFilter !== "ALL" ? logAdapterFilter : undefined,
        search: logSearch || undefined,
      });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "LOGS") {
      loadLogsFiltered();
    }
  }, [logAdapterFilter, activeTab]);

  return (
    <RoleGuard allowedRoles={["ADM_SUPER", "admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#1b5e20]/10 px-2 py-0.5 text-xs font-semibold text-[#1b5e20]">
                Module 17 · Dev Spec M17
              </span>
              <span className="flex items-center gap-1 text-xs text-[#64766a]">
                <Cpu size={14} className="text-[#1b5e20]" />
                Microservices & Vendor Hub
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#19392a]">
              Integrations & Third-Party Hub
            </h1>
            <p className="text-sm text-[#64766a]">
              Manage 9 core external adapters: DLT SMS, Push FCM, Maps, AWS S3, KYC Verifiers, Razorpay Gateway, ClearTax GSP, WhatsApp HSM, and Tally Prime ERP.
            </p>
          </div>

          <button
            onClick={() => loadAll()}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-[#dce5dd] bg-white px-3.5 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1]"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#1b5e20]" : ""} />
            Sync Status
          </button>
        </div>

        {/* Probe Alert Toast */}
        {probeResult && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-700" />
              <span>
                {probeResult.message} ({probeResult.latency_ms}ms)
              </span>
            </div>
            <button
              onClick={() => setProbeResult(null)}
              className="text-emerald-700 hover:text-emerald-950"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#dce5dd] bg-white px-2 pt-2 rounded-t-xl">
          {[
            { id: "CONNECTORS", label: "Adapters & Connectors (9)", icon: Cpu },
            { id: "TALLY", label: "Tally Prime ERP Sync", icon: Database },
            { id: "LOGS", label: "Vendor Request Logs", icon: Terminal },
            { id: "WEBHOOKS", label: "Webhook Subscriptions", icon: Link2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "border-[#1b5e20] text-[#1b5e20]"
                    : "border-transparent text-[#64766a] hover:text-[#19392a]"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: CONNECTORS GRID */}
        {activeTab === "CONNECTORS" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connectors.map((c) => (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase text-[#1b5e20]">
                        {c.adapter}
                      </span>
                      <h3 className="mt-0.5 text-sm font-bold text-[#19392a]">{c.name}</h3>
                      <p className="text-xs font-medium text-[#64766a]">{c.vendor}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                        <Activity size={10} />
                        {c.status}
                      </span>
                      <span className="font-mono text-[10px] text-[#64766a]">
                        {c.uptime_pct}% Uptime
                      </span>
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs text-[#64766a] line-clamp-2">{c.description}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-[#dce5dd] bg-[#f8faf8] p-2.5 text-[11px]">
                    <div>
                      <span className="text-[10px] uppercase text-[#64766a]">Avg Latency</span>
                      <p className="font-mono font-bold text-[#19392a]">{c.avg_latency_ms} ms</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#64766a]">Calls (24h)</span>
                      <p className="font-mono font-bold text-[#19392a]">
                        {c.total_calls_24h.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#dce5dd] pt-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-[#64766a]">Breaker:</span>
                    <span
                      className={`font-mono text-[10px] font-bold ${
                        c.circuit_breaker === "CLOSED" ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {c.circuit_breaker}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {c.circuit_breaker !== "CLOSED" && (
                      <button
                        onClick={() => handleResetCircuit(c.adapter)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800 hover:bg-rose-100"
                      >
                        Reset Breaker
                      </button>
                    )}
                    <button
                      onClick={() => handleProbe(c.adapter)}
                      disabled={probingAdapter === c.adapter}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#dce5dd] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1b5e20] shadow-xs hover:bg-[#1b5e20]/10"
                    >
                      <Zap size={11} className={probingAdapter === c.adapter ? "animate-spin" : ""} />
                      {probingAdapter === c.adapter ? "Probing..." : "Test Probe"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: TALLY ERP EXPORT DESK */}
        {activeTab === "TALLY" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#dce5dd] bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-[#1b5e20]" />
                <h3 className="text-base font-bold text-[#19392a]">
                  Tally Prime ERP 9 / Prime Accounting Integration Desk
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#64766a]">
                Generate compliant XML and JSON voucher feeds directly importable into Tally Prime via Gateway of Tally &gt; Import Data &gt; Vouchers.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-[#19392a]">
                    Voucher Export Domain:
                  </label>
                  <select
                    value={selectedJobType}
                    onChange={(e) => setSelectedJobType(e.target.value as any)}
                    className="mt-1.5 w-full rounded-lg border border-[#dce5dd] bg-[#f8faf8] p-2 text-xs font-medium text-[#19392a]"
                  >
                    <option value="SALES_VOUCHERS">Sales Tax Invoices (B2B)</option>
                    <option value="PURCHASE_RECEIPTS">GRN Goods Received Receipts</option>
                    <option value="LEDGER_BALANCES">Closing Partner Ledger Balances</option>
                    <option value="STOCK_JOURNAL">Stock Movement Journal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#19392a]">
                    Export Payload Format:
                  </label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as any)}
                    className="mt-1.5 w-full rounded-lg border border-[#dce5dd] bg-[#f8faf8] p-2 text-xs font-medium text-[#19392a]"
                  >
                    <option value="XML">Tally XML Envelope (Native XML)</option>
                    <option value="JSON">Structured JSON (ODBC Adapter)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleTriggerTally}
                    disabled={exporting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1b5e20] p-2.5 text-xs font-semibold text-white hover:bg-[#154a19] disabled:opacity-50"
                  >
                    <Download size={14} />
                    {exporting ? "Generating Vouchers..." : "Trigger On-Demand Export"}
                  </button>
                </div>
              </div>
            </div>

            {/* Previous Jobs Table */}
            <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
              <div className="border-b border-[#dce5dd] bg-[#f8faf8] px-4 py-3">
                <h4 className="text-xs font-bold uppercase text-[#19392a]">
                  Recent Tally Export Batches & Downloads
                </h4>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#64766a]">
                  <tr>
                    <th className="px-4 py-3">Job ID</th>
                    <th className="px-4 py-3">Export Category</th>
                    <th className="px-4 py-3">Format</th>
                    <th className="px-4 py-3">Records Synced</th>
                    <th className="px-4 py-3">Generated At</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dce5dd]">
                  {tallyJobs.map((j) => (
                    <tr key={j.id} className="hover:bg-[#f8faf8]">
                      <td className="px-4 py-3 font-mono font-semibold text-[#19392a]">{j.id}</td>
                      <td className="px-4 py-3 font-medium text-[#19392a]">
                        {j.job_type.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-gray-700">
                          {j.export_format}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-[#19392a]">
                        {j.records_synced} entries
                      </td>
                      <td className="px-4 py-3 text-[#64766a]">
                        {new Date(j.completed_at).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          {j.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => alert(`Simulated download for file: ${j.download_filename}`)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#dce5dd] bg-white px-2 py-1 text-xs font-semibold text-[#1b5e20] hover:bg-[#1b5e20]/10"
                        >
                          <Download size={12} />
                          {j.download_filename}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: INTEGRATION LOGS */}
        {activeTab === "LOGS" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64766a]"
                />
                <input
                  type="text"
                  placeholder="Search logs by operation, vendor, ref ID..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadLogsFiltered()}
                  className="w-full rounded-lg border border-[#dce5dd] bg-[#f8faf8] py-2 pl-9 pr-3 text-xs text-[#19392a] focus:border-[#1b5e20] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={logAdapterFilter}
                  onChange={(e) => setLogAdapterFilter(e.target.value)}
                  aria-label="Filter by adapter"
                  className="rounded-lg border border-[#dce5dd] bg-white px-2.5 py-1.5 text-xs font-medium text-[#19392a] focus:outline-hidden"
                >
                  <option value="ALL">All Adapters</option>
                  <option value="GspProvider">ClearTax GSP</option>
                  <option value="PaymentGateway">Razorpay Gateway</option>
                  <option value="SmsProvider">MSG91 SMS DLT</option>
                  <option value="ErpConnector">Tally Prime ERP</option>
                  <option value="KycVerifier">Signzy KYC</option>
                </select>

                <button
                  onClick={loadLogsFiltered}
                  className="rounded-lg bg-[#1b5e20] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#154a19]"
                >
                  Filter
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#64766a]">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Adapter / Vendor</th>
                    <th className="px-4 py-3">Operation</th>
                    <th className="px-4 py-3">HTTP / Latency</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dce5dd]">
                  {logsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#64766a]">
                        <RefreshCw size={20} className="mx-auto mb-2 animate-spin text-[#1b5e20]" />
                        Loading vendor logs...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#64766a]">
                        No logs match active filters.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#f8faf8]">
                        <td className="px-4 py-3 font-mono text-[11px] text-[#64766a]">
                          {new Date(log.created_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#19392a]">{log.adapter}</p>
                          <p className="text-[10px] text-[#64766a]">{log.vendor}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-semibold text-[#19392a]">
                            {log.operation}
                          </span>
                          {log.ref_id && (
                            <span className="ml-1 text-[10px] text-[#64766a]">
                              ({log.ref_id})
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-emerald-800">
                            HTTP {log.http_code}
                          </span>
                          <span className="ml-2 font-mono text-[10px] text-[#64766a]">
                            {log.latency_ms} ms
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 rounded-md border border-[#dce5dd] bg-white px-2 py-1 text-xs font-semibold text-[#1b5e20] hover:bg-[#1b5e20]/10"
                          >
                            <Eye size={12} />
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Log Modal */}
            {selectedLog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                <div className="w-full max-w-2xl rounded-2xl border border-[#dce5dd] bg-white p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#dce5dd] pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#1b5e20]">
                        {selectedLog.operation}
                      </span>
                      <h3 className="text-base font-bold text-[#19392a]">
                        Vendor Payload Inspector: {selectedLog.vendor}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="rounded-lg p-1 text-[#64766a] hover:bg-gray-100"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-4 space-y-3 text-xs max-h-[70vh] overflow-y-auto">
                    <div>
                      <p className="font-semibold text-[#19392a]">Request Payload (Masked):</p>
                      <pre className="mt-1 overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-[11px] text-emerald-400">
                        {JSON.stringify(selectedLog.request_payload, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <p className="font-semibold text-[#19392a]">Vendor Response Payload:</p>
                      <pre className="mt-1 overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-[11px] text-blue-400">
                        {JSON.stringify(selectedLog.response_payload, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end border-t border-[#dce5dd] pt-3">
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="rounded-lg bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white"
                    >
                      Close Inspector
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WEBHOOKS */}
        {activeTab === "WEBHOOKS" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#19392a]">
                Active Inbound Webhook Endpoints
              </h3>
              <p className="text-xs text-[#64766a]">
                Secure signature verification endpoints receiving callbacks from Razorpay, ClearTax GSP, and MSG91.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {webhooks.map((w) => (
                <div
                  key={w.id}
                  className="rounded-xl border border-[#dce5dd] bg-white p-5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                      Active Callback
                    </span>
                    <span className="font-mono text-[10px] text-[#64766a]">
                      Failures: {w.failed_deliveries}
                    </span>
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-[#19392a]">{w.target_service}</h4>
                  <p className="mt-1 font-mono text-[10px] text-[#64766a] break-all">
                    {w.endpoint_url}
                  </p>

                  <div className="mt-3">
                    <span className="text-[10px] uppercase text-[#64766a]">Webhook Secret</span>
                    <p className="font-mono text-xs font-semibold text-[#19392a]">
                      {w.secret_key_masked}
                    </p>
                  </div>

                  <div className="mt-3">
                    <span className="text-[10px] uppercase text-[#64766a]">Subscribed Events</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {w.events.map((ev) => (
                        <span
                          key={ev}
                          className="rounded bg-[#f1f5f1] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#1b5e20]"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

