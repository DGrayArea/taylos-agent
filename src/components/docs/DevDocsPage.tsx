"use client";

import { useState } from "react";
import {
  Book, Code, Webhook, Shield, Layers, Activity, BarChart3, Mail,
  MessageSquare, Lock, FileText, Key, ChevronRight, Copy, Check,
  ExternalLink, AlertTriangle, Info,
} from "lucide-react";

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl bg-black/40 border border-white/10 overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <span className="text-xs text-gray-500 font-mono">{lang}</span>
        <button onClick={handleCopy} className="text-gray-500 hover:text-white transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">{code}</pre>
    </div>
  );
}

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

function Callout({ type, children }: { type: "info" | "warning" | "tip"; children: React.ReactNode }) {
  const configs = {
    info: { bg: "bg-blue-400/10 border-blue-400/30", icon: Info, color: "text-blue-300" },
    warning: { bg: "bg-yellow-400/10 border-yellow-400/30", icon: AlertTriangle, color: "text-yellow-300" },
    tip: { bg: "bg-green-400/10 border-green-400/30", icon: Check, color: "text-green-300" },
  };
  const cfg = configs[type];
  return (
    <div className={`rounded-xl p-4 border my-4 flex gap-3 ${cfg.bg}`}>
      <cfg.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
      <div className={`text-sm leading-relaxed ${cfg.color}`}>{children}</div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Book },
  { id: "rest-api", label: "REST API", icon: Code },
  { id: "widget", label: "Embeddable Widget", icon: ExternalLink },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "monitoring", label: "Monitoring Mode", icon: Activity },
  { id: "batch", label: "Batch Processing", icon: Layers },
  { id: "cases", label: "Case Management", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "rbac", label: "Roles & Permissions", icon: Shield },
  { id: "audit", label: "Audit Log", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Mail },
  { id: "chat", label: "Agent Chat", icon: MessageSquare },
  { id: "security", label: "Security & Privacy", icon: Key },
];

