"use client";

import { useState } from "react";
import { Shield, Search, Download, Lock, Calendar } from "lucide-react";

interface AuditEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  user_name?: string;
  user_role?: string;
}

const ACTION_COLORS: Record<string, string> = {
  "upload.document": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "analysis.run": "text-purple-400 bg-purple-400/10 border-purple-400/20",
  "analysis.complete": "text-green-400 bg-green-400/10 border-green-400/20",
  "case.create": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "case.update": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "case.resolve": "text-green-400 bg-green-400/10 border-green-400/20",
  "case.comment": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "report.export": "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  "notification.send": "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "batch.submit": "text-purple-400 bg-purple-400/10 border-purple-400/20",
  "batch.complete": "text-green-400 bg-green-400/10 border-green-400/20",
  "apikey.create": "text-red-400 bg-red-400/10 border-red-400/20",
  "apikey.revoke": "text-red-400 bg-red-400/10 border-red-400/20",
  "user.login": "text-gray-400 bg-gray-400/10 border-gray-400/20",
  "settings.update": "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

export function AuditLogViewer({ entries }: { entries: AuditEntry[] }) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  
  // Date range filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const uniqueActions = Array.from(new Set(entries.map((e) => e.action)));

  const filtered = entries.filter((e) => {
    // Search filter
    const matchSearch =
      !search ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      (e.user_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.resource_id ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.resource_type ?? "").toLowerCase().includes(search.toLowerCase());

    // Action filter
    const matchAction = actionFilter === "all" || e.action === actionFilter;

    // Date range filter
    let matchDate = true;
    if (startDate) {
      matchDate = matchDate && new Date(e.created_at) >= new Date(startDate);
    }
    if (endDate) {
      // Add one day to endDate so the filter includes events on that day
      const endLimit = new Date(endDate);
      endLimit.setDate(endLimit.getDate() + 1);
      matchDate = matchDate && new Date(e.created_at) <= endLimit;
    }

    return matchSearch && matchAction && matchDate;
  });

  const handleExport = () => {
    const csv = [
      ["Timestamp", "User", "Role", "Action", "Resource Type", "Resource ID", "IP Address", "Metadata"].join(","),
      ...filtered.map((e) =>
        [
          new Date(e.created_at).toISOString(),
          e.user_name || "System",
          e.user_role || "system",
          e.action,
          e.resource_type ?? "",
          e.resource_id ?? "",
          e.ip_address ?? "",
          JSON.stringify(e.metadata).replace(/,/g, ";"),
        ].join(","),
      ),
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 text-[13px] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-[var(--color-gold)]" />
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Compliance Logs</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-gray-400 text-xs mt-1">
            Immutable, append-only record of all platform activities. Entries cannot be edited or deleted.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:border-white/35 transition-all bg-white/5 cursor-pointer uppercase tracking-wider"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Log Entries", value: entries.length },
          { label: "Distinct Actions", value: uniqueActions.length },
          { label: "Filtered Results", value: filtered.length },
          { label: "Scope Scanned", value: "Organisation" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter panel */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search by User/Action */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by action description, user name, resource ID..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--color-gold)]/50"
            />
          </div>

          {/* Action Select Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none h-[38px] lg:w-48"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* Date range filters */}
          <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none h-[38px] w-36"
              />
            </div>
            <span className="text-gray-500">to</span>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none h-[38px] w-36"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="rounded-3xl bg-white/[0.01] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-white/5">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Resource</th>
                <th className="py-3.5 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-500">
                    <Shield className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 500).map((e) => {
                  const colorClass = ACTION_COLORS[e.action] ?? "text-gray-450 bg-gray-400/10 border-gray-400/20";
                  
                  return (
                    <tr key={e.id} className="hover:bg-white/[0.01] transition-all">
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-gray-500 text-xs font-mono whitespace-nowrap">
                        {new Date(e.created_at).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      
                      {/* User (name + role badge) */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white block">{e.user_name || "System"}</span>
                          {e.user_role && (
                            <span className={`inline-block px-2 py-0.2 rounded-full text-[9px] font-bold border ${
                              e.user_role === "org_admin"
                                ? "bg-amber-500/10 text-[var(--color-gold-light)] border-amber-500/20"
                                : e.user_role === "analyst"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            }`}>
                              {e.user_role.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] border font-mono ${colorClass}`}>
                          {e.action}
                        </span>
                      </td>

                      {/* Resource */}
                      <td className="py-3 px-4 text-gray-300 text-xs">
                        <div className="space-y-0.5">
                          {e.resource_type && (
                            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{e.resource_type}</span>
                          )}
                          {e.resource_id && (
                            <span className="block font-mono text-gray-400">
                              {e.resource_id.includes("-") ? `#${e.resource_id.slice(0, 8)}` : e.resource_id}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs whitespace-nowrap">
                        {e.ip_address || "127.0.0.1"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
