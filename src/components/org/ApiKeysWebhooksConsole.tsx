"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Key,
  Webhook,
  Plus,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Edit2,
  Loader2,
  CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used?: string | null;
  status?: string;
}

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  created_at: string;
  status?: string;
  last_triggered?: string | null;
}

interface ApiKeysWebhooksConsoleProps {
  orgId: string;
  orgName: string;
}

export function ApiKeysWebhooksConsole({ orgId, orgName }: ApiKeysWebhooksConsoleProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // States
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);

  // Key Generation Modal
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);

  // Webhook Modal
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "analysis.complete",
    "case.create",
    "case.resolve"
  ]);
  const [editingWebhook, setEditingWebhook] = useState<WebhookItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Fetch API Keys
      const { data: keyData } = await supabase
        .from("api_keys")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

      if (keyData) {
        setApiKeys(keyData);
      }

      // 2. Fetch Webhooks
      const { data: hookData } = await supabase
        .from("webhooks")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

      if (hookData) {
        setWebhooks(hookData);
      }
    } catch (err) {
      console.error("Error loading API/Webhook data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  // API Key operations
  const handleGenerateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setActionLoading("apikey");
      const rawKey = `tl_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const prefix = rawKey.substring(0, 12) + "...";

      const { error } = await supabase.from("api_keys").insert({
        org_id: orgId,
        name: newKeyName.trim(),
        key_prefix: prefix,
        // Fallback fields for display compatibility
        last_used: null,
        status: "Active"
      });

      if (error) {
        alert(error.message);
        return;
      }

      setGeneratedKey(rawKey);
      setNewKeyName("");
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Integrations using it will fail immediately.")) return;

    try {
      setActionLoading(`revoke-key-${keyId}`);
      const { error } = await supabase.from("api_keys").delete().eq("id", keyId);
      if (error) alert(error.message);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Webhook operations
  const handleWebhookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim() || selectedEvents.length === 0) return;

    try {
      setActionLoading("webhook");
      
      if (editingWebhook) {
        // Edit existing
        const { error } = await supabase
          .from("webhooks")
          .update({
            url: webhookUrl.trim(),
            events: selectedEvents
          })
          .eq("id", editingWebhook.id);

        if (error) alert(error.message);
      } else {
        // Create new
        const { error } = await supabase.from("webhooks").insert({
          org_id: orgId,
          url: webhookUrl.trim(),
          events: selectedEvents,
          status: "Active",
          last_triggered: null
        });

        if (error) alert(error.message);
      }

      setWebhookUrl("");
      setSelectedEvents(["analysis.complete", "case.create", "case.resolve"]);
      setEditingWebhook(null);
      setShowWebhookModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditWebhookClick = (hook: WebhookItem) => {
    setEditingWebhook(hook);
    setWebhookUrl(hook.url);
    setSelectedEvents(hook.events);
    setShowWebhookModal(true);
  };

  const handleDeleteWebhook = async (hookId: string) => {
    if (!confirm("Are you sure you want to delete this webhook endpoint?")) return;

    try {
      setActionLoading(`delete-hook-${hookId}`);
      const { error } = await supabase.from("webhooks").delete().eq("id", hookId);
      if (error) alert(error.message);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  const copyKeyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const webhookEventsList = [
    "analysis.complete",
    "case.create",
    "case.resolve",
    "batch.complete",
    "monitor.alert",
    "notification.send"
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-24 text-[13px] text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-[var(--color-gold-light)] uppercase tracking-wider mb-2">
            <Key className="w-3.5 h-3.5" />
            WORKSPACE: {orgName.toUpperCase()}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            APIs & Webhooks
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Generate credentials and configure trigger webhooks to integrate Taylos Agent with your internal applications.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-1.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-white/5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reload Data
        </button>
      </div>

      {/* ─── API KEYS SECTION ───────────────────────────────────── */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4.5 h-4.5 text-[var(--color-gold)]" />
            API Keys
          </h3>
          <button
            onClick={() => {
              setGeneratedKey("");
              setShowKeyModal(true);
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            Generate New API Key
          </button>
        </div>

        {/* API Keys Table */}
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] text-gray-450 font-bold uppercase tracking-wider border-b border-white/5">
                <th className="py-3.5 px-4">Key Name</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 font-mono">Key Prefix</th>
                <th className="py-3.5 px-4">Last Used</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-550 font-mono">
                    FETCHING KEY DIRECTORY...
                  </td>
                </tr>
              ) : apiKeys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    No active API keys found. Click generate to create one.
                  </td>
                </tr>
              ) : (
                apiKeys.map(key => (
                  <tr key={key.id} className="hover:bg-white/[0.01]">
                    <td className="py-3.5 px-4 font-semibold text-white">{key.name}</td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {new Date(key.created_at).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-450">{key.key_prefix}</td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {key.last_used ? new Date(key.last_used).toLocaleString("en-GB") : "Never"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                        {key.status || "Active"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        disabled={actionLoading === `revoke-key-${key.id}`}
                        onClick={() => handleRevokeKey(key.id)}
                        className="p-1.5 rounded-lg border border-rose-500/25 hover:border-rose-500/50 text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── WEBHOOKS SECTION ───────────────────────────────────── */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Webhook className="w-4.5 h-4.5 text-[var(--color-gold)]" />
            Webhooks
          </h3>
          <button
            onClick={() => {
              setEditingWebhook(null);
              setWebhookUrl("");
              setSelectedEvents(["analysis.complete", "case.create", "case.resolve"]);
              setShowWebhookModal(true);
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Webhook
          </button>
        </div>

        {/* Webhooks Table */}
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] text-gray-450 font-bold uppercase tracking-wider border-b border-white/5">
                <th className="py-3.5 px-4">Endpoint URL</th>
                <th className="py-3.5 px-4">Events Subscribed</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Last Triggered</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-550 font-mono">
                    FETCHING WEBHOOK DIRECTORY...
                  </td>
                </tr>
              ) : webhooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    No webhook endpoints configured. Click add to register one.
                  </td>
                </tr>
              ) : (
                webhooks.map(hook => (
                  <tr key={hook.id} className="hover:bg-white/[0.01]">
                    <td className="py-3.5 px-4 font-medium text-white truncate max-w-[200px]">{hook.url}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {hook.events.map(ev => (
                          <span key={ev} className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[10px] text-gray-400 font-mono">{ev}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                        {hook.status || "Active"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {hook.last_triggered ? new Date(hook.last_triggered).toLocaleString("en-GB") : "Never"}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditWebhookClick(hook)}
                        className="p-1 text-gray-450 hover:text-white transition-all cursor-pointer hover:bg-white/5 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={actionLoading === `delete-hook-${hook.id}`}
                        onClick={() => handleDeleteWebhook(hook.id)}
                        className="p-1 text-gray-450 hover:text-rose-450 transition-all cursor-pointer hover:bg-rose-500/10 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── API KEY GENERATE MODAL ──────────────────────────────── */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0d12] border border-white/15 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" />
              Generate API Authentication Key
            </h2>

            {!generatedKey ? (
              <form onSubmit={handleGenerateKeySubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Key Description / Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ERP Ledger Service"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-gold)]/50 h-[36px]"
                  />
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="flex-1 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-xs rounded-xl"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl space-y-2">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Save this key now (Warning)
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    This key will not be shown again. Securely copy it now to avoid losing access:
                  </p>
                  <div className="flex items-center justify-between gap-2 bg-black border border-white/5 rounded-xl p-2 font-mono text-[11px] text-white">
                    <span className="truncate flex-1 select-all break-all">{generatedKey}</span>
                    <button
                      onClick={() => copyKeyToClipboard(generatedKey)}
                      className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold"
                >
                  Close Key Panel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── WEBHOOK ADD/EDIT MODAL ──────────────────────────────── */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0d12] border border-white/15 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Webhook className="w-5 h-5 text-indigo-400" />
              {editingWebhook ? "Modify Webhook Configuration" : "Configure Incident Webhook"}
            </h2>

            <form onSubmit={handleWebhookSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Endpoint URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.yourbank.com/taylos-events"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-gold)]/50 h-[36px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Subscribed Trigger Events</label>
                <div className="grid grid-cols-2 gap-2">
                  {webhookEventsList.map(ev => {
                    const checked = selectedEvents.includes(ev);
                    return (
                      <button
                        type="button"
                        key={ev}
                        onClick={() => toggleEvent(ev)}
                        className={`p-2.5 rounded-xl border text-xs text-left font-mono flex items-center gap-2 transition-all cursor-pointer ${
                          checked
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 font-semibold"
                            : "bg-transparent border-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        <CheckSquare className={`w-3.5 h-3.5 ${checked ? "text-indigo-400" : "text-gray-600"}`} />
                        {ev}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="flex-1 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedEvents.length === 0}
                  className="flex-1 py-2 bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-xs rounded-xl disabled:opacity-50"
                >
                  {editingWebhook ? "Update Webhook" : "Add Webhook"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