export function DevDocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen">
      {/* Sticky sidebar nav */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-[var(--color-border)] py-8 px-4 gap-1">
        <div className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-2">Developer Docs</div>
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
            {item.id === "notifications" && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[var(--color-gold-muted)] text-[var(--color-gold)] border border-[var(--color-gold)]/25 flex-shrink-0">
                Soon
              </span>
            )}
          </button>
        ))}
      </aside>

      {/* Content */}
      <div className="flex-1 px-4 md:px-12 py-8 max-w-4xl space-y-20 pb-40">
        {/* Overview */}
        <Section id="overview" title="API & Platform Overview" icon={Book}>
          <p className="text-gray-300 leading-relaxed mb-4">
            <strong className="text-white">Taylos</strong> provides a REST API to interact programmatically with the platform.
            You can analyse financial documents, manage batch jobs, retrieve anomalies, and register webhooks.
          </p>
          <p className="text-gray-300 leading-relaxed mb-6">
            Every feature is exposed via the API, making it suitable for embedding into your own pipelines and applications.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Code, label: "REST API", desc: "POST documents, get JSON back" },
              { icon: ExternalLink, label: "Embeddable Widget", desc: "Drop into any website easily" },
              { icon: Webhook, label: "Webhooks", desc: "Signed delivery to your endpoints" },
              { icon: Activity, label: "Live Monitoring", desc: "Continuous anomaly detection" },
              { icon: Layers, label: "Batch Processing", desc: "Process up to 10,000 documents" },
              { icon: FileText, label: "Case Management", desc: "Tracked anomaly resolution workflow" },
              { icon: BarChart3, label: "Analytics", desc: "Aggregated metrics" },
              { icon: Lock, label: "Audit Log", desc: "Immutable, queryable, exportable" },
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

        {/* REST API */}
        <Section id="rest-api" title="REST API" icon={Code}>
          <p className="text-gray-300 leading-relaxed mb-6">
            All REST endpoints live under <code className="text-[var(--color-accent)] bg-black/30 px-1.5 py-0.5 rounded text-sm">/api/v1/</code>.
            Every request requires an <code className="text-[var(--color-accent)] bg-black/30 px-1.5 py-0.5 rounded text-sm">X-API-Key</code> header.
            Get your API key from <strong>Settings → API Keys</strong>.
          </p>

          <SubSection title="Authentication">
            <CodeBlock lang="http" code={`POST /api/v1/analyze HTTP/1.1
Host: taylos-agent.vercel.app
X-API-Key: tk_your_api_key_here
Content-Type: application/json`} />
            <Callout type="warning">
              Never expose your API key in client-side JavaScript or public repositories. Use environment variables.
            </Callout>
          </SubSection>

          <SubSection title="Analyse Documents">
            <p className="text-gray-400 text-sm mb-3">Submit one or more documents for analysis. Returns structured JSON with anomalies classified.</p>
            <CodeBlock lang="curl" code={`curl -X POST https://taylos-agent.vercel.app/api/v1/analyze \\
  -H "X-API-Key: tk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '[
    {
      "filename": "bank_statement_jan.csv",
      "content_type": "text/csv",
      "raw_text": "Date,Amount,Merchant\\n2025-01-15,50000,Unknown Vendor"
    }
  ]'`} />
            <p className="text-sm text-gray-400 mb-3">Response:</p>
            <CodeBlock lang="json" code={`{
  "jobId": "uuid",
  "reportId": "uuid",
  "status": "complete",
  "anomalies": [
    {
      "id": "ANOM-001",
      "type": "GHOST_VENDOR",
      "severity": "HIGH",
      "confidence": 87,
      "description": "Payment to unrecognised vendor with no PO reference.",
      "financial_impact": "₦50,000 at risk",
      "recommended_action": "Request supporting invoice and PO from vendor."
    }
  ],
  "classifications": { "critical": 0, "high": 1, "medium": 0, "low": 0 },
  "confidence_scores": [{ "id": "ANOM-001", "confidence": 87, "anomaly_score": 76 }],
  "executive_summary": { "finding": "...", "priority": "HIGH" },
  "processing_time_seconds": 3.2
}`} />
          </SubSection>

          <SubSection title="Rate Limiting">
            <p className="text-gray-400 text-sm mb-3">Each API key has a default limit of <strong>5 requests per minute</strong>. When exceeded:</p>
            <CodeBlock lang="json" code={`// HTTP 429
{ "error": "Rate limit exceeded. Try again next minute." }`} />
          </SubSection>

          <SubSection title="All Endpoints">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[var(--color-border)] rounded-xl overflow-hidden">
                <thead className="bg-[var(--color-surface-2)]">
                  <tr>
                    {["Method", "Endpoint", "Description"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {[
                    ["POST", "/api/v1/analyze", "Analyse documents"],
                    ["GET", "/api/v1/status/:jobId", "Poll job status"],
                    ["POST", "/api/v1/batch", "Submit batch of documents"],
                    ["GET", "/api/v1/batch", "List batch jobs"],
                    ["GET", "/api/v1/batch?batchId=", "Get specific batch"],
                    ["GET", "/api/v1/export/csv?reportId=", "Export report as CSV"],
                    ["POST", "/api/cases", "Create a case"],
                    ["GET", "/api/cases", "List cases"],
                    ["GET", "/api/cases/:id", "Get case detail"],
                    ["PATCH", "/api/cases/:id", "Update case / add comment"],
                    ["POST", "/api/notifications/send", "Send email notification"],
                    ["GET", "/api/notifications/send", "Preview email (no send)"],
                    ["POST", "/api/monitor/poll", "Trigger live monitoring check"],
                  ].map(([method, endpoint, desc]) => (
                    <tr key={endpoint} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${method === "POST" ? "bg-blue-400/15 text-blue-300" : method === "GET" ? "bg-green-400/15 text-green-300" : "bg-yellow-400/15 text-yellow-300"}`}>
                          {method}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-300">{endpoint}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SubSection>
        </Section>

        {/* Widget */}
        <Section id="widget" title="Embeddable Widget" icon={ExternalLink}>
          <p className="text-gray-300 leading-relaxed mb-6">
            Drop a single <code className="text-[var(--color-accent)] bg-black/30 px-1.5 py-0.5 rounded text-sm">&lt;script&gt;</code> tag
            into any website to embed a fully functional analysis widget. No build step required.
          </p>

          <SubSection title="Quick Embed">
            <CodeBlock lang="html" code={`<!-- Add before </body> -->
<script
  src="https://taylos-agent.vercel.app/widget.js"
  data-api-key="tk_your_api_key"
  data-url="https://taylos-agent.vercel.app"
  data-theme="dark"
></script>`} />
          </SubSection>

          <SubSection title="Widget Attributes">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[var(--color-border)] rounded-xl overflow-hidden">
                <thead className="bg-[var(--color-surface-2)]">
                  <tr>
                    {["Attribute", "Required", "Description"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] text-sm">
                  {[
                    ["data-api-key", "Yes", "Your API key (tk_...)"],
                    ["data-url", "Yes", "Taylos deployment URL"],
                    ["data-theme", "No", "dark (default) or light"],
                    ["data-container", "No", "CSS selector for custom mount point"],
                  ].map(([attr, req, desc]) => (
                    <tr key={attr}>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-accent)]">{attr}</td>
                      <td className="px-4 py-3 text-xs">{req}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SubSection>

          <SubSection title="JavaScript API">
            <CodeBlock lang="javascript" code={`// After the script loads, TaylosWidget is available globally:
TaylosWidget.open()      // Open the widget panel
TaylosWidget.close()     // Close the widget panel
TaylosWidget.toggle()    // Toggle open/closed
TaylosWidget.setApiKey("tk_new_key") // Swap API key at runtime`} />
          </SubSection>

          <Callout type="info">
            The widget renders in an iframe pointing to <code>/widget</code>. The API key is passed securely via URL parameter to the widget endpoint.
          </Callout>
        </Section>

        {/* Webhooks */}
        <Section id="webhooks" title="Webhooks" icon={Webhook}>
          <p className="text-gray-300 leading-relaxed mb-6">
            Register an HTTPS endpoint to receive real-time notifications when analyses complete, cases are resolved, or monitors fire alerts.
            All payloads are signed with <strong>HMAC-SHA256</strong>.
          </p>

          <SubSection title="Payload Format">
            <CodeBlock lang="json" code={`{
  "event": "analysis.complete",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "reportId": "uuid",
    "jobId": "uuid",
    "anomalyCount": 3,
    "summary": { "priority": "HIGH", "finding": "..." }
  }
}`} />
          </SubSection>

          <SubSection title="Verifying the Signature">
            <CodeBlock lang="javascript" code={`const crypto = require("crypto");

function verifyWebhook(body, signature, secret) {
  const expected = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// Express example
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["x-taylos-signature"];
  if (!verifyWebhook(req.body, sig, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send("Invalid signature");
  }
  const event = JSON.parse(req.body);
  console.log("Event:", event.event, event.data);
  res.sendStatus(200);
});`} />
          </SubSection>

          <SubSection title="Available Events">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "analysis.complete", "batch.complete", "monitor.alert",
                "case.create", "case.resolve", "notification.send",
              ].map((e) => (
                <div key={e} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 font-mono text-xs text-gray-300">
                  {e}
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Retry Policy">
            <p className="text-gray-400 text-sm">Failed deliveries are retried up to <strong className="text-white">3 times</strong> with exponential backoff: 2s → 4s → 8s. After all retries are exhausted, the delivery is marked <code className="text-red-400">failed</code> in the <code>webhook_deliveries</code> table.</p>
          </SubSection>
        </Section>

        {/* Monitoring */}
        <Section id="monitoring" title="Continuous Monitoring" icon={Activity}>
          <p className="text-gray-300 leading-relaxed mb-6">
            Instead of one-off uploads, connect a live data source URL and check it on a set interval.
            The dashboard polls <code className="text-[var(--color-accent)] bg-black/30 px-1.5 py-0.5 rounded text-sm">/api/monitor/poll</code> and pushes
            real-time alerts when anomalies above your threshold are detected.
          </p>

          <SubSection title="API Usage">
            <CodeBlock lang="curl" code={`curl -X POST https://taylos-agent.vercel.app/api/monitor/poll \\
  -H "Content-Type: application/json" \\
  -d '{
    "sourceUrl": "https://erp.example.com/exports/daily-transactions.csv",
    "accountRef": "ACCT-001",
    "threshold": "high"
  }'`} />
          </SubSection>

          <SubSection title="Response">
            <CodeBlock lang="json" code={`{
  "reportId": "uuid",
  "hasAlert": true,
  "anomalyCount": 2,
  "bySeverity": { "critical": 0, "high": 2, "medium": 0, "low": 0 },
  "summary": { "finding": "Two high-severity anomalies detected.", "priority": "HIGH" },
  "timestamp": "2025-01-15T14:00:00Z"
}`} />
          </SubSection>

          <Callout type="tip">
            Schedule this endpoint via a cron job (e.g., every 15 minutes) to achieve continuous monitoring.
            Use the <code>threshold</code> parameter to control noise — set <code>critical</code> for only the most urgent alerts.
          </Callout>
        </Section>

        {/* Batch */}
        <Section id="batch" title="Batch Processing" icon={Layers}>
          <p className="text-gray-300 leading-relaxed mb-6">
            Submit thousands of documents in a single request. Workers run in parallel,
            and the system aggregates results into a single batch report. Scales from 1 to 10,000 document sets.
          </p>

          <SubSection title="Submit a Batch">
            <CodeBlock lang="json" code={`// POST /api/v1/batch
{
  "documents": [
    // Each inner array = one analysis job
    [{ "filename": "jan.csv", "content_type": "text/csv", "raw_text": "..." }],
    [{ "filename": "feb.csv", "content_type": "text/csv", "raw_text": "..." }],
    [{ "filename": "mar.csv", "content_type": "text/csv", "raw_text": "..." }]
  ]
}`} />
          </SubSection>

          <SubSection title="Poll Batch Status">
            <CodeBlock lang="curl" code={`curl https://taylos-agent.vercel.app/api/v1/batch?batchId=YOUR_BATCH_ID \\
  -H "X-API-Key: tk_..."`} />
            <CodeBlock lang="json" code={`{
  "batchId": "uuid",
  "status": "complete",
  "summary": { "total": 3, "success": 3, "failed": 0 },
  "jobs": [
    { "index": 0, "status": "fulfilled", "reportId": "uuid" },
    { "index": 1, "status": "fulfilled", "reportId": "uuid" },
    { "index": 2, "status": "fulfilled", "reportId": "uuid" }
  ]
}`} />
          </SubSection>
        </Section>

        {/* Cases */}
        <Section id="cases" title="Case Management" icon={FileText}>
          <p className="text-gray-300 leading-relaxed mb-6">
            Each detected anomaly can be tracked as a <strong>case</strong>.
            Cases have status, assignees, deadlines, comments, and resolution notes. They're linked back to the originating anomaly and report.
          </p>

          <SubSection title="Case Lifecycle">
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: "Open", color: "bg-red-400/15 text-red-400 border-red-400/20" },
                { label: "→", color: "" },
                { label: "In Review", color: "bg-yellow-400/15 text-yellow-400 border-yellow-400/20" },
                { label: "→", color: "" },
                { label: "Resolved", color: "bg-green-400/15 text-green-400 border-green-400/20" },
              ].map((step, i) => (
                step.color ? (
                  <span key={i} className={`px-3 py-1.5 rounded-full text-sm border font-medium ${step.color}`}>{step.label}</span>
                ) : (
                  <ChevronRight key={i} className="w-4 h-4 text-gray-600" />
                )
              ))}
            </div>
          </SubSection>

          <SubSection title="Create a Case via API">
            <CodeBlock lang="curl" code={`curl -X POST https://taylos-agent.vercel.app/api/cases \\
  -H "Content-Type: application/json" \\
  -d '{
    "anomaly_id": "ANOM-001",
    "report_id": "uuid",
    "title": "Duplicate payment to Unknown Vendor",
    "description": "Two identical ₦50,000 payments within 24 hours.",
    "severity": "HIGH",
    "assignee": "jane.doe@example.com",
    "deadline": "2025-02-01"
  }'`} />
          </SubSection>

          <SubSection title="Add a Comment">
            <CodeBlock lang="curl" code={`curl -X PATCH https://taylos-agent.vercel.app/api/cases/CASE_ID \\
  -H "Content-Type: application/json" \\
  -d '{
    "comment": "Contacted vendor — awaiting invoice copy.",
    "author": "John Analyst"
  }'`} />
          </SubSection>

          <SubSection title="Resolve a Case">
            <CodeBlock lang="curl" code={`curl -X PATCH https://taylos-agent.vercel.app/api/cases/CASE_ID \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "resolved",
    "resolution_note": "Confirmed legitimate: vendor provided PO-2025-0041."
  }'`} />
          </SubSection>
        </Section>

        {/* Analytics */}
        <Section id="analytics" title="Analytics Dashboard" icon={BarChart3}>
          <p className="text-gray-300 leading-relaxed mb-4">
            The <strong>/analytics</strong> endpoint provides pre-computed aggregates from all your reports and cases:
          </p>
          <ul className="list-none space-y-2 mb-6">
            {[
              "Total anomalies detected over time (area chart)",
              "Confidence scores trend across reports",
              "Severity breakdown (Critical / High / Medium / Low) as a donut chart",
              "Case status distribution (Open / In Review / Resolved)",
              "Recent reports table with data quality scores",
              "Live clock — the dashboard time updates every second",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                <ChevronRight className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* RBAC */}
        <Section id="rbac" title="Roles & Permissions" icon={Shield}>
          <p className="text-gray-300 leading-relaxed mb-6">
            Four built-in roles control what each user can see and do. Roles are stored in the <code className="text-[var(--color-accent)] bg-black/30 px-1.5 py-0.5 rounded text-sm">user_roles</code> table
            and checked on every API request.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-[var(--color-border)] rounded-xl overflow-hidden">
              <thead className="bg-[var(--color-surface-2)]">
                <tr>
                  {["Role", "Cases", "Reports", "Analytics", "Audit Log", "API Keys", "Delete"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-sm text-center">
                {[
                  ["Admin", "✅", "✅", "✅", "✅", "✅", "✅"],
                  ["Analyst", "✅ R/W", "✅ R", "✅", "❌", "❌", "❌"],
                  ["Auditor", "✅ R", "✅ R", "✅", "✅ R", "❌", "❌"],
                  ["Viewer", "✅ R", "✅ R", "✅", "❌", "❌", "❌"],
                ].map(([role, ...perms]) => (
                  <tr key={role} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-semibold text-left text-white">{role}</td>
                    {perms.map((p, i) => (
                      <td key={i} className={`px-4 py-3 text-xs ${p.includes("✅") ? "text-green-400" : "text-gray-600"}`}>{p}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Audit Log */}
        <Section id="audit" title="Audit Log" icon={Lock}>
          <p className="text-gray-300 leading-relaxed mb-4">
            Every action on the platform is written to an <strong>immutable, append-only</strong> audit log.
            The database security policy allows INSERT only — no UPDATE or DELETE.
          </p>

          <SubSection title="Logged Events">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                "upload.document", "analysis.run", "analysis.complete",
                "case.create", "case.update", "case.resolve",
                "case.comment", "report.export", "notification.send",
                "batch.submit", "batch.complete", "apikey.create",
                "apikey.revoke", "webhook.register", "user.login",
                "settings.update",
              ].map((e) => (
                <div key={e} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 font-mono text-xs text-gray-400">
                  {e}
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Export">
            <p className="text-gray-400 text-sm">
              The Audit Log endpoint provides CSV export of filtered log entries,
              ready for regulatory submission.
            </p>
          </SubSection>
        </Section>

        {/* Notifications */}
        <Section id="notifications" title="Notifications" icon={Mail}>
          <div className="rounded-xl border border-dashed border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 p-4 flex items-start gap-3 mb-6">
            <AlertTriangle className="w-4 h-4 text-[var(--color-gold)] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[var(--color-gold)] mb-1">Coming Soon — Email Notifications</div>
              <p className="text-xs text-yellow-200/70 leading-relaxed">
                Email delivery via Resend is currently paused. The API endpoint and template system are built and ready.
              </p>
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed mb-6">
            Once enabled, emails are drafted automatically from findings, previewed before sending, and dispatched.
          </p>

          <SubSection title="Preview Without Sending (works now)">
            <CodeBlock lang="curl" code={`curl "https://taylos-agent.vercel.app/api/notifications/send?anomalyId=ANOM-001&reportId=uuid&caseId=uuid"`} />
          </SubSection>
        </Section>

        {/* Chat */}
        <Section id="chat" title="Agent Chat Interface" icon={MessageSquare}>
          <p className="text-gray-300 leading-relaxed mb-6">
            Each case and analysis report includes a conversational AI assistant that has full context of the findings.
          </p>

          <SubSection title="Usage">
            <p className="text-gray-400 text-sm mb-3">The chat interface calls <code>/api/chat</code> with:</p>
            <CodeBlock lang="json" code={`{
  "message": "Why was this payment flagged?",
  "context": { /* full analysis JSON */ },
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}`} />
          </SubSection>
        </Section>

        {/* Security */}
        <Section id="security" title="Security & Privacy" icon={Key}>
          <SubSection title="Data Encryption">
            <p className="text-gray-400 text-sm mb-3">Sensitive fields are encrypted at rest using <strong>AES-256-GCM</strong>.</p>
          </SubSection>

          <SubSection title="PII Masking">
            <p className="text-gray-400 text-sm mb-3">All API responses are automatically PII-scrubbed before leaving the server:</p>
            <CodeBlock lang="typescript" code={`import { maskPII } from "@/lib/privacy";

maskPII("Account 0123456789 called from 08012345678");
// → "Account ******6789 called from 0801****678"`} />
          </SubSection>

          <SubSection title="Required Environment Variables">
            <CodeBlock lang="env" code={`# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # for admin operations

# AI
GROQ_API_KEY=gsk_...

# Encryption
ENCRYPTION_KEY=64_char_hex_string

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@taylos-agent.vercel.app

# Webhooks / Cron
CRON_SECRET=your-cron-secret

# App
NEXT_PUBLIC_APP_URL=https://taylos-agent.vercel.app`} />
          </SubSection>
        </Section>

        <div className="border-t border-[var(--color-border)] pt-8 text-center text-gray-600 text-sm">
          Taylos · Developer Documentation v1.0
        </div>
      </div>
    </div>
  );
}
