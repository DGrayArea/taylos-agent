"use client";

import { motion } from "framer-motion";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-10 pb-24 overflow-x-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400 text-sm md:text-base">Manage your account preferences and notification settings.</p>
      </motion.div>

      <FloatingCard className="space-y-8">
        <div>
          <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Full Name</label>
              <input type="text" defaultValue="Jane Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Email Address</label>
              <input type="email" defaultValue="jane.doe@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-400 focus:outline-none cursor-not-allowed" disabled />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Notifications</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[var(--color-gold)]" />
              <span className="text-sm text-gray-300">Email me when an anomaly is detected</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[var(--color-gold)]" />
              <span className="text-sm text-gray-300">Send daily analysis digest</span>
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Save Changes</Button>
        </div>
      </FloatingCard>
    </div>
  );
}
