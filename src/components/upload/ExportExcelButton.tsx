"use client";

import { Table } from "lucide-react";
import { useState } from "react";
import { exportAnomaliesToExcel } from "@/lib/utils";

export function ExportExcelButton({ analysis }: { analysis: any }) {
  const [status, setStatus] = useState<string | null>(null);

  if (!analysis?.feature_2_anomalies?.anomaly_list?.length) {
    return null;
  }

  const handleExport = () => {
    try {
      exportAnomaliesToExcel(
        analysis,
        `Taylos-Anomalies-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      setStatus("Exported successfully");
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error("Export Excel failed", error);
      setStatus("Export failed");
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleExport}
        className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/30 text-sm transition-colors flex items-center gap-2"
      >
        <Table className="w-4 h-4" />
        Export Excel
      </button>
      {status && <span className="text-sm text-gray-300/80">{status}</span>}
    </div>
  );
}
