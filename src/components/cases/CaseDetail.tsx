"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, AlertTriangle, CheckCircle, Clock, User, Calendar,
  MessageSquare, Send, Mail, ExternalLink, Shield, FileText,
} from "lucide-react";
import { Anomaly } from "@/lib/types";

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
  status: "open" | "in_review" | "resolved";
  severity: string;
  assignee: string | null;
  deadline: string | null;
  comments: Comment[];
  created_at: string;
  resolution_note?: string;
}

interface Props {
  caseData: CaseRow;
  anomaly: Anomaly | null;
}

const STATUS_OPTIONS = [
  { value: "open", label: "Open", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  { value: "in_review", label: "In Review", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  { value: "resolved", label: "Resolved", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
];

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-red-400",
  HIGH: "text-orange-400",
  MEDIUM: "text-yellow-400",
  LOW: "text-blue-400",
};

export function CaseDetail({ caseData: initialCase, anomaly }: Props) {
  const [caseData, setCaseData] = useState<CaseRow>(initialCase);
  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolutionNote, setResolutionNote] = useState(initialCase.resolution_note ?? "");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailPreview, setEmailPreview] = useState<{ subject: string; html: string } | null>(null);
  const [emailAddress, setEmailAddress] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const statusConfig = STATUS_OPTIONS.find((s) => s.value === caseData.status) ?? STATUS_OPTIONS[0];

  const updateStatus = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === "resolved" && resolutionNote ? { resolution_note: resolutionNote } : {}),
        }),
      });
      const data = await res.json();
      if (data.case) setCaseData(data.case);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: comment.trim(), author: author || "Analyst" }),
      });
      const data = await res.json();
      if (data.case) {
        setCaseData(data.case);
        setComment("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadEmailPreview = async () => {
    if (!anomaly || !caseData.report_id) return;
    const res = await fetch(
      `/api/notifications/send?anomalyId=${anomaly.id}&reportId=${caseData.report_id}&caseId=${caseData.id}`,
    );
    const data = await res.json();
    setEmailPreview({ subject: data.subject, html: data.html });
    setShowEmailPreview(true);
  };

  const sendEmail = async () => {
    if (!emailAddress) return;
    setIsSendingEmail(true);
    try {
      await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "anomaly_alert",
          caseId: caseData.id,
          anomalyId: anomaly?.id,
          reportId: caseData.report_id,
          recipientEmail: emailAddress,
        }),
      });
      setEmailSent(true);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div>
        <Link href="/cases" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          All Cases
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              <span className={`text-xs font-bold ${SEVERITY_COLORS[caseData.severity] ?? "text-gray-400"}`}>
                {caseData.severity}
              </span>
              <span className="text-xs text-gray-600 font-mono">#{caseData.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{caseData.title}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--color-gold)]" />
              Description
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {caseData.description || "No description provided."}
            </p>
          </div>

          {/* Linked Anomaly */}
          {anomaly && (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--color-gold)]" />
                Linked Anomaly — {anomaly.id}
              </h2>
              <div className="space-y-3 text-sm">
                <p className="text-gray-300">{anomaly.description}</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-gray-500 mb-1">Confidence</div>
                    <div className="font-bold text-white">{anomaly.confidence}%</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-gray-500 mb-1">Anomaly Score</div>
                    <div className="font-bold text-white">{anomaly.anomaly_score}/100</div>
                  </div>
                </div>
                {anomaly.evidence_points.length > 0 && (
                  <div>
                    <div className="text-gray-500 text-xs mb-2">Evidence Points</div>
                    <ul className="space-y-1">
                      {anomaly.evidence_points.map((p, i) => (
                        <li key={i} className="text-gray-300 text-xs flex gap-2">
                          <span className="text-[var(--color-gold)] mt-0.5">•</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {anomaly.financial_impact && (
                  <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3 text-xs text-yellow-200">
                    <strong>Financial Impact:</strong> {anomaly.financial_impact}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resolution Note */}
          {(caseData.status === "resolved" || resolutionNote) && (
            <div className="rounded-2xl bg-green-400/5 border border-green-400/20 p-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                Resolution Note
              </h2>
              <p className="text-gray-300 text-sm">{caseData.resolution_note || "No resolution note added."}</p>
            </div>
          )}

          {/* Comments */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--color-gold)]" />
              Comments ({caseData.comments?.length ?? 0})
            </h2>
            <div className="space-y-4 mb-4">
              {(caseData.comments ?? []).length === 0 ? (
                <p className="text-gray-500 text-sm">No comments yet.</p>
              ) : (
                caseData.comments.map((c, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--color-gold)]/20 flex items-center justify-center text-xs text-[var(--color-gold)] font-bold">
                        {(c.author || "A")[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{c.author || "Analyst"}</span>
                      <span className="text-xs text-gray-600">
                        {new Date(c.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 pl-8">{c.text}</p>
                  </div>
                ))
              )}
            </div>
            {/* Add comment */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name..."
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-gold)]/50"
              />
              <div className="flex gap-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-gold)]/50 resize-none"
                />
                <button
                  onClick={addComment}
                  disabled={isSubmitting || !comment.trim()}
                  className="px-4 py-2 rounded-xl bg-[var(--color-gold)] text-[var(--color-navy)] font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity self-end"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Status</h3>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  disabled={isUpdatingStatus}
                  onClick={() => updateStatus(s.value)}
                  className={`w-full px-3 py-2 rounded-xl text-sm text-left transition-all border ${
                    caseData.status === s.value
                      ? `${s.bg} ${s.color} font-medium`
                      : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {caseData.status !== "resolved" && (
              <div className="mt-3">
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Resolution note (required to resolve)..."
                  rows={2}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-gold)]/50 resize-none"
                />
                <button
                  disabled={!resolutionNote.trim() || isUpdatingStatus}
                  onClick={() => updateStatus("resolved")}
                  className="w-full mt-2 px-3 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 text-sm hover:bg-green-500/30 disabled:opacity-50 transition-all"
                >
                  Mark Resolved
                </button>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
            <h3 className="text-xs text-gray-400 uppercase tracking-wider">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <User className="w-3.5 h-3.5 text-gray-500" />
                {caseData.assignee || <span className="text-gray-500">Unassigned</span>}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                {caseData.deadline
                  ? new Date(caseData.deadline).toLocaleDateString("en-GB")
                  : <span className="text-gray-500">No deadline</span>}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                {new Date(caseData.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Email Notification — Coming Soon */}
          {anomaly && caseData.report_id && (
            <div className="rounded-2xl border border-dashed border-white/10 p-5 relative overflow-hidden">
              {/* Subtle glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/3 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    Customer Notification
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold)] border border-[var(--color-gold)]/30">
                    Coming Soon
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Send plain-language email alerts directly to customers or internal teams when anomalies are detected. Emails will be drafted automatically from the AI findings.
                </p>
                <div className="mt-4 space-y-2 opacity-40 pointer-events-none select-none">
                  <div className="w-full h-8 bg-white/5 rounded-xl border border-white/10" />
                  <div className="w-full h-8 bg-white/5 rounded-xl border border-white/10" />
                  <div className="w-full h-8 bg-[var(--color-gold)]/20 rounded-xl" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Preview Modal */}
      {showEmailPreview && emailPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div>
                <div className="text-xs text-gray-500">Subject</div>
                <div className="font-semibold text-gray-800">{emailPreview.subject}</div>
              </div>
              <button
                onClick={() => setShowEmailPreview(false)}
                className="text-gray-400 hover:text-gray-600 text-sm px-3 py-1 rounded-lg border border-gray-200"
              >
                Close
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4">
              <div dangerouslySetInnerHTML={{ __html: emailPreview.html }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
