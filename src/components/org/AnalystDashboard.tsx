import { createClient } from "@/lib/supabase/server";
import { AnomalyOverview } from "@/components/anomalies/AnomalyOverview";
import { AnomalyList } from "@/components/anomalies/AnomalyList";
import { DashboardWelcome } from "@/components/upload/DashboardWelcome";
import { AnalysisChartsPanel } from "@/components/charts/AnalysisCharts";
import { DocumentChat } from "@/components/chat/DocumentChat";
import { ExportExcelButton } from "@/components/upload/ExportExcelButton";
import Link from "next/link";

interface AnalystDashboardProps {
  orgId: string;
  orgName: string;
}

export async function AnalystDashboard({ orgId, orgName }: AnalystDashboardProps) {
  const supabase = await createClient();

  // Fetch the most recent completed report for this organisation
  const { data: latestReport } = await supabase
    .from("reports")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch quick stats for this organisation
  const { data: allReports } = await supabase
    .from("reports")
    .select("id, issues, documents")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(100);

  const hasData = !!latestReport;

  const anomalyStats = hasData
    ? {
        critical:
          latestReport.data?.feature_2_anomalies?.anomalies_by_severity?.critical ?? 0,
        high:
          latestReport.data?.feature_2_anomalies?.anomalies_by_severity?.high ?? 0,
        medium:
          latestReport.data?.feature_2_anomalies?.anomalies_by_severity?.medium ?? 0,
        low:
          latestReport.data?.feature_2_anomalies?.anomalies_by_severity?.low ?? 0,
        totalRecords:
          latestReport.data?.analysis_metadata?.total_transactions_analyzed ?? 0,
        documentCount: latestReport.documents ?? 0,
        reportDate: latestReport.created_at,
      }
    : null;

  const anomalyList = hasData
    ? (latestReport.data?.feature_2_anomalies?.anomaly_list ?? [])
    : [];

  const totalReports = allReports?.length ?? 0;
  const totalIssues = allReports?.reduce((s, r) => s + (r.issues ?? 0), 0) ?? 0;
  const totalDocs = allReports?.reduce((s, r) => s + (r.documents ?? 0), 0) ?? 0;

  const spendingByCategory = latestReport?.data?.spending_by_category;
  const monthlyTrend = latestReport?.data?.monthly_trend;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 md:space-y-14 pb-24 overflow-x-hidden text-[13px]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">
            Workspace: {orgName}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Analyst Review Dashboard
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            {hasData
              ? `Showing results from your organisation's most recent review — ${new Date(
                  latestReport.created_at,
                ).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}`
              : "Upload financial documents to check for errors, duplicates, and irregularities."}
          </p>
        </div>
        {hasData && (
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/history"
              className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/30 text-sm transition-colors"
            >
              View All Reports
            </Link>
            <ExportExcelButton analysis={latestReport.data} />
          </div>
        )}
      </div>

      {/* All-time stats row — only when there is data */}
      {hasData && totalReports > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Reviews", value: totalReports },
            { label: "Documents Analysed", value: totalDocs },
            { label: "Total Issues Found", value: totalIssues, red: totalIssues > 0 },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/5 border border-white/10 p-5"
            >
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.red ? "text-[var(--color-critical)]" : "text-white"}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No data yet — show welcome/onboarding */}
      {!hasData && <DashboardWelcome />}

      {/* Issues Found in Your Documents */}
      {hasData && (
        <section className="relative space-y-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--color-critical)]/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-1">Issues Found in Your Documents</h2>
            <p className="text-gray-400 text-sm">
              From your most recent review — {new Date(latestReport.created_at).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          <AnomalyOverview stats={anomalyStats} />

          {/* Charts */}
          <AnalysisChartsPanel
            anomaliesBySeverity={anomalyStats ?? undefined}
            spendingByCategory={spendingByCategory}
            monthlyTrend={monthlyTrend}
          />

          <AnomalyList anomalies={anomalyList} />

          {/* Chat with Document */}
          <div className="mt-8">
            <DocumentChat analysisContext={latestReport.data} />
          </div>
        </section>
      )}
    </div>
  );
}
