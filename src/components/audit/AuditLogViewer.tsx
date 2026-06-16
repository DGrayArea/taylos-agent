"use client";

import { useState } from "react";
import { Shield, Search, Download, Lock } from "lucide-react";

interface AuditEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
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

  const uniqueActions = Array.from(new Set(entries.map((e) => e.action)));

  const filtered = entries.filter((e) => {
    const matchSearch =
      !search ||
      e.action.includes(search) ||
      (e.user_id ?? "").includes(search) ||
      (e.resource_id ?? "").includes(search) ||
      JSON.stringify(e.metadata).includes(search);
    const matchAction = actionFilter === "all" || e.action === actionFilter;
    return matchSearch && matchAction;
  });

  const handleExport = () => {
    const csv = [
      ["Timestamp", "Action", "User", "Resource Type", "Resource ID", "IP", "Metadata"].join(","),
      ...filtered.map((e) =>
        [
          e.created_at,
          e.action,
          e.user_id ?? "",
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-[var(--color-gold)]" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">Admin Only</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Audit Log</h1>
          <p className="text-gray-400 text-sm">
            Immutable record of all platform actions. Append-only — no entries can be modified or deleted.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/30 transition-all"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: entries.length },
          { label: "Unique Actions", value: uniqueActions.length },
          { label: "Filtered", value: filtered.length },
          { label: "Shown", value: Math.min(filtered.length, 500) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, user ID, resource ID..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-gold)]/50"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
        >
          <option value="all">All Actions</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Log Table */}
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Timestamp", "Action", "Resource", "User / IP", "Metadata"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-gray-500">
                    <Shield className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                    No audit events yet. Events are logged automatically as you use the platform.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 200).map((e) => {
                  const colorClass = ACTION_COLORS[e.action] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20";
                  return (
                    <tr key={e.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap font-mono">
                        {new Date(e.created_at).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs border font-mono ${colorClass}`}>
                          {e.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {e.resource_type && (
                          <span className="text-gray-500">{e.resource_type}</span>
                        )}
                        {e.resource_id && (
                          <span className="block font-mono text-gray-600">{e.resource_id.slice(0, 8)}…</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs font-mono">
                        {e.user_id ? e.user_id.slice(0, 8) + "…" : "system"}
                        {e.ip_address && <span className="block">{e.ip_address}</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-xs max-w-[200px] truncate font-mono">
                        {Object.keys(e.metadata).length > 0
                          ? JSON.stringify(e.metadata).slice(0, 80)
                          : "—"}
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
