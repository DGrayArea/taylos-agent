"use client";

import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  Plus,
  RefreshCw,
  Clock,
  Eye,
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TicketReply {
  id: string;
  sender: "admin" | "support";
  text: string;
  created_at: string;
}

interface TicketItem {
  id: string;
  subject: string;
  category: "Billing" | "Technical" | "Compliance" | "Access" | "Other";
  priority: "Low" | "Medium" | "High";
  description: string;
  created_at: string;
  updated_at: string;
  status: "Open" | "In Progress" | "Resolved";
  replies: TicketReply[];
}

interface SupportConsoleProps {
  orgId: string;
  orgName: string;
}

// Initial mock tickets for rich aesthetic
const INITIAL_TICKETS: TicketItem[] = [
  {
    id: "TCK-8721",
    subject: "Corporate API Keys Rate Limits",
    category: "Technical",
    priority: "High",
    description: "Our core ledger webhook integrations are intermittently triggering 429 rate-limiting responses during batch validation checks. We require our API key thresholds to be scaled to 500 requests per minute.",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: "In Progress",
    replies: [
      {
        id: "r1",
        sender: "support",
        text: "Hi Gideon, our tier 2 engineering team is checking your account webhook configs. We can increase your limit if your integration supports exponential back-off retries. Let us know if this is enabled.",
        created_at: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ]
  },
  {
    id: "TCK-3210",
    subject: "Add Auditor Access permissions for Compliance Team",
    category: "Access",
    priority: "Medium",
    description: "Need to onboarding 3 third-party auditors to run scoping checks on the compliance audit log. Ensure they have read-only access to /audit directories.",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: "Open",
    replies: []
  },
  {
    id: "TCK-0922",
    subject: "June Subscription Invoice Query",
    category: "Billing",
    priority: "Low",
    description: "Our corporate invoice contains an extra seat fee that was not included in our contract. Requesting details or invoice credit.",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    status: "Resolved",
    replies: [
      {
        id: "r2",
        sender: "support",
        text: "We have reviewed the invoice and applied a $150 credit to your billing cycle. The updated invoice PDF is ready in your profile dashboard.",
        created_at: new Date(Date.now() - 9 * 86400000).toISOString()
      },
      {
        id: "r3",
        sender: "admin",
        text: "Thank you for the quick resolution. Checked and verified.",
        created_at: new Date(Date.now() - 8 * 86400000).toISOString()
      }
    ]
  }
];

export function SupportConsole({ orgId, orgName }: SupportConsoleProps) {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [activeTab, setActiveTab] = useState<"Open" | "Resolved">("Open");
  const [viewingTicket, setViewingTicket] = useState<TicketItem | null>(null);
  
  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<TicketItem["category"]>("Technical");
  const [priority, setPriority] = useState<TicketItem["priority"]>("Medium");
  const [description, setDescription] = useState("");

  // Reply State
  const [replyText, setReplyText] = useState("");

  // Initialize and load from localstorage if available
  useEffect(() => {
    const saved = localStorage.getItem(`taylos_support_${orgId}`);
    if (saved) {
      setTickets(JSON.parse(saved));
    } else {
      setTickets(INITIAL_TICKETS);
      localStorage.setItem(`taylos_support_${orgId}`, JSON.stringify(INITIAL_TICKETS));
    }
  }, [orgId]);

  const saveTickets = (updated: TicketItem[]) => {
    setTickets(updated);
    localStorage.setItem(`taylos_support_${orgId}`, JSON.stringify(updated));
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const newTicket: TicketItem = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: subject.trim(),
      category,
      priority,
      description: description.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "Open",
      replies: []
    };

    const updated = [newTicket, ...tickets];
    saveTickets(updated);
    
    // reset form
    setSubject("");
    setCategory("Technical");
    setPriority("Medium");
    setDescription("");
    setShowCreateModal(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingTicket || !replyText.trim()) return;

    const newReply: TicketReply = {
      id: `rep-${Math.random().toString(36).substr(2, 9)}`,
      sender: "admin",
      text: replyText.trim(),
      created_at: new Date().toISOString()
    };

    const updatedTicket: TicketItem = {
      ...viewingTicket,
      replies: [...viewingTicket.replies, newReply],
      updated_at: new Date().toISOString()
    };

    const updatedList = tickets.map(t => t.id === viewingTicket.id ? updatedTicket : t);
    saveTickets(updatedList);
    setViewingTicket(updatedTicket);
    setReplyText("");
  };

  const filteredTickets = tickets.filter(t => {
    if (activeTab === "Resolved") {
      return t.status === "Resolved";
    }
    return t.status === "Open" || t.status === "In Progress";
  });

  const getPriorityBadgeStyle = (p: TicketItem["priority"]) => {
    if (p === "High") return "bg-red-500/10 text-red-400 border border-red-500/20";
    if (p === "Medium") return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
    return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  };

  const getCategoryBadgeStyle = (cat: TicketItem["category"]) => {
    return "bg-white/5 border border-white/10 text-white";
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 text-[13px] text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-[var(--color-gold-light)] uppercase tracking-wider mb-2">
            <LifeBuoy className="w-3.5 h-3.5" />
            WORKSPACE: {orgName.toUpperCase()}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Support Ticketing
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            File tickets, ask questions, and review response logs from the Taylos corporate support team.
          </p>
        </div>

        {!viewingTicket && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-navy)] hover:opacity-90 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            New Support Ticket
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!viewingTicket ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Tabs */}
            <div className="flex gap-2.5">
              {(["Open", "Resolved"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab === "Open" ? "Open Tickets" : "Resolved Tickets"}
                </button>
              ))}
            </div>

            {/* Tickets Table */}
            <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-white/5">
                      <th className="py-3.5 px-4 font-mono">Ticket ID</th>
                      <th className="py-3.5 px-4">Subject</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4 text-center">Priority</th>
                      <th className="py-3.5 px-4">Created</th>
                      <th className="py-3.5 px-4">Last Updated</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-gray-500">
                          No support tickets found in this category.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map(t => (
                        <tr key={t.id} className="hover:bg-white/[0.01] transition-all">
                          <td className="py-3 px-4 font-mono text-gray-500">{t.id}</td>
                          <td className="py-3 px-4 font-semibold text-white truncate max-w-[200px]">{t.subject}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getCategoryBadgeStyle(t.category)}`}>
                              {t.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getPriorityBadgeStyle(t.priority)}`}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400">
                            {new Date(t.created_at).toLocaleDateString("en-GB")}
                          </td>
                          <td className="py-3 px-4 text-gray-400">
                            {new Date(t.updated_at).toLocaleDateString("en-GB")}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              t.status === "Open"
                                ? "bg-red-500/10 text-red-400 border-red-550/20"
                                : t.status === "In Progress"
                                ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}>
                              {t.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setViewingTicket(t)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Back Button */}
            <button
              onClick={() => setViewingTicket(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-white font-semibold transition-all cursor-pointer text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Ticket Directory
            </button>

            {/* Ticket Header & Description */}
            <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-gray-500 text-sm">{viewingTicket.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getCategoryBadgeStyle(viewingTicket.category)}`}>
                    {viewingTicket.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getPriorityBadgeStyle(viewingTicket.priority)}`}>
                    {viewingTicket.priority}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                    viewingTicket.status === "Open"
                      ? "bg-red-500/10 text-red-400 border-red-550/20"
                      : viewingTicket.status === "In Progress"
                      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {viewingTicket.status.toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-500 text-[11px]">{new Date(viewingTicket.created_at).toLocaleString("en-GB")}</span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">{viewingTicket.subject}</h2>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-gray-300 leading-relaxed text-xs">
                {viewingTicket.description}
              </div>
            </div>

            {/* Replies Thread */}
            <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Replies Thread</h3>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {viewingTicket.replies.length === 0 ? (
                  <p className="text-gray-500 text-xs italic text-center py-4">No responses from Support Agent yet.</p>
                ) : (
                  viewingTicket.replies.map(reply => (
                    <div
                      key={reply.id}
                      className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                        reply.sender === "admin"
                          ? "bg-white/5 border-white/5 text-gray-300 ml-12"
                          : "bg-indigo-950/15 border-indigo-900/20 text-indigo-200 mr-12"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-wider opacity-75 font-semibold">
                        <span>{reply.sender === "admin" ? "👤 Organization Admin" : "🛡️ Taylos Support Team"}</span>
                        <span>{new Date(reply.created_at).toLocaleString("en-GB")}</span>
                      </div>
                      <p>{reply.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Submit Reply */}
              <form onSubmit={handleSendReply} className="flex gap-2 border-t border-white/5 pt-4">
                <input
                  type="text"
                  required
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2 text-white placeholder-gray-650 focus:outline-none focus:border-[var(--color-gold)] text-xs h-[36px]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer h-[36px]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0d12] border border-white/15 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-indigo-400" />
              Create Support Ticket
            </h2>
            
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Subject details..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-gold)]/50 h-[36px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-gold)]/50 h-[36px]"
                  >
                    {["Billing", "Technical", "Compliance", "Access", "Other"].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-gold)]/50 h-[36px]"
                  >
                    {["Low", "Medium", "High"].map(prio => (
                      <option key={prio} value={prio}>{prio}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Description</label>
                <textarea
                  required
                  placeholder="Describe your issue or query details here..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-gold)]/50 resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-xs rounded-xl"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
