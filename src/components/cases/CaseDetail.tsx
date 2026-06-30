"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, AlertTriangle, CheckCircle, Clock, User, Calendar,
  MessageSquare, Send, Mail, Shield, FileText, Download,
  CornerDownRight, CheckSquare, Sparkles, Loader2, FileCode, Check, Briefcase, Eye
} from "lucide-react";
import { Anomaly } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  text: string;
  created_at: string;
  author: string;
}

interface CaseRow {
  id: string;
  anomaly_id: string;
  report_id: string | null;
  title: string;
  description: string;
  status: "open" | "in_review" | "escalated" | "resolved";
  severity: string;
  assignee: string | null;
  deadline: string | null;
  comments: Comment[];
  created_at: string;
  resolution_note?: string;
  updated_at?: string;
}

interface Props {
  caseData: CaseRow;
  anomaly: Anomaly | null;
  userRole?: string | null;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-red-400 border-red-500/20 bg-red-500/10",
  HIGH: "text-orange-400 border-orange-500/20 bg-orange-500/10",
  MEDIUM: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10",
  LOW: "text-green-400 border-green-500/20 bg-green-500/10",
};

export function CaseDetail({ caseData: initialCase, anomaly, userRole }: Props) {
  const [caseData, setCaseData] = useState<CaseRow>(initialCase);
  const [activeTab, setActiveTab] = useState<"summary" | "documents" | "chat" | "timeline" | "actions">("summary");
  const [isUpdating, setIsUpdating] = useState(false);

  // Deadline date input state
  const [selectedDeadline, setSelectedDeadline] = useState(caseData.deadline ? caseData.deadline.split("T")[0] : "");

  // Chat Tab states
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    {
      sender: "ai",
      text: `Hello! Case context for Case #${initialCase.id.slice(0, 8)} is loaded. I am reviewing the anomalies found in this document batch. Ask me any details regarding the risk flags, duplicate files, or policy exposure.`,
      time: "Just now"
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Regulatory deadline status indicator
  const getDeadlineStatus = () => {
    if (!caseData.deadline) return null;
    const deadlineDate = new Date(caseData.deadline);
    const diffTime = deadlineDate.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (caseData.status === "resolved") {
      return { label: "Resolved", style: "border-emerald-500/25 bg-emerald-500/10 text-emerald-450" };
    }

    if (diffDays < 0) {
      return { label: "OVERDUE", style: "border-red-500/25 bg-red-500/10 text-red-400 animate-pulse border-2" };
    } else if (diffDays <= 2) {
      return { label: `${diffDays === 0 ? "Due today" : diffDays === 1 ? "1 day left" : `${diffDays} days left`}`, style: "border-red-500/25 bg-red-500/10 text-red-400" };
    } else if (diffDays <= 6) {
      return { label: `${diffDays} days left`, style: "border-orange-500/25 bg-orange-500/10 text-orange-400" };
    }
    return { label: `${diffDays} days left`, style: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" };
  };

  const deadlineStatus = getDeadlineStatus();

  // Status updating triggers
  const handleUpdateStatus = async (newStatus: "open" | "in_review" | "escalated" | "resolved", note?: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          ...(note ? { resolution_note: note } : {}),
        }),
      });
      const data = await res.json();
      if (data.case) {
        setCaseData(data.case);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateDeadline = async () => {
    if (!selectedDeadline) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deadline: new Date(selectedDeadline).toISOString(),
        }),
      });
      const data = await res.json();
      if (data.case) {
        setCaseData(data.case);
        alert("Deadline updated successfully.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // AI chat reply simulations
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg, time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }]);
    setChatInput("");
    setIsAiTyping(true);

    setTimeout(() => {
      let aiResponse = "I have scanned the transaction metadata. The system anomaly risk remains critical. Please verify if the refund matches the original contract payment invoice details.";
      
      const lowerMsg = userMsg.toLowerCase();
      if (lowerMsg.includes("refund") || lowerMsg.includes("approve")) {
        aiResponse = `Analyzing Case #${caseData.id.slice(0, 8)}... Approving the refund is the suggested next action since the invoice duplicate score is high. Evidence trail confirms it is safe to proceed.`;
      } else if (lowerMsg.includes("evidence") || lowerMsg.includes("why") || lowerMsg.includes("anomal")) {
        aiResponse = `The primary risk flags include: ${anomaly?.evidence_points?.join(", ") || "the amount exceeded the standard deviation for this vendor category"}. Confidence indicator is registered at ${anomaly?.confidence ?? 85}%.`;
      } else if (lowerMsg.includes("vendor") || lowerMsg.includes("ghost")) {
        aiResponse = "Warning: Vendor verification details do not match active government registrations. Possible ghost vendor mismatch detected in the payment register.";
      }

      setChatMessages((prev) => [...prev, { sender: "ai", text: aiResponse, time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }]);
      setIsAiTyping(false);
    }, 850);
  };

  // Circular progress math
  const confidence = anomaly?.confidence ?? 85;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (confidence / 100) * circumference;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-24 text-white text-[13px]">
      
      {/* Top Breadcrumb */}
      <div>
        <Link href="/cases" className="flex items-center gap-2 text-gray-450 hover:text-white text-sm mb-4 transition-colors w-fit font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Cases
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-white/5 pb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-white/10 bg-white/5 uppercase`}>
                {caseData.status}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-white/15 ${SEVERITY_COLORS[caseData.severity] || "text-gray-400"}`}>
                {caseData.severity}
              </span>
              <span className="text-xs text-gray-500 font-mono">#{caseData.id}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{caseData.title}</h1>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto whitespace-nowrap">
        {(userRole === "auditor"
          ? (["summary", "documents", "chat", "timeline"] as const)
          : (["summary", "documents", "chat", "timeline", "actions"] as const)
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold px-4 relative transition-colors cursor-pointer capitalize ${
              activeTab === tab ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {tab === "chat" ? "AI Chat" : tab}
            {activeTab === tab && (
              <motion.div
                layoutId="analystCaseDetailTabIndicator"
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                  userRole === "auditor" ? "bg-purple-500" : "bg-[var(--color-gold)]"
                }`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Main Tab Panels */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 md:p-6 shadow-2xl relative">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: SUMMARY */}
          {activeTab === "summary" && (
            <motion.div
              key="summary-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* What Happened */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">What Happened</h4>
                    <p className="text-gray-300 leading-relaxed text-xs">
                      {caseData.description || "An anomaly check flagged inconsistent parameters in the invoice ledger sheet batch."}
                    </p>
                  </div>

                  {/* Root Cause */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Root Cause</h4>
                    <p className="text-gray-300 leading-relaxed text-xs">
                      The vendor registration records mismatches active bank routing files, causing double transactions to execute under duplicate ids.
                    </p>
                  </div>

                  {/* Classification Badge */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Classification</h4>
                    <span className="inline-flex px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold text-xs uppercase">
                      {anomaly?.type || "Fraud Anomaly"}
                    </span>
                  </div>

                  {/* Evidence Chain */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Evidence Chain</h4>
                    <ol className="space-y-2 pl-0 list-decimal list-inside text-gray-350 text-xs">
                      {(anomaly?.evidence_points || [
                        "Invoice fee matches high-risk index values.",
                        "Duplicate routing ID was updated 2 hours before submission.",
                        "Clearing balance does not register matching receipts."
                      ]).map((ev, i) => (
                        <li key={i} className="text-gray-350">
                          {ev} <span className="text-[10px] text-gray-550 font-mono">(source: ERP_Invoice_Ledger.pdf)</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Impact Assessment */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Impact Assessment</h4>
                    <p className="text-gray-300 leading-relaxed text-xs font-semibold text-rose-400">
                      Estimated immediate financial loss: {anomaly?.financial_impact || "$4,520.00 USD exposure"}
                    </p>
                  </div>
                </div>

                {/* Circular Confidence Score & AI Recommendation */}
                <div className="space-y-6">
                  {/* Confidence circular progress */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confidence Score</h4>
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r={radius}
                          className="stroke-white/5 fill-transparent"
                          strokeWidth="6"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r={radius}
                          className="stroke-[var(--color-gold)] fill-transparent"
                          strokeWidth="6"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeOffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-white text-sm">
                        {confidence}%
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500">AI confidence rating</span>
                  </div>

                  {/* AI Recommendation callout box */}
                  <div className="p-4 rounded-2xl bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/20 text-xs leading-relaxed text-[var(--color-gold-light)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent pointer-events-none" />
                    <div className="font-bold flex items-center gap-1.5 mb-1.5 uppercase text-[10px] tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Recommendation
                    </div>
                    Based on duplicate verification flags, we advise approving the refund claim to lock compliance requirements and resolve exposure immediately.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DOCUMENTS */}
          {activeTab === "documents" && (
            <motion.div
              key="documents-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Attached Case Files</h3>
                <p className="text-gray-400 text-xs mt-1">Review associated invoices, bank statements, or ledger uploads.</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-white/5">
                      <th className="py-2.5 px-4">Filename</th>
                      <th className="py-2.5 px-4">File Type</th>
                      <th className="py-2.5 px-4">Upload Date</th>
                      <th className="py-2.5 px-4">Uploaded By</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {[
                      { name: "ERP_Invoice_Ledger.pdf", type: "PDF Document", size: "1.4 MB", date: "2026-06-25", user: "Gideon A." },
                      { name: "Bank_Clearing_Stmt.xlsx", type: "Excel Spreadsheet", size: "4.8 MB", date: "2026-06-25", user: "Gideon A." },
                      { name: "Compliance_Audit_Log_Extract.csv", type: "CSV Table", size: "320 KB", date: "2026-06-26", user: "Automated System" }
                    ].map((doc, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.01]">
                        <td className="py-3 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-400" />
                            {doc.name}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-400">{doc.type}</td>
                        <td className="py-3 px-4 text-xs text-gray-405">{new Date(doc.date).toLocaleDateString("en-GB")}</td>
                        <td className="py-3 px-4 text-xs text-gray-405">{doc.user}</td>
                        <td className="py-3 px-4 text-right">
                          <button className="px-2.5 py-1 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ml-auto">
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 3: CHAT */}
          {activeTab === "chat" && (
            <motion.div
              key="chat-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Agent — Case #{caseData.id.slice(0, 8)} context loaded</h3>
                  <p className="text-gray-450 text-[11px]">Real-time dialogue preloaded with transactions evidence and system logs.</p>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="h-64 overflow-y-auto bg-black/25 rounded-2xl p-4 border border-white/5 space-y-4 flex flex-col">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 max-w-[80%] rounded-2xl text-xs space-y-1 ${
                      msg.sender === "ai"
                        ? "bg-white/5 border border-white/5 text-gray-250 self-start"
                        : "bg-amber-600 text-white self-end text-right border border-amber-700"
                    }`}
                  >
                    <div className="font-semibold text-[10px] opacity-75">
                      {msg.sender === "ai" ? "🤖 TAYLOS AGENT" : "👤 YOU"}
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div className="text-[9px] opacity-60 text-right">{msg.time}</div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="p-3 bg-white/5 border border-white/5 text-gray-400 self-start rounded-2xl text-xs flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>AI Investigator is parsing details...</span>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask the agent about this case..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-gold)] text-xs h-[36px]"
                />
                <button
                  type="submit"
                  disabled={isAiTyping || !chatInput.trim()}
                  className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer h-[36px] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* TAB 4: TIMELINE */}
          {activeTab === "timeline" && (
            <motion.div
              key="timeline-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Chronological Case Timeline</h3>
                <p className="text-gray-400 text-xs mt-1">Immutable, chronological trail log of all case interactions.</p>
              </div>

              <div className="relative border-l border-white/10 pl-6 ml-3 space-y-6">
                {[
                  { title: "Case Opened", desc: "System auto-generated case from anomaly flags", time: new Date(caseData.created_at).toLocaleString("en-GB"), actor: "Taylos AI", badge: "AI" },
                  { title: "Analyst Assigned", desc: `Case assigned to operational analyst: ${caseData.assignee || "Lee X."}`, time: new Date(caseData.created_at).toLocaleString("en-GB"), actor: "Lee X.", badge: "Analyst" },
                  { title: "Compliance Scan Executed", desc: "Auto-calculated regulatory timeline requirements.", time: new Date(new Date(caseData.created_at).getTime() + 1000 * 60).toLocaleString("en-GB"), actor: "System", badge: "system" },
                  ...(caseData.status === "resolved" ? [{ title: "Case Resolution", desc: caseData.resolution_note || "Approved", time: caseData.updated_at ? new Date(caseData.updated_at).toLocaleString("en-GB") : "Just now", actor: "Lee X.", badge: "Analyst" }] : [])
                ].map((item, i) => (
                  <div key={i} className="relative">
                    {/* Circle dot */}
                    <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--color-gold)] border border-black" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">{item.title}</span>
                        <span className="px-2 py-0.2 rounded-full bg-white/5 border border-white/10 text-[9px] text-gray-400 font-bold uppercase">{item.badge}</span>
                      </div>
                      <p className="text-gray-450 text-[11px] mt-0.5">{item.desc} (actor: {item.actor})</p>
                      <div className="text-[10px] text-gray-500 font-mono mt-1">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 5: ACTIONS */}
          {activeTab === "actions" && (
            <motion.div
              key="actions-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Primary action buttons */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Action Decisions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleUpdateStatus("resolved", "Approved refund request")}
                    className="py-2.5 rounded-xl bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer uppercase text-center"
                  >
                    Approve Refund
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("resolved", "Rejected refund request")}
                    className="py-2.5 rounded-xl border border-rose-500 text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition-colors cursor-pointer uppercase text-center"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("escalated")}
                    className="py-2.5 rounded-xl border border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 font-bold text-xs transition-colors cursor-pointer uppercase text-center"
                  >
                    Escalate
                  </button>
                  <button
                    onClick={() => alert("Request details sent to uploader.")}
                    className="py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 font-bold text-xs transition-colors cursor-pointer uppercase text-center"
                  >
                    Request More Info
                  </button>
                </div>
              </div>

              {/* Regulatory Deadline Section */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Regulatory Deadline</h4>
                
                <div className="flex flex-col sm:flex-row gap-3 items-end max-w-md">
                  <div className="space-y-1.5 flex-1 w-full">
                    <label className="text-[10px] text-gray-500 uppercase">Deadline Date</label>
                    <input
                      type="date"
                      value={selectedDeadline}
                      onChange={(e) => setSelectedDeadline(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleUpdateDeadline}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs rounded-xl h-[36px] cursor-pointer whitespace-nowrap"
                  >
                    Update Deadline
                  </button>
                </div>

                {deadlineStatus && (
                  <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${deadlineStatus.style}`}>
                    <Clock className="w-3.5 h-3.5" />
                    Regulatory Alert Countdown: {deadlineStatus.label}
                  </div>
                )}
              </div>

              {/* Export Reports Section */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reports & Data Exports</h4>
                <div className="flex gap-3 flex-wrap">
                  <button className="px-4 py-2 rounded-xl border border-white/10 text-gray-350 hover:text-white hover:bg-white/5 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                    Download PDF Report
                  </button>
                  <button className="px-4 py-2 rounded-xl border border-white/10 text-gray-350 hover:text-white hover:bg-white/5 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Customer Notification Section */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Notification</span>
                  <span className="px-2 py-0.5 rounded border border-yellow-500/35 bg-yellow-500/10 text-[9px] text-yellow-400 font-bold uppercase tracking-wider">COMING SOON</span>
                </div>
                <button
                  disabled
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-500 cursor-not-allowed opacity-50 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Draft & Send Email
                </button>
                <p className="text-[10px] text-gray-550">Customer notifications will be available soon.</p>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
