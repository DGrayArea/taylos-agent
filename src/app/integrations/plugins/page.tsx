"use client";

import React, { useState } from "react";
import {
  Layers,
  Settings,
  Shield,
  Activity,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  ExternalLink,
  Building
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PluginItem {
  id: string;
  name: string;
  category: "Alerts" | "CRM" | "Communication" | "Ticketing";
  description: string;
  active: boolean;
  logo: string;
}

const INITIAL_PLUGINS: PluginItem[] = [
  {
    id: "slack",
    name: "Slack Notify",
    category: "Alerts",
    description: "Post automatic anomaly audit reviews and severity alerts directly into security channels.",
    active: true,
    logo: "💬"
  },
  {
    id: "msteams",
    name: "Microsoft Teams",
    category: "Alerts",
    description: "Publish compliance alerts and webhook updates into Microsoft Teams workspace channels.",
    active: false,
    logo: "👥"
  },
  {
    id: "resend",
    name: "Resend Mail",
    category: "Communication",
    description: "Trigger automated plain-language alert notification emails to internal auditors.",
    active: true,
    logo: "✉️"
  },
  {
    id: "jira",
    name: "Jira Service Desk",
    category: "Ticketing",
    description: "Automatically log high-severity anomalies as tasks inside Jira ticketing backlog.",
    active: false,
    logo: "📋"
  },
  {
    id: "hubspot",
    name: "HubSpot CRM",
    category: "CRM",
    description: "Sync detected compliance reviews and vendor risk scores to customer record portals.",
    active: false,
    logo: "💼"
  }
];

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<PluginItem[]>(INITIAL_PLUGINS);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginItem | null>(null);
  const [copiedSetting, setCopiedSetting] = useState(false);

  const handleToggle = (id: string) => {
    setPlugins(prev =>
      prev.map(p => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 text-[13px] text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-[var(--color-gold-light)] uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            WORKSPACE: DISCIPLES BANK
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Workflow Plugins
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Connect third-party communications and task managers to automate anomaly workflows.
          </p>
        </div>
      </div>

      {/* Grid of Plugin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map((plugin) => (
          <div
            key={plugin.id}
            className={`rounded-3xl border p-5 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all bg-white/[0.01] ${
              plugin.active ? "border-indigo-500/20 shadow-[0_12px_30px_rgba(99,102,241,0.05)]" : "border-white/5"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-lg border border-white/10 shadow-lg">
                    {plugin.logo}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{plugin.name}</h3>
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">
                      {plugin.category}
                    </span>
                  </div>
                </div>

                {/* Switch Toggle */}
                <button
                  onClick={() => handleToggle(plugin.id)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {plugin.active ? (
                    <ToggleRight className="w-8 h-8 text-emerald-450" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 opacity-40" />
                  )}
                </button>
              </div>

              <p className="text-gray-450 leading-relaxed text-xs">
                {plugin.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className={`text-[10px] font-bold uppercase ${plugin.active ? "text-emerald-455" : "text-gray-500"}`}>
                {plugin.active ? "Enabled" : "Disabled"}
              </span>

              {plugin.active && (
                <button
                  onClick={() => setSelectedPlugin(plugin)}
                  className="px-2.5 py-1 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Configure
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Configure Settings Modal */}
      {selectedPlugin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0d12] border border-white/15 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-base">
                {selectedPlugin.logo}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Configure {selectedPlugin.name}
                </h2>
                <p className="text-gray-550 text-[10px]">Integration setup panel</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
                  Integration Endpoint Token
                </label>
                <input
                  type="password"
                  readOnly
                  value="••••••••••••••••••••••••••••••••••••••••"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-450 focus:outline-none h-[36px]"
                />
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[11px] text-gray-450 leading-relaxed">
                💡 Configuration updates are automatically synced to webhooks triggers. Ensure your endpoint server responds to `analysis.complete` events with status 200.
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setSelectedPlugin(null)}
                className="w-full py-2 bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-xs rounded-xl hover:opacity-90"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
