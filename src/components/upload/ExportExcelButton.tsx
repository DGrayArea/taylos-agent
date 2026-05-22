"use client";

import { Table } from "lucide-react";
import { exportAnomaliesToExcel } from "@/lib/utils";

export function ExportExcelButton({ analysis }: { analysis: any }) {
  if (!analysis?.feature_2_anomalies?.anomaly_list?.length) {
    return null;
  }

  return (
    <button
      onClick={() =>
        exportAnomaliesToExcel(
          analysis,
          `Taylos-Anomalies-${new Date().toISOString().slice(0, 10)}.xlsx`
        )
      }
      className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/30 text-sm transition-colors flex items-center gap-2"
    >
      <Table className="w-4 h-4" />
      Export Excel
    </button>
  );
}
