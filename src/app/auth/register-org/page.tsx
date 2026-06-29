"use client";

import React, { useState, useEffect, Suspense } from "react";
import { registerOrganisation } from "../actions";
import { Shield, Building, Globe, Briefcase, User, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function RegisterOrgForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const supabase = createClient();

  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("Banking");
  const [country, setCountry] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name || user.user_metadata?.name || "";
        setFullName(name);
        setEmail(user.email || "");
      }
    });
  }, [supabase]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07080d] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:30px_30px]" />
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[var(--color-accent)]/10 blur-[130px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[var(--color-gold)]/5 blur-[130px] animate-pulse pointer-events-none" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Floating Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full max-w-[420px] relative z-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-indigo-500/30 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 md:p-8 transition-all duration-500 overflow-hidden"
      >
        {isHovered && (
          <div
            className="absolute pointer-events-none inset-0 rounded-3xl opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(300px circle at ${coords.x}px ${coords.y}px, rgba(99,102,241,0.08), transparent 70%)`,
            }}
          />
        )}

        <div className="flex flex-col items-center mb-6 relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center shadow-[0_8px_24px_rgba(99,102,241,0.25)] mb-3"
          >
            <Building className="w-6 h-6 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Register Organisation
          </h2>
          <p className="text-gray-400 text-xs mt-1 text-center leading-relaxed max-w-[320px]">
            Set up your organization workspace and admin account.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] text-center font-medium"
          >
            {error}
          </motion.div>
        )}

        <form className="space-y-4 relative" action={registerOrganisation}>
          {/* Organisation Name */}
          <div className="space-y-1">
            <label htmlFor="orgName" className="text-[10px] font-semibold text-gray-450 uppercase tracking-wider block">
              Organisation Name
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Building className="w-4 h-4" />
              </span>
              <input
                id="orgName"
                name="orgName"
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2 pl-10.5 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] text-xs transition-all"
                placeholder="e.g. First Bank Nigeria"
              />
            </div>
          </div>

          {/* Industry & Country grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="industry" className="text-[10px] font-semibold text-gray-450 uppercase tracking-wider block">
                Industry
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                  <Briefcase className="w-4 h-4" />
                </span>
                <select
                  id="industry"
                  name="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-xl bg-black border border-white/10 px-3.5 py-2 pl-10.5 text-white focus:outline-none focus:border-[var(--color-accent)] text-xs transition-all"
                >
                  <option value="Banking">Banking</option>
                  <option value="Fintech">Fintech</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Retail">Retail</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="country" className="text-[10px] font-semibold text-gray-450 uppercase tracking-wider block">
                Country
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                  <Globe className="w-4 h-4" />
                </span>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2 pl-10.5 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-accent)] text-xs transition-all"
                  placeholder="Nigeria"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 my-2 pt-2" />

          {/* Admin Name */}
          <div className="space-y-1">
            <label htmlFor="fullName" className="text-[10px] font-semibold text-gray-450 uppercase tracking-wider block">
              Admin Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <User className="w-4 h-4" />
              </span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                readOnly
                value={fullName}
                className="w-full rounded-xl bg-white/[0.01] border border-white/5 px-3.5 py-2 pl-10.5 text-gray-400 cursor-not-allowed text-xs transition-all focus:outline-none"
                placeholder="Admin Full Name"
              />
            </div>
          </div>

          {/* Admin Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="text-[10px] font-semibold text-gray-450 uppercase tracking-wider block">
              Admin Email
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                readOnly
                value={email}
                className="w-full rounded-xl bg-white/[0.01] border border-white/5 px-3.5 py-2 pl-10.5 text-gray-400 cursor-not-allowed text-xs transition-all focus:outline-none"
                placeholder="admin@firstbank.com"
              />
            </div>
          </div>
          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-[0_4px_16px_rgba(99,102,241,0.25)] focus:outline-none transition-all cursor-pointer"
          >
            Register Workspace
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </form>

        <div className="mt-5 text-center text-xs text-gray-400 relative">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[var(--color-gold-light)] hover:text-white font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterOrgPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#07080d]">
        <div className="text-gray-500 font-mono text-[10px] animate-pulse">LOADING SECURE PORTAL...</div>
      </div>
    }>
      <RegisterOrgForm />
    </Suspense>
  );
}
