"use client";

import { useState } from "react";
import {
  Book, UploadCloud, FileText, FolderOpen, Layers, BarChart3,
  Mail, MessageSquare, Shield, ChevronRight, Info, Check,
} from "lucide-react";

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-muted)] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[var(--color-accent)]" />
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3 text-gray-100">{title}</h3>
      {children}
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 border my-4 flex gap-3 bg-blue-400/10 border-blue-400/30">
      <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-300" />
      <div className="text-sm leading-relaxed text-blue-300">{children}</div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Book },
  { id: "uploading", label: "Uploading Documents", icon: UploadCloud },
  { id: "anomalies", label: "Reading Results", icon: FileText },
  { id: "cases", label: "Managing Cases", icon: FolderOpen },
  { id: "batch", label: "Batch Processing", icon: Layers },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "chat", label: "Assistant Chat", icon: MessageSquare },
];

export function UserDocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen">
      {/* Sticky sidebar nav */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-[var(--color-border)] py-8 px-4 gap-1">
        <div className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-2">User Guide</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all w-full ${
              activeSection === item.id
                ? "bg-[var(--color-accent-muted)] text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
          </button>
        ))}
      </aside>

      {/* Content */}
      <div className="flex-1 px-4 md:px-12 py-8 max-w-4xl space-y-20 pb-40">
        {/* Overview */}
        <Section id="overview" title="Welcome to Taylos" icon={Book}>
          <p className="text-gray-300 leading-relaxed mb-4">
            Taylos is an AI-powered financial intelligence platform designed to help your finance team quickly detect anomalies, duplicate payments, and fraud indicators in your documents.
          </p>
          <p className="text-gray-300 leading-relaxed mb-6">
            Instead of manually reviewing thousands of rows in bank statements or invoices, you can upload them to Taylos. The platform will highlight anything that looks suspicious, categorise the issue, and provide a clear explanation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: UploadCloud, label: "Upload", desc: "Submit your financial files securely" },
              { icon: FileText, label: "Review", desc: "See clear explanations for flagged items" },
              { icon: FolderOpen, label: "Investigate", desc: "Track issues using cases" },
              { icon: BarChart3, label: "Report", desc: "View trends and export findings" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4 flex gap-3">
                <f.icon className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">{f.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Uploading */}
        <Section id="uploading" title="Uploading Documents" icon={UploadCloud}>
          <p className="text-gray-300 leading-relaxed mb-6">
            To get started, navigate to the <strong>Upload Documents</strong> section from the sidebar. You can drag and drop your files or click to select them from your computer.
          </p>

          <SubSection title="Supported File Types">
            <ul className="list-none space-y-2 mb-6">
              {[
                "CSV (Comma Separated Values)",
                "XLSX / XLS (Excel Spreadsheets)",
                "PDF (Bank statements, invoices, etc.)",
                "JSON (Structured data exports)",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                  <Check className="w-4 h-4 text-[var(--color-success)] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </SubSection>

          <Callout>
            For best results with spreadsheets and CSVs, ensure your column headers clearly identify the data (e.g., "Date", "Amount", "Vendor", "Description").
          </Callout>
        </Section>

        {/* Anomalies */}
        <Section id="anomalies" title="Reading Results" icon={FileText}>
          <p className="text-gray-300 leading-relaxed mb-6">
            Once a document is analysed, Taylos generates a report outlining any detected issues. These issues are called <strong>Anomalies</strong>.
          </p>

          <SubSection title="Anomaly Severity">
            <p className="text-gray-400 text-sm mb-4">Each anomaly is assigned a severity level to help you prioritise your review:</p>
            <div className="space-y-3">
              {[
                { label: "Critical", color: "text-[var(--color-critical)]", desc: "High financial risk or strong indicator of fraud." },
                { label: "High", color: "text-[var(--color-gold)]", desc: "Significant irregularities requiring immediate review." },
                { label: "Medium", color: "text-blue-400", desc: "Unusual patterns or policy deviations." },
                { label: "Low", color: "text-gray-400", desc: "Minor formatting issues or slight deviations from normal activity." },
              ].map((sev) => (
                <div key={sev.label} className="flex items-start gap-3 bg-[var(--color-surface-2)] p-3 rounded-lg border border-[var(--color-border)]">
                  <div className={`font-bold text-sm ${sev.color} w-20`}>{sev.label}</div>
                  <div className="text-sm text-gray-300">{sev.desc}</div>
                </div>
              ))}
            </div>
          </SubSection>
          
          <SubSection title="AI Confidence Score">
            <p className="text-gray-400 text-sm">
              You will also see a <strong>Confidence Score</strong> (0-100%). This represents how certain the AI is about its finding based on the available data. A lower score might indicate that more context is needed to confirm the anomaly.
            </p>
          </SubSection>
        </Section>

        {/* Cases */}
        <Section id="cases" title="Managing Cases" icon={FolderOpen}>
          <p className="text-gray-300 leading-relaxed mb-6">
            When you find an anomaly that requires further investigation, you can track it as a <strong>Case</strong>. This helps your team collaborate and maintain a record of how issues were resolved.
          </p>

          <SubSection title="The Case Workflow">
            <div className="flex items-center gap-3 flex-wrap mb-4">
              {[
                { label: "Open", color: "bg-[var(--color-critical)]/15 text-[var(--color-critical)] border-[var(--color-critical)]/20" },
                { label: "→", color: "" },
                { label: "In Review", color: "bg-[var(--color-gold)]/15 text-[var(--color-gold)] border-[var(--color-gold)]/20" },
                { label: "→", color: "" },
                { label: "Resolved", color: "bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/20" },
              ].map((step, i) => (
                step.color ? (
                  <span key={i} className={`px-3 py-1.5 rounded-full text-sm border font-medium ${step.color}`}>{step.label}</span>
                ) : (
                  <ChevronRight key={i} className="w-4 h-4 text-gray-600" />
                )
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              You can assign cases to team members, add comments as you investigate, and finally mark the case as resolved with a note explaining the outcome.
            </p>
          </SubSection>
        </Section>

        {/* Batch */}
        <Section id="batch" title="Batch Processing" icon={Layers}>
          <p className="text-gray-300 leading-relaxed mb-6">
            If you have a large number of documents to review (e.g., end-of-month reconciliation), use the <strong>Batch Jobs</strong> feature.
          </p>
          <p className="text-gray-400 text-sm mb-4">
            You can submit multiple files at once. The platform will process them in parallel and provide a consolidated summary of all findings once the batch is complete.
          </p>
        </Section>

        {/* Analytics */}
        <Section id="analytics" title="Analytics & Reporting" icon={BarChart3}>
          <p className="text-gray-300 leading-relaxed mb-6">
            The <strong>Analytics</strong> page gives you a high-level view of your organisation's financial health and the performance of your review process.
          </p>
          <ul className="list-none space-y-2 mb-6">
            {[
              "Track the total number of anomalies detected over time.",
              "See a breakdown of issues by severity.",
              "Monitor how quickly cases are being resolved.",
              "Export detailed reports to CSV for use in Excel or your ERP system.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                <ChevronRight className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* Chat */}
        <Section id="chat" title="Assistant Chat" icon={MessageSquare}>
          <p className="text-gray-300 leading-relaxed mb-6">
            Need help understanding a specific finding? Each report and case includes a built-in chat interface.
          </p>
          <p className="text-gray-400 text-sm">
            You can ask the AI assistant questions like "Why was this payment flagged?" or "What should I look for in the vendor invoice to verify this?". The assistant understands the context of your specific document and provides tailored advice.
          </p>
        </Section>

        <div className="border-t border-[var(--color-border)] pt-8 text-center text-gray-600 text-sm">
          Taylos · User Guide v1.0
        </div>
      </div>
    </div>
  );
}
