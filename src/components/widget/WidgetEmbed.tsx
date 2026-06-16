"use client";

import { useState } from "react";
import { Shield, Upload, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

export function WidgetEmbed() {
  const [file, setFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("apiKey") ?? "";
    }
    return "";
  });
  const [result, setResult] = useState<{ anomalies: Array<{ id: string; type: string; severity: string; confidence: number; description: string }> } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyse = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const res = await fetch("/api/v1/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey || "demo",
        },
        body: JSON.stringify([{ filename: file.name, content_type: file.type || "text/plain", raw_text: text }]),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  const SEVERITY_COLORS: Record<string, string> = {
    CRITICAL: "#ef4444",
    HIGH: "#f97316",
    MEDIUM: "#f59e0b",
    LOW: "#3b82f6",
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#0a1628", color: "#fff", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#d4af3720", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={18} color="#d4af37" />
          </div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "16px" }}>Taylos Agent</div>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>Financial Analysis Widget</div>
          </div>
        </div>

        {!result ? (
          <div style={{ background: "#1a2332", borderRadius: "12px", padding: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
                API Key
              </label>
              <input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="tk_..."
                style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div
              style={{ border: "2px dashed rgba(212,175,55,0.3)", borderRadius: "12px", padding: "32px", textAlign: "center", cursor: "pointer", marginBottom: "12px" }}
              onClick={() => document.getElementById("widget-file-input")?.click()}
            >
              <Upload size={24} color="#d4af37" style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: "13px", color: "#d1d5db" }}>
                {file ? file.name : "Drop file or click to upload"}
              </div>
              <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>CSV, PDF, TXT</div>
              <input
                id="widget-file-input"
                type="file"
                accept=".csv,.txt,.pdf"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#f87171", marginBottom: "12px" }}>
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyse}
              disabled={!file || isLoading}
              style={{ width: "100%", background: "#d4af37", color: "#0a1628", fontWeight: "700", padding: "10px", borderRadius: "8px", border: "none", cursor: file && !isLoading ? "pointer" : "not-allowed", opacity: file && !isLoading ? 1 : 0.5, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> Analysing…</> : "Analyse Document"}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ background: "#1a2332", borderRadius: "12px", padding: "16px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>Results</div>
              <div style={{ fontSize: "22px", fontWeight: "700", color: result.anomalies.length > 0 ? "#ef4444" : "#10b981" }}>
                {result.anomalies.length} issue{result.anomalies.length !== 1 ? "s" : ""} found
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {result.anomalies.slice(0, 5).map((a) => (
                <div key={a.id} style={{ background: "#1a2332", borderRadius: "10px", padding: "14px", border: "1px solid rgba(255,255,255,0.08)", borderLeft: `3px solid ${SEVERITY_COLORS[a.severity] ?? "#6b7280"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: SEVERITY_COLORS[a.severity] }}>{a.severity}</span>
                    <span style={{ fontSize: "11px", color: "#6b7280" }}>{a.confidence}% confidence</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#e5e7eb" }}>{a.description}</div>
                </div>
              ))}
              {result.anomalies.length > 5 && (
                <div style={{ textAlign: "center", fontSize: "12px", color: "#6b7280", padding: "8px" }}>
                  +{result.anomalies.length - 5} more — view full report in dashboard
                </div>
              )}
            </div>
            <button
              onClick={() => { setResult(null); setFile(null); }}
              style={{ width: "100%", marginTop: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}
            >
              Analyse Another
            </button>
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: "10px", color: "#374151", marginTop: "16px" }}>
          Powered by Taylos Agent
        </div>
      </div>
    </div>
  );
}
