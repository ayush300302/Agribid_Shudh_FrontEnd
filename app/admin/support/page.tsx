"use client";

import { useEffect, useState } from "react";
import {
  LifeBuoy,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  UserCheck,
  RefreshCw,
  MessageSquare,
  X,
  Building,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import {
  getSupportTicket,
  listSupportTickets,
  replyToSupportTicket,
  updateSupportTicketStatus,
} from "@/lib/audit-support-api";
import type {
  SupportTicket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/types/audit-support";

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "ALL">("ALL");
  const [search, setSearch] = useState("");

  // Drawer / Detail state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [newStatus, setNewStatus] = useState<TicketStatus>("IN_PROGRESS");
  const [assigneeInput, setAssigneeInput] = useState("");

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await listSupportTickets({
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        search: search || undefined,
      });
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const handleOpenTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setAssigneeInput(ticket.assignee || "Support Admin");
    setResolutionNotes(ticket.resolution_notes || "");
    try {
      const fresh = await getSupportTicket(ticket.id);
      if (fresh) setSelectedTicket(fresh);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setSendingReply(true);
    try {
      const updated = await replyToSupportTicket(selectedTicket.id, {
        message: replyMessage,
        sender_name: "Ayush Patil (Support Lead)",
      });
      setSelectedTicket(updated);
      setReplyMessage("");
      loadTickets();
    } catch (err: any) {
      alert(err.message || "Failed to send response");
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket) return;
    try {
      const updated = await updateSupportTicketStatus(selectedTicket.id, {
        status: newStatus,
        resolution_notes: resolutionNotes,
        assignee: assigneeInput,
      });
      setSelectedTicket(updated);
      loadTickets();
      alert(`Ticket status updated to ${newStatus}`);
    } catch (err: any) {
      alert(err.message || "Failed to update ticket status");
    }
  };

  const getPriorityBadge = (p: TicketPriority) => {
    switch (p) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-800 border-rose-200 font-bold";
      case "HIGH":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "MEDIUM":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "LOW":
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusBadge = (s: TicketStatus) => {
    switch (s) {
      case "OPEN":
        return "bg-red-50 text-red-700 border-red-200";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CLOSED":
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const criticalCount = tickets.filter((t) => t.priority === "CRITICAL" && t.status !== "CLOSED").length;

  return (
    <RoleGuard allowedRoles={["ADM_SUPER", "admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#1b5e20]/10 px-2 py-0.5 text-xs font-semibold text-[#1b5e20]">
                Module 16 · Dev Spec M16.2
              </span>
              <span className="flex items-center gap-1 text-xs text-[#64766a]">
                <LifeBuoy size={14} className="text-[#1b5e20]" />
                Partner Help Desk & SLA Engine
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#19392a]">
              Partner Support Desk
            </h1>
            <p className="text-sm text-[#64766a]">
              Manage partner escalation queries, order quantity discrepancies, UPI payment debits, and Android bug reports with SLA tracking.
            </p>
          </div>

          <button
            onClick={() => loadTickets()}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-[#dce5dd] bg-white px-3.5 py-2 text-xs font-semibold text-[#19392a] shadow-xs hover:bg-[#f1f5f1]"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#1b5e20]" : ""} />
            Refresh Desk
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
            <span className="text-xs font-medium text-[#64766a]">Open Unassigned</span>
            <p className="mt-1 text-2xl font-bold text-rose-700">{openCount}</p>
          </div>
          <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
            <span className="text-xs font-medium text-[#64766a]">Under Investigation</span>
            <p className="mt-1 text-2xl font-bold text-blue-700">{inProgressCount}</p>
          </div>
          <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
            <span className="text-xs font-medium text-[#64766a]">Critical Priority</span>
            <p className="mt-1 text-2xl font-bold text-amber-700">{criticalCount}</p>
          </div>
          <div className="rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
            <span className="text-xs font-medium text-[#64766a]">SLA Compliance</span>
            <p className="mt-1 text-2xl font-bold text-[#1b5e20]">98.4%</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64766a]"
            />
            <input
              type="text"
              placeholder="Search by ticket #, partner name, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadTickets()}
              className="w-full rounded-lg border border-[#dce5dd] bg-[#f8faf8] py-2 pl-9 pr-3 text-xs text-[#19392a] focus:border-[#1b5e20] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter by status"
              className="rounded-lg border border-[#dce5dd] bg-white px-2.5 py-1.5 text-xs font-medium text-[#19392a] focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              aria-label="Filter by priority"
              className="rounded-lg border border-[#dce5dd] bg-white px-2.5 py-1.5 text-xs font-medium text-[#19392a] focus:outline-hidden"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              aria-label="Filter by category"
              className="rounded-lg border border-[#dce5dd] bg-white px-2.5 py-1.5 text-xs font-medium text-[#19392a] focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              <option value="ORDER">Order Issues</option>
              <option value="PAYMENT">Payment Reconcile</option>
              <option value="DELIVERY">Delivery Offload</option>
              <option value="APP_BUG">App Bug</option>
              <option value="LOGIN">Auth / Login</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#dce5dd] bg-[#f8faf8] font-semibold text-[#64766a]">
                <tr>
                  <th className="px-4 py-3">Ticket # / SLA</th>
                  <th className="px-4 py-3">Partner / Tier</th>
                  <th className="px-4 py-3">Category & Subject</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce5dd]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#64766a]">
                      <RefreshCw size={20} className="mx-auto mb-2 animate-spin text-[#1b5e20]" />
                      Loading support desk queue...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#64766a]">
                      No support tickets found matching active criteria.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="transition-colors hover:bg-[#f8faf8]">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-[#19392a]">{t.ticket_no}</span>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-[#64766a]">
                          <Clock size={11} />
                          <span>
                            Due {new Date(t.sla_due_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#19392a]">{t.partner_name}</p>
                        <span className="mt-0.5 inline-block rounded bg-emerald-50 px-1.5 py-0.2 font-mono text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          Tier: {t.partner_tier}
                        </span>
                      </td>

                      <td className="max-w-xs px-4 py-3">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700">
                          {t.category}
                        </span>
                        <p className="mt-1 truncate font-medium text-[#19392a]" title={t.subject}>
                          {t.subject}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold uppercase ${getPriorityBadge(
                            t.priority,
                          )}`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold uppercase ${getStatusBadge(
                            t.status,
                          )}`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-xs text-[#19392a]">
                          {t.assignee || (
                            <span className="italic text-[#64766a]">Unassigned</span>
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenTicket(t)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#dce5dd] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1b5e20] shadow-xs hover:bg-[#1b5e20]/10"
                        >
                          <MessageSquare size={13} />
                          Manage Desk
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ticket Management Drawer */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
            <div className="flex h-full w-full max-w-2xl flex-col border-l border-[#dce5dd] bg-white shadow-2xl">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#dce5dd] bg-[#f8faf8] px-6 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1b5e20]">
                      {selectedTicket.ticket_no}
                    </span>
                    <span
                      className={`rounded border px-1.5 py-0.2 text-[10px] font-bold ${getPriorityBadge(
                        selectedTicket.priority,
                      )}`}
                    >
                      {selectedTicket.priority}
                    </span>
                    <span
                      className={`rounded border px-1.5 py-0.2 text-[10px] font-bold ${getStatusBadge(
                        selectedTicket.status,
                      )}`}
                    >
                      {selectedTicket.status}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-[#19392a]">
                    {selectedTicket.subject}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-lg p-1 text-[#64766a] hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 space-y-4 overflow-y-auto p-6 text-xs">
                {/* Partner Metadata */}
                <div className="rounded-xl border border-[#dce5dd] bg-[#f8faf8] p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building size={14} className="text-[#1b5e20]" />
                      <span className="font-semibold text-[#19392a]">
                        {selectedTicket.partner_name}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-[#1b5e20]">
                      Tier: {selectedTicket.partner_tier}
                    </span>
                  </div>
                  {selectedTicket.ref_type && selectedTicket.ref_id && (
                    <div className="mt-2 text-[11px] text-[#64766a]">
                      Ref Entity:{" "}
                      <span className="font-mono font-semibold text-[#19392a]">
                        {selectedTicket.ref_type} #{selectedTicket.ref_id}
                      </span>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-[#19392a] bg-white p-2.5 rounded-lg border border-[#dce5dd]">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Status & Assignment Controls */}
                <div className="rounded-xl border border-[#dce5dd] p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#19392a]">Ticket Controls</span>
                    <button
                      onClick={handleUpdateStatus}
                      className="inline-flex items-center gap-1 rounded-md bg-[#1b5e20] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#154a19]"
                    >
                      <UserCheck size={12} />
                      Save Controls
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-[#64766a]">
                        Lifecycle Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                        className="mt-1 w-full rounded border border-[#dce5dd] p-1.5 text-xs font-semibold text-[#19392a]"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-[#64766a]">
                        Assigned Officer
                      </label>
                      <input
                        type="text"
                        value={assigneeInput}
                        onChange={(e) => setAssigneeInput(e.target.value)}
                        placeholder="Staff Name"
                        className="mt-1 w-full rounded border border-[#dce5dd] p-1.5 text-xs text-[#19392a]"
                      />
                    </div>
                  </div>
                  {(newStatus === "RESOLVED" || newStatus === "CLOSED") && (
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-[#64766a]">
                        Resolution Notes
                      </label>
                      <input
                        type="text"
                        placeholder="State resolution details communicated to partner..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="mt-1 w-full rounded border border-[#dce5dd] p-1.5 text-xs text-[#19392a]"
                      />
                    </div>
                  )}
                </div>

                {/* Conversation Thread */}
                <div>
                  <h4 className="font-semibold text-[#19392a]">Communication Trail</h4>
                  <div className="mt-2 space-y-2">
                    {selectedTicket.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`rounded-xl p-3 text-xs ${
                          m.sender_type === "ADMIN"
                            ? "ml-6 bg-[#f1f5f1] border border-[#dce5dd]"
                            : "mr-6 bg-white border border-[#dce5dd]"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-[#64766a]">
                          <span className="font-bold text-[#19392a]">{m.sender_name}</span>
                          <span>{new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="mt-1 text-[#19392a]">{m.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reply Box Footer */}
              <div className="border-t border-[#dce5dd] bg-[#f8faf8] p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type official response to partner..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                    className="flex-1 rounded-lg border border-[#dce5dd] bg-white px-3 py-2 text-xs text-[#19392a] focus:border-[#1b5e20] focus:outline-hidden"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyMessage.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1b5e20] px-4 py-2 text-xs font-semibold text-white hover:bg-[#154a19] disabled:opacity-50"
                  >
                    <Send size={14} />
                    {sendingReply ? "Sending..." : "Reply"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
