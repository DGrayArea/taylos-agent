"use client";

import { useState } from "react";
import {
  Layers, CheckCircle, AlertTriangle, Clock, Plus, RefreshCw, ChevronRight,
} from "lucide-react";

interface BatchJob {
  id: string;
  status: "processing" | "complete" | "partial" | "failed";
  document_count: number;
  results: { summary?: { total: number; success: number; failed: number } } | null;
  created_at: string;
  source: string;
}

const STATUS_CONFIG = {
  processing: { label: "Processing", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", icon: Clock },
  complete: { label: "Complete", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", icon: CheckCircle },
  partial: { label: "Partial", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20", icon: AlertTriangle },
  failed: { label: "Failed", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", icon: AlertTriangle },
};

export function BatchManager({ initialJobs }: { initialJobs: BatchJob[] }) {
  const [jobs, setJobs] = useState<BatchJob[]>(initialJobs);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoText, setDemoText] = useState("Date,Amount,Merchant\n2025-01-15,50000,Unknown Vendor\n2025-01-15,50000,Unknown Vendor\n2025-01-16,5000000,Offshore LLC");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [submitResult, setSubmitResult] = useState<{ batchId: string; status: string; summary: { total: number; success: number; failed: number } } | null>(null);

  const refreshJobs = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/v1/batch", {
        headers: { "X-API-Key": apiKey },
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.batches ?? []);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const submitDemo = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await fetch("/api/v1/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey || "demo",
        },
        body: JSON.stringify({
          documents: [
            [{ filename: "batch-demo-1.csv", content_type: "text/csv", raw_text: demoText }],
            [{ filename: "batch-demo-2.csv", content_type: "text/csv", raw_text: demoText }],
          ],
        }),
      });
      const data = await res.json();
      setSubmitResult(data);
      if (data.batchId) {
        const newJob: BatchJob = {
          id: data.batchId,
          status: data.status,
          document_count: data.summary?.total ?? 2,
          results: { summary: data.summary },
          created_at: new Date().toISOString(),
          source: "batch_api",
        };
        setJobs((prev) => [newJob, ...prev]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Batch Processing</h1>
          <p className="text-gray-400 text-sm">
            Submit 1 to 10,000 documents simultaneously. Workers run in parallel — results aggregate into a single report.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshJobs}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-300 hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowDemo(!showDemo)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-gold)] text-[var(--color-navy)] font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Submit Batch
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Jobs", value: jobs.length, color: "text-white" },
          { label: "Complete", value: jobs.filter((j) => j.status === "complete").length, color: "text-green-400" },
          { label: "Processing", value: jobs.filter((j) => j.status === "processing").length, color: "text-yellow-400" },
          { label: "Failed", value: jobs.filter((j) => j.status === "failed").length, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Demo Submission Panel */}
      {showDemo && (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--color-gold)]" />
            Submit Batch Job
          </h2>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">API Key</label>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="tk_... (leave blank for demo)"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[var(--color-gold)]/50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Document Data (CSV/text)</label>
            <textarea
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              rows={5}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[var(--color-gold)]/50 resize-none"
            />
            <p className="text-xs text-gray-600 mt-1">This will be submitted as 2 parallel batch jobs for demo purposes.</p>
          </div>
          {submitResult && (
            <div className={`rounded-xl p-4 text-sm border ${submitResult.status === "complete" ? "bg-green-400/10 border-green-400/20 text-green-300" : "bg-red-400/10 border-red-400/20 text-red-300"}`}>
              <div className="font-mono font-bold mb-1">Batch ID: {submitResult.batchId?.slice(0, 16)}…</div>
              <div>Status: {submitResult.status} · {submitResult.summary?.success ?? 0}/{submitResult.summary?.total ?? 0} succeeded</div>
            </div>
          )}
          <button
            onClick={submitDemo}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[var(--color-gold)] text-[var(--color-navy)] font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Processing..." : "Submit Batch"}
          </button>
        </div>
      )}

      {/* Jobs List */}
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="font-semibold">Recent Batch Jobs</h2>
        </div>
        <div className="divide-y divide-white/5">
          {jobs.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              <Layers className="w-10 h-10 mx-auto mb-3 text-gray-700" />
              No batch jobs yet. Submit your first batch above.
            </div>
          ) : (
            jobs.map((job) => {
              const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.processing;
              const success = job.results?.summary?.success ?? 0;
              const total = job.results?.summary?.total ?? job.document_count;
              const pct = total > 0 ? Math.round((success / total) * 100) : 0;
              return (
                <div key={job.id} className="p-5 flex items-center justify-between gap-4 hover:bg-white/3 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-600 font-mono">{job.id.slice(0, 8)}…</span>
                      <span className="text-xs text-gray-600">{job.source}</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      {job.document_count} document{job.document_count !== 1 ? "s" : ""}
                      {job.results?.summary && ` · ${success}/${total} succeeded (${pct}%)`}
                    </div>
                    {job.status === "processing" && (
                      <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--color-gold)] rounded-full animate-pulse w-1/2" />
                      </div>
                    )}
                    {job.results?.summary && (
                      <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    {new Date(job.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" } as Intl.DateTimeFormatOptions)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
