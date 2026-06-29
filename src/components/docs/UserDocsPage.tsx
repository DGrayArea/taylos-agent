"use client";

import { useState } from "react";
import {
  Book, UploadCloud, FileText, FolderOpen, Layers, BarChart3,
  Mail, MessageSquare, Shield, ChevronRight, Info, Check,
  ArrowDown, Clock, Bot, Sparkles, ArrowRight, User, Cpu, Terminal
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

function InteractiveAnalystView() {
  const [activeTab, setActiveTab] = useState("summary");

  const tabs = [
    { id: "summary", label: "Tab 1 — Summary" },
    { id: "documents", label: "Tab 2 — Documents" },
    { id: "chat", label: "Tab 3 — Chat" },
    { id: "timeline", label: "Tab 4 — Timeline" },
    { id: "actions", label: "Tab 5 — Actions" },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm overflow-hidden mb-8">
      {/* Tab bar */}
      <div className="flex border-b border-white/10 bg-white/5 scrollbar-thin overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab.id
                ? "border-[var(--color-accent)] text-white bg-white/[0.02]"
                : "border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="p-5 min-h-[180px] text-xs leading-relaxed text-gray-300">
        {activeTab === "summary" && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold text-indigo-400">AI Investigation Report</div>
            <p>
              The full AI investigation report: what happened, why, classification, evidence chain, impact, confidence score, and recommendation. Everything needed to make a decision without touching the raw documents.
            </p>
          </div>
        )}
        
        {activeTab === "documents" && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold text-indigo-400">Document Management</div>
            <p>
              All uploaded files in one place. Analyst can open any document and see exactly which data points the agent extracted from it, highlighted in context.
            </p>
          </div>
        )}
        
        {activeTab === "chat" && (
          <div className="space-y-3">
            <div className="text-[10px] uppercase font-bold text-indigo-400">Conversational AI Chat</div>
            <p>
              Conversational interface with the agent. Analyst can ask anything about the case:
            </p>
            <div className="space-y-1.5 pl-2 border-l border-white/10 font-mono text-[11px] text-indigo-300">
              <div>"Why did you classify this as a billing error and not fraud?"</div>
              <div>"What is the probability this is customer error instead?"</div>
              <div>"Show me similar cases from the last 90 days"</div>
              <div>"Draft a response email to the customer"</div>
            </div>
            <p className="text-gray-400 italic mt-2">
              Agent responds with full reasoning, referencing specific evidence from the case. Conversation saved permanently.
            </p>
          </div>
        )}
        
        {activeTab === "timeline" && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold text-indigo-400">Audit Trail Timeline</div>
            <p>
              Every action taken on the case in chronological order — when it was opened, who it was assigned to, what decisions were made, what the customer was told, when it was resolved. Immutable and exportable for compliance.
            </p>
          </div>
        )}
        
        {activeTab === "actions" && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold text-indigo-400">Resolution Console</div>
            <p>
              Approve, reject, escalate, request more information, contact customer, export report. Every action logged automatically with timestamp and user ID.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CaseLifecycleFlow() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto my-8">
      {/* Top Section: Linear Flow */}
      <div className="flex flex-col items-center">
        {[
          { title: "TRIGGERED", desc: "Something flags an anomaly — upload, monitor, complaint, API" },
          { title: "INTAKE", desc: "Agent reads all attached documents, extracts data, builds unified model" },
          { title: "ANALYZING", desc: "Agent scans for anomalies, scores severity, runs investigation" },
          { title: "OPEN", desc: "Case created with full AI report, recommendation, and evidence chain. Appears on dashboard." },
        ].map((step, idx) => (
          <div key={idx} className="flex flex-col items-center w-full max-w-md">
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4 w-full text-center relative hover:border-[var(--color-accent)] transition-all">
              <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Status: {step.title}</div>
              <div className="text-[11px] text-gray-305 leading-relaxed">{step.desc}</div>
            </div>
            <div className="h-6 w-0.5 bg-gradient-to-b from-indigo-500 to-transparent my-1" />
          </div>
        ))}
      </div>

      {/* Branching Path Container */}
      <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-5 md:p-6 space-y-6">
        <div className="text-center pb-3 border-b border-white/5">
          <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
            Decision & Processing Paths
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Path A: Assigned to analyst */}
          <div className="space-y-4 md:border-r md:border-white/5 md:pr-6">
            <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-center">
              <div className="text-[10px] text-indigo-400 font-bold uppercase">Manual Path</div>
              <div className="text-xs font-semibold text-white">Assigned to analyst</div>
            </div>
            
            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="p-3.5 rounded-lg bg-black/30 border border-white/5 space-y-1 text-center md:text-left">
              <div className="text-xs font-bold text-white uppercase tracking-wider">IN REVIEW</div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Analyst reads report, asks agent questions via chat interface, makes decision
              </p>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-indigo-400" />
            </div>

            {/* Split within Analyst Path */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded bg-emerald-500/[0.02] border border-emerald-500/10 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="text-[9px] font-bold text-emerald-400 uppercase">Straightforward</div>
                  <p className="text-[10px] text-gray-400 mt-1">Analyst approves AI recommendation</p>
                </div>
                <div className="text-xs font-bold text-emerald-300 border-t border-emerald-500/10 pt-1.5 mt-2">
                  ✓ RESOLVED
                </div>
              </div>
              
              <div className="p-3 rounded bg-amber-500/[0.02] border border-amber-500/10 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="text-[9px] font-bold text-amber-400 uppercase">Complex / Uncertain</div>
                  <p className="text-[10px] text-gray-400 mt-1">Analyst escalates; Senior review & additional documents requested</p>
                </div>
                <div className="text-xs font-bold text-emerald-300 border-t border-emerald-500/10 pt-1.5 mt-2">
                  ✓ RESOLVED
                </div>
              </div>
            </div>
          </div>

          {/* Path B: Auto Resolution */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-center">
                <div className="text-[10px] text-emerald-400 font-bold uppercase">Automated Path</div>
                <div className="text-xs font-semibold text-white">Agent confidence very high (95%+)</div>
                <div className="text-[9px] text-emerald-300 italic mt-0.5">Auto-resolution enabled</div>
              </div>
              
              <div className="flex justify-center">
                <ArrowDown className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="p-3.5 rounded-lg bg-black/30 border border-white/5 space-y-1 text-center md:text-left">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AUTO RESOLVED</div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  No human needed. Action executed, customer notified.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                <div className="text-xs font-bold text-white uppercase tracking-wider">CLOSED</div>
                <p className="text-[10px] text-gray-450 mt-1">Immutable audit trail recorded</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketingComparison() {
  return (
    <div className="space-y-4 mb-8">
      <p className="text-gray-300 leading-relaxed text-sm">
        A regular ticketing system like Zendesk or Jira opens a ticket, routes it to a human, and leaves the investigation to the analyst. Taylos Agent flips this model entirely.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-rose-500/15 bg-rose-500/[0.02] p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <div className="p-1 rounded bg-rose-500/10">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Regular Ticketing System (Zendesk/Jira)</span>
          </div>
          
          <ul className="space-y-2 text-xs text-gray-450 pl-1 list-disc list-inside">
            <li>Opens a ticket when a complaint comes in</li>
            <li>Routes it to a human</li>
            <li>Human does all the investigation manually</li>
            <li>Human writes the resolution</li>
            <li>Human closes the ticket</li>
          </ul>
        </div>
        
        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.02] p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <div className="p-1 rounded bg-emerald-500/10">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Taylos Agent</span>
          </div>
          
          <ul className="space-y-2 text-xs text-gray-300 pl-1 list-disc list-inside">
            <li>Opens a case when a complaint comes in OR finds the problem itself</li>
            <li>AI does the entire investigation automatically</li>
            <li>AI writes the recommendation with full evidence</li>
            <li>Human reviews and approves in seconds</li>
            <li>AI drafts the customer communication</li>
            <li>Case closes with a complete audit trail</li>
          </ul>
        </div>
      </div>
      
      <p className="text-xs text-gray-400 italic text-center mt-3 bg-white/[0.02] py-2 px-4 rounded-lg border border-white/5">
        "The human goes from doing the work to approving the work — a fundamentally different role that scales without adding headcount."
      </p>
    </div>
  );
}

function NumbersInPractice() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Without Taylos Agent</div>
          <div className="font-mono text-xs text-gray-400 space-y-1">
            <div>100 cases/day</div>
            <div>× 2.5 hours per case</div>
            <div className="text-white font-bold text-sm border-t border-white/5 pt-1.5 mt-1.5 flex justify-between">
              <span>Total Work:</span>
              <span>250 analyst hours/day</span>
            </div>
            <div className="text-rose-450 font-semibold text-[11px] flex justify-between">
              <span>Required Capacity:</span>
              <span>31 full-time analysts</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">With Taylos Agent</div>
          <div className="font-mono text-xs text-gray-300 space-y-1">
            <div>100 cases/day</div>
            <div>× 4 minutes human review per case</div>
            <div className="text-emerald-450 font-bold text-sm border-t border-white/5 pt-1.5 mt-1.5 flex justify-between">
              <span>Total Work:</span>
              <span>6.7 analyst hours/day</span>
            </div>
            <div className="text-emerald-300 font-semibold text-[11px] flex justify-between">
              <span>Required Capacity:</span>
              <span>1 analyst for oversight</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
        <div className="text-xs font-bold text-white uppercase tracking-widest mb-0.5">Efficiency Gain</div>
        <div className="text-lg font-black text-emerald-400">Time Saved: 243 hours / day</div>
      </div>
      
      <p className="text-xs text-gray-400 leading-relaxed border-l-2 border-[var(--color-accent)] pl-4 py-1 italic">
        That is the full case system. The short version: every anomaly becomes a tracked, assigned, deadline-monitored, AI-investigated case that moves from detection to resolution with as little human friction as possible — and leaves a complete audit trail at every step.
      </p>
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
            Every anomaly detected by Taylos becomes a tracked, assigned, deadline-monitored, and AI-investigated case that moves from detection to resolution with as little human friction as possible — and leaves a complete audit trail at every step.
          </p>

          {/* 1. What Triggers a Case */}
          <SubSection title="What Triggers a Case">
            <p className="text-gray-300 leading-relaxed mb-4">
              Every case starts in one of three ways:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  User-triggered
                </div>
                <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4 leading-relaxed">
                  <li>Analyst uploads documents manually (statement, invoice, complaint)</li>
                  <li>Bank staff submits a customer dispute from their system via API</li>
                  <li>Customer submits a complaint through the embeddable widget</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-wide flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  Agent-triggered
                </div>
                <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4 leading-relaxed">
                  <li>Continuous monitoring detects an anomaly in a live transaction feed</li>
                  <li>Batch processing completes and flags issues across multiple statements</li>
                  <li>Pattern learning identifies a new anomaly type matching past cases</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  System-triggered
                </div>
                <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4 leading-relaxed">
                  <li>Webhook fires from an integrated banking system</li>
                  <li>Scheduled monitoring job completes and finds irregularities</li>
                  <li>Regulatory deadline approaching on an existing unresolved case</li>
                </ul>
              </div>
            </div>
          </SubSection>

          {/* 2. What a Case Looks Like */}
          <SubSection title="What a Case Looks Like">
            <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-6 font-mono text-xs text-gray-300 max-w-2xl mx-auto shadow-2xl relative overflow-hidden mb-8">
              <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-500/10 border-l border-b border-white/10 rounded-bl-lg text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                Simulated AI File
              </div>
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <div className="font-bold text-sm text-white">CASE #0031</div>
                <div className="text-gray-500 text-[10px]">Taylos Audit Engine v2.0</div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-[11px]">
                <div className="space-y-1">
                  <div><span className="text-gray-500">Type:</span> <span className="text-white font-semibold">Duplicate Charge</span></div>
                  <div><span className="text-gray-500">Status:</span> <span className="text-indigo-400 font-semibold uppercase">Open</span></div>
                  <div><span className="text-gray-500">Priority:</span> <span className="text-[var(--color-critical)] font-semibold uppercase">High</span></div>
                </div>
                <div className="space-y-1">
                  <div><span className="text-gray-500">Triggered by:</span> <span className="text-white">Customer Complaint</span></div>
                  <div><span className="text-gray-500">Opened:</span> <span className="text-white">June 25, 2026 — 09:14 AM</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-3 mb-4 text-[11px]">
                <div><span className="text-gray-500">CUSTOMER:</span> <span className="text-white font-bold">Adaeze Okonkwo</span></div>
                <div><span className="text-gray-500">ACCOUNT:</span> <span className="text-white font-mono">****4829</span></div>
                <div className="col-span-2"><span className="text-gray-500">ASSIGNED TO:</span> <span className="text-gray-400 italic">Unassigned</span></div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-gray-500 font-semibold mb-1">DOCUMENTS ATTACHED:</div>
                  <ul className="list-none space-y-1 pl-2 text-indigo-300">
                    <li className="flex items-center gap-1.5">📄 bank_statement_march.pdf</li>
                    <li className="flex items-center gap-1.5">📄 invoice_003.pdf</li>
                    <li className="flex items-center gap-1.5">📄 customer_complaint_email.txt</li>
                  </ul>
                </div>

                <div>
                  <div className="text-gray-500 font-semibold mb-1">ANOMALY DETECTED:</div>
                  <p className="text-gray-300 leading-relaxed bg-white/[0.01] p-2.5 rounded border border-white/5">
                    Two $500 charges from Amazon Payment Processing on March 15, 45 minutes apart. One invoice for $500 exists.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-500 font-semibold mb-1">CLASSIFICATION:</div>
                    <div className="text-white font-semibold">Billing Error — Processor Retry</div>
                  </div>
                  <div>
                    <div className="text-gray-500 font-semibold mb-1">CONFIDENCE:</div>
                    <div className="text-emerald-400 font-bold">98%</div>
                  </div>
                </div>

                <div>
                  <div className="text-gray-500 font-semibold mb-1">EVIDENCE:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-gray-400">
                    <li>Transaction 1: $500 @ 3:02 AM</li>
                    <li>Transaction 2: $500 @ 3:47 AM</li>
                    <li>Invoice amount: $500 (one charge)</li>
                    <li>Time gap: 45 min (retry pattern)</li>
                    <li>Merchant: same processor both times</li>
                    <li>Account standing: Clean history</li>
                    <li>Customer: Reported immediately</li>
                  </ul>
                </div>

                <div>
                  <div className="text-gray-500 font-semibold mb-1">IMPACT:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-gray-400">
                    <li>Customer overcharged: $500</li>
                    <li>Account balance affected</li>
                    <li>Customer frustrated</li>
                    <li>Regulatory timeline: 10 days</li>
                  </ul>
                </div>

                <div>
                  <div className="text-gray-500 font-semibold mb-1">AI RECOMMENDATION:</div>
                  <p className="text-emerald-300 bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                    Approve full $500 refund. Escalate to processor for retry bug investigation.
                  </p>
                </div>
              </div>

              <div>
                <div className="text-gray-500 font-semibold mb-2">ACTIONS:</div>
                <div className="flex gap-2 flex-wrap text-[10px]">
                  <span className="px-2.5 py-1.5 rounded bg-emerald-600 font-bold text-white cursor-pointer select-none">APPROVE REFUND</span>
                  <span className="px-2.5 py-1.5 rounded bg-white/5 font-bold text-gray-300 border border-white/10 cursor-pointer select-none">REQUEST MORE INFO</span>
                  <span className="px-2.5 py-1.5 rounded bg-amber-600/20 text-amber-300 font-bold border border-amber-500/20 cursor-pointer select-none">ESCALATE</span>
                  <span className="px-2.5 py-1.5 rounded bg-rose-950/30 text-rose-400 font-bold border border-rose-500/20 cursor-pointer select-none">REJECT</span>
                  <span className="px-2.5 py-1.5 rounded bg-white/5 font-bold text-gray-300 border border-white/10 cursor-pointer select-none">CONTACT CUSTOMER</span>
                </div>
              </div>
            </div>
          </SubSection>

          {/* 3. Case Lifecycle */}
          <SubSection title="Case Lifecycle">
            <p className="text-gray-300 leading-relaxed text-sm mb-4">
              Every case moves through a defined sequence from the moment it is opened to the moment it is closed:
            </p>
            <CaseLifecycleFlow />
          </SubSection>

          {/* 4. Case Types */}
          <SubSection title="Case Types">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { title: "Billing Error Cases", desc: "Duplicate charges, wrong amounts, mismatched invoices. Most common case type. Usually high confidence, fast resolution. Typical outcome: refund approved." },
                { title: "Fraud Cases", desc: "Unauthorized transactions, suspicious patterns, geographic anomalies, account compromise indicators. Require more scrutiny before resolution. Typical outcome: account review, block, or customer verification." },
                { title: "Data Quality Cases", desc: "Missing merchant info, corrupted entries, incomplete records. Not always financial — often about fixing the underlying data so future analysis is more accurate." },
                { title: "Dispute Cases", desc: "Customer disagrees with a legitimate charge. Agent investigates, finds the charge is valid, and prepares a plain-language explanation for the customer. Typical outcome: case closed as legitimate, customer educated." },
                { title: "Ghost Vendor Cases", desc: "Payments to unrecognized vendors with no purchase order. Require internal investigation. Typical outcome: escalated to finance team or compliance." },
                { title: "Monitoring Alert Cases", desc: "Opened automatically by the continuous monitoring system when live transaction feeds show anomalies. No human filed a complaint — the agent found it proactively." },
                { title: "Compliance Cases", desc: "Cases approaching regulatory deadlines that have not been resolved. Auto-escalated with urgency flags to ensure the institution stays within required timelines." },
              ].map((type, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                  <div className="text-xs font-bold text-white mb-1.5">{type.title}</div>
                  <p className="text-xs text-gray-400 leading-relaxed">{type.desc}</p>
                </div>
              ))}
            </div>
          </SubSection>

          {/* 5. Inside a Case — What the Analyst Sees */}
          <SubSection title="Inside a Case — What the Analyst Sees">
            <InteractiveAnalystView />
          </SubSection>

          {/* 6. Regulatory & Auto-Resolution Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-400" />
                Regulatory Deadline Tracking
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">
                Every case has a countdown clock from the moment it opens. The platform enforces regulatory timelines automatically:
              </p>
              <div className="p-5 rounded-xl border border-[var(--color-critical)]/20 bg-[var(--color-critical)]/[0.02] font-mono text-xs text-gray-300 space-y-3 shadow-lg">
                <div className="flex justify-between items-center text-[10px] text-rose-405 font-bold uppercase tracking-wider">
                  ⚠️ Regulatory Countdown
                </div>
                <div className="text-white font-bold text-sm">CASE #0031 — Billing Error</div>
                <div className="space-y-1 text-[11px]">
                  <div><span className="text-gray-500">Opened:</span> June 25</div>
                  <div><span className="text-gray-500">Regulatory deadline:</span> July 5</div>
                  <div><span className="text-gray-500">Time remaining:</span> <span className="text-rose-450 font-bold">9 days 14 hours</span></div>
                  <div><span className="text-gray-500">Status:</span> <span className="text-emerald-400 font-bold uppercase">ON TRACK</span></div>
                </div>
                <div className="text-[10px] text-gray-550 border-t border-white/5 pt-2 space-y-1 leading-relaxed">
                  <div>If unresolved by July 3: <span className="text-amber-400">→ Auto-escalated to senior analyst</span></div>
                  <div>If unresolved by July 4: <span className="text-rose-400">→ Compliance team notified</span></div>
                  <div>If unresolved by July 5: <span className="text-[var(--color-critical)] font-bold">→ Regulatory breach flagged, management alerted</span></div>
                </div>
              </div>
              <p className="text-xs text-gray-450 leading-relaxed mt-3">
                No case falls through the cracks. The system enforces the deadline whether or not a human is paying attention.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Auto-Resolution
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">
                For cases where agent confidence is very high (95%+) and the case type is straightforward (duplicate charge, clear billing error), the platform can be configured to resolve automatically without human review:
              </p>
              <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] font-mono text-xs text-gray-300 space-y-3 shadow-lg">
                <div className="flex justify-between items-center text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  🤖 Automated Resolve
                </div>
                <div className="text-white font-bold text-sm">Case #0044 — AUTO RESOLVED</div>
                <div className="space-y-1 text-[11px]">
                  <div><span className="text-gray-500">Confidence:</span> <span className="text-emerald-400 font-bold">98%</span></div>
                  <div><span className="text-gray-500">Classification:</span> Billing Error</div>
                  <div><span className="text-gray-500">Action taken:</span> <span className="text-white">Refund $500 approved</span></div>
                  <div><span className="text-gray-500">Customer notified:</span> Yes</div>
                  <div><span className="text-gray-500">Time to resolution:</span> <span className="text-emerald-300 font-bold">47 seconds</span></div>
                  <div><span className="text-gray-500">Human involvement:</span> <span className="text-gray-500 italic">None required</span></div>
                  <div><span className="text-gray-500">Audit trail:</span> Complete</div>
                </div>
              </div>
              <p className="text-xs text-gray-450 leading-relaxed mt-3">
                This is what enables the platform to handle thousands of cases per day without a proportional increase in analyst headcount.
              </p>
            </div>
          </div>

          {/* 7. Customer Notification */}
          <SubSection title="Customer Notification">
            <p className="text-gray-400 text-sm mb-4">
              When a case is resolved, the agent drafts a plain-language email to the customer automatically:
            </p>
            <div className="rounded-xl border border-white/10 bg-black/30 p-5 font-mono text-xs text-gray-350 max-w-xl mx-auto shadow-lg mb-4">
              <div className="text-[10px] text-gray-500 border-b border-white/5 pb-2 mb-3 space-y-0.5">
                <div><span className="text-gray-655">Subject:</span> Your dispute has been resolved</div>
              </div>
              <div className="space-y-3 leading-relaxed text-gray-250">
                <p>Hi Adaeze,</p>
                <p>We investigated the duplicate charge of $500 on your account dated March 15.</p>
                <div>
                  <div className="font-bold text-white mb-0.5">What happened:</div>
                  <p className="text-gray-400">Our payment processor charged you twice for the same transaction due to a technical error on their end.</p>
                </div>
                <div>
                  <div className="font-bold text-white mb-0.5">What we did:</div>
                  <p className="text-gray-400">A full refund of $500 has been approved and will appear in your account within 2-3 business days.</p>
                </div>
                <p>We apologize for the inconvenience. If you have any questions, reply to this email.</p>
                <p className="text-gray-500 font-semibold mt-2">— Taylos Powered Support</p>
              </div>
            </div>
            <p className="text-xs text-gray-450 leading-relaxed text-center mt-3">
              Analyst reviews, adjusts if needed, sends with one click. No writing required.
            </p>
          </SubSection>

          {/* 8. Comparison Table: Ticketing vs Agent */}
          <SubSection title="What Makes This Different From a Regular Ticketing System">
            <TicketingComparison />
          </SubSection>

          {/* 9. The Numbers in Practice */}
          <SubSection title="The Numbers in Practice">
            <NumbersInPractice />
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
