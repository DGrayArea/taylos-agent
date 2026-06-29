"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, AlertTriangle, CheckCircle, Clock, User, Calendar,
  MessageSquare, Send, Mail, Shield, FileText, Download,
  CornerDownRight, CheckSquare, Sparkles, Loader2, FileCode, Check
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
  CRITICAL: "text-red-400",
  HIGH: "text-orange-400",
  MEDIUM: "text-yellow-400",
  LOW: "text-blue-400",
};

export function CaseDetail({ caseData: initialCase, anomaly, userRole }: Props) {
  const [caseData, setCaseData] = useState<CaseRow>(initialCase);
  const [activeTab, setActiveTab] = useState<"summary" | "documents" | "chat" | "timeline" | "actions">("summary");
  const [isUpdating, setIsUpdating] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("Admin");

  // Chat Tab states
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    {
      sender: "ai",
      text: "Hello! I am your AI Lead Investigator. I have compiled all evidence points for this case. Ask me any questions regarding transactions, risk flags, or compliance status.",
      time: "Just now"
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Regulatory deadline logic
  const getDeadlineStatus = () => {
    if (!caseData.deadline) return null;
    const deadlineDate = new Date(caseData.deadline);
    const diffTime = deadlineDate.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (caseData.status === "resolved") {
      return { label: "Resolved", style: "bg-emerald-500/10 border-emerald-550/20 text-emerald-450" };
    }

    if (diffDays < 0) {
      return { label: "OVERDUE (CRITICAL LIMIT PASSED)", style: "bg-red-500/20 border-red-500/30 text-red-400 animate-pulse border-2" };
    } else if (diffDays <= 2) {
      return { label: `${diffDays === 0 ? "Due today" : diffDays === 1 ? "1 day remaining" : `${diffDays} days remaining`} (Immediate Action Required)`, style: "bg-rose-500/10 border-rose-500/20 text-rose-450" };
    } else if (diffDays <= 6) {
      return { label: `${diffDays} days remaining (Warning limit)`, style: "bg-amber-500/10 border-amber-500/20 text-amber-450" };
    }
    return { label: `${diffDays} days remaining (On Track)`, style: "bg-emerald-500/10 border-emerald-550/20 text-emerald-400" };
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

  // Comments handler
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentText.trim(), author: authorName }),
      });
      const data = await res.json();
      if (data.case) {
        setCaseData(data.case);
        setCommentText("");
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
      let aiResponse = "I am reviewing this transaction. The anomaly flag indicates potential deviation from the user's historical spend pattern.";
      
      const lowerMsg = userMsg.toLowerCase();
      if (lowerMsg.includes("refund") || lowerMsg.includes("approve")) {
        aiResponse = `Regarding Case #${caseData.id.slice(0, 8)}, approving a refund will resolve the current alert. However, I advise checking the vendor verification documents under the Documents tab first, as the billing anomaly has a ${anomaly?.confidence ?? 85}% AI confidence score.`;
      } else if (lowerMsg.includes("evidence") || lowerMsg.includes("why") || lowerMsg.includes("anomal")) {
        aiResponse = `This case was flagged because: ${anomaly?.evidence_points?.join(", ") || "the amount exceeded the standard deviation for this vendor category"}. Financial impact is estimated at ${anomaly?.financial_impact || "unknown"}.`;
      } else if (lowerMsg.includes("vendor") || lowerMsg.includes("ghost")) {
        aiResponse = "Ghost vendor risk triggers when tax identification is missing or matching employee data is found in bank registers. I recommend checking the internal ledger documents.";
      }

      setChatMessages((prev) => [...prev, { sender: "ai", text: aiResponse, time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }]);
      setIsAiTyping(false);
    }, 850);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-24 text-white text-[13px]">
      
      {/* Top Breadcrumb */}
      <div>
        <Link href="/cases" className="flex items-center gap-2 text-gray-450 hover:text-white text-sm mb-4 transition-colors w-fit font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Case Management
        </Link>

        {/* Regulatory Countdown Alert */}
        {deadlineStatus && (
          <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between mb-4 ${deadlineStatus.style}`}>
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              REGULATORY COMPLIANCE DEADLINE: {deadlineStatus.label}
            </span>
            <span className="text-[10px] font-bold uppercase opacity-80 font-mono">Scope: Org Admin</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-white/5 pb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs border font-bold bg-white/5 border-white/10 uppercase`}>
                {caseData.status}
              </span>
              <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border border-white/15 ${SEVERITY_COLORS[caseData.severity] || "text-gray-400"}`}>
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
        {(["summary", "documents", "chat", "timeline", "actions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold px-4 relative transition-colors cursor-pointer capitalize ${
              activeTab === tab ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="caseDetailTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />
            )}
          </button>
        ))}
      </div>

      {/* Main tab display panels */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 md:p-6 shadow-2xl relative">
        <AnimatePresence mode="wait">
          
          {/* SUMMARY TAB */}
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
                  {/* Case Description */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[var(--color-gold)]" />
                      Incident Overview
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-xs">
                      {caseData.description || "No specific details logged for this financial incident."}
                    </p>
                  </div>

                  {/* Linked Anomaly Findings */}
                  {anomaly && (
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-450" />
                        AI Flag Evidence ({anomaly.id})
                      </h3>
                      <p className="text-gray-300 text-xs">{anomaly.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                          <div className="text-gray-500 mb-1">AI Match Confidence</div>
                          <div className="font-bold text-white text-base">{anomaly.confidence}%</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                          <div className="text-gray-500 mb-1">Deviation Score</div>
                          <div className="font-bold text-white text-base">{anomaly.anomaly_score}/100</div>
                        </div>
                      </div>

                      {anomaly.evidence_points.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-gray-500 text-[11px] uppercase tracking-wider">Identified Risk Markers</div>
                          <ul className="space-y-1.5 pl-1">
                            {anomaly.evidence_points.map((pt, i) => (
                              <li key={i} className="text-gray-300 text-xs flex gap-2 items-start">
                                <CornerDownRight className="w-3.5 h-3.5 text-[var(--color-gold)] shrink-0 mt-0.5" />
                                {pt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {anomaly.financial_impact && (
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-xl p-3.5 text-xs">
                          <strong>Estimated Financial Exposure:</strong> {anomaly.financial_impact}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resolution Notes */}
                  {caseData.resolution_note && (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2 mt-4">
                      <h4 className="font-bold text-emerald-450 flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4" />
                        Resolution Log
                      </h4>
                      <p className="text-gray-300 text-xs">{caseData.resolution_note}</p>
                    </div>
                  )}
                </div>

                {/* Sidebar details */}
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4 h-fit">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 pb-2">Assigned Metadata</h4>
                  
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-400" />
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Analyst assigned</div>
                        <div className="font-semibold text-white">{caseData.assignee || "Unassigned"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Due date</div>
                        <div className="font-semibold text-white">
                          {caseData.deadline ? new Date(caseData.deadline).toLocaleDateString("en-GB") : "No limit"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Registered at</div>
                        <div className="font-semibold text-white">
                          {new Date(caseData.created_at).toLocaleString("en-GB")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* General Comments Form */}
              <div className="pt-6 border-t border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[var(--color-gold)]" />
                  Internal Investigation Notes ({caseData.comments?.length || 0})
                </h3>

                <div className="space-y-3">
                  {(caseData.comments || []).map((com, index) => (
                    <div key={index} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0">
                        {com.author[0].toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{com.author}</span>
                          <span className="text-[10px] text-gray-500">{new Date(com.created_at).toLocaleString("en-GB")}</span>
                        </div>
                        <p className="text-gray-300 text-xs">{com.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2 items-end">
                  <div className="space-y-1.5 flex-1">
                    <input
                      type="text"
                      placeholder="Comment author name..."
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-1.5 text-white text-xs"
                    />
                    <textarea
                      placeholder="Type a case note or audit comment..."
                      required
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-gold)] text-xs h-16 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdating || !commentText.trim()}
                    className="px-4 py-3 bg-[var(--color-gold)] text-[var(--color-navy)] rounded-xl font-bold flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === "documents" && (
            <motion.div
              key="documents-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Verified Transaction Documents</h3>
                <p className="text-gray-400 text-xs mt-1">Audit trail and ledger files parsed by Taylos AI for this incident.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "ERP_Invoice_Ledger.pdf", size: "1.4 MB", type: "PDF Document" },
                  { name: "Bank_Clearing_Stmt.xlsx", size: "4.8 MB", type: "Excel Sheet" },
                  { name: "Vendor_Tax_TIN_Verify.json", size: "12 KB", type: "JSON Response" },
                  { name: "Compliance_Audit_Log_Extract.csv", size: "320 KB", type: "CSV File" }
                ].map((doc, i) => (
                  <div key={i} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-xl font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{doc.name}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{doc.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Verified
                      </span>
                      <button className="p-1.5 text-gray-450 hover:text-white transition-colors cursor-pointer bg-white/5 rounded-lg border border-white/15">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CHAT TAB */}
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
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Case Investigator Chat</h3>
                  <p className="text-gray-450 text-[11px]">Query the agent on ledger records, validation trails, and compliance flags.</p>
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
                    <span>AI Investigator is processing case ledger details...</span>
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

          {/* TIMELINE TAB */}
          {activeTab === "timeline" && (
            <motion.div
              key="timeline-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Audit Investigation Trail</h3>
                <p className="text-gray-400 text-xs mt-1">Full chronological event timeline of the case audit.</p>
              </div>

              <div className="relative border-l border-white/10 pl-6 ml-3 space-y-6">
                {[
                  { title: "Case Created", desc: `Incident parsed & matched to Anomaly ${caseData.anomaly_id}`, time: new Date(caseData.created_at).toLocaleString("en-GB") },
                  { title: "Assignee Updated", desc: `Assigned to analyst: ${caseData.assignee || "Unassigned"}`, time: new Date(caseData.created_at).toLocaleString("en-GB") },
                  { title: "AI Compliance Check", desc: "Auto-ran regulatory deadline validation scan.", time: new Date(new Date(caseData.created_at).getTime() + 1000 * 60).toLocaleString("en-GB") },
                  ...(caseData.status === "resolved" ? [{ title: "Case Resolved", desc: caseData.resolution_note || "Approved", time: caseData.updated_at ? new Date(caseData.updated_at).toLocaleString("en-GB") : "Just now" }] : [])
                ].map((item, i) => (
                  <div key={i} className="relative">
                    {/* Circle icon */}
                    <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--color-gold)] border border-black" />
                    <div>
                      <div className="font-semibold text-white text-xs">{item.title}</div>
                      <p className="text-gray-450 text-[11px] mt-0.5">{item.desc}</p>
                      <div className="text-[10px] text-gray-500 font-mono mt-1">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ACTIONS TAB */}
          {activeTab === "actions" && (
            <motion.div
              key="actions-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Administrative Quick Actions</h3>
                <p className="text-gray-400 text-xs mt-1">Submit resolution events, refund requests, and audit exports.</p>
              </div>

              {caseData.status !== "resolved" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Resolve & Refund */}
                  <div className="p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-emerald-450 flex items-center gap-1.5 text-xs">
                        <CheckSquare className="w-4 h-4" />
                        Approve Refund & Resolve
                      </h4>
                      <p className="text-gray-400 text-[11px] mt-1">Approve resolution refund processing. This settles the incident ledger records.</p>
                    </div>
                    <button
                      onClick={() => handleUpdateStatus("resolved", "Approved refund request and resolved alert logs")}
                      className="w-full py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 text-xs font-bold transition-all cursor-pointer text-center uppercase"
                    >
                      Approve Refund
                    </button>
                  </div>

                  {/* Reject Case */}
                  <div className="p-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-rose-450 flex items-center gap-1.5 text-xs">
                        <CornerDownRight className="w-4 h-4" />
                        Dismiss & Reject Alert
                      </h4>
                      <p className="text-gray-400 text-[11px] mt-1">Mark this anomaly alert as dismissed. Categorizes the event as false positive.</p>
                    </div>
                    <button
                      onClick={() => handleUpdateStatus("resolved", "Dismissed case anomaly as false positive after review")}
                      className="w-full py-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl hover:bg-rose-500/30 text-xs font-bold transition-all cursor-pointer text-center uppercase"
                    >
                      Reject Case
                    </button>
                  </div>

                  {/* Escalate Case */}
                  {caseData.status !== "escalated" && (
                    <div className="p-4 rounded-2xl border border-purple-500/25 bg-purple-500/5 space-y-3 flex flex-col justify-between md:col-span-2">
                      <div>
                        <h4 className="font-bold text-purple-400 flex items-center gap-1.5 text-xs">
                          <Shield className="w-4 h-4" />
                          Escalate to Higher Compliance
                        </h4>
                        <p className="text-gray-400 text-[11px] mt-1">Elevate the operational concern level to compliance head. Escalated logs lock editing.</p>
                      </div>
                      <button
                        onClick={() => handleUpdateStatus("escalated")}
                        className="w-full py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 text-xs font-bold transition-all cursor-pointer text-center uppercase"
                      >
                        Escalate Alert
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-2xl text-xs font-bold text-center">
                  This case has been resolved and audit logged.
                </div>
              )}

              {/* Downloads & Reports */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reports & Data Exports</h4>
                <div className="flex gap-3 flex-wrap">
                  <button className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                    Download PDF Report
                  </button>
                  <button className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                    Download CSV
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
