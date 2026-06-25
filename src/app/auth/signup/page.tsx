"use client";

import React, { useState, Suspense } from "react";
import { signup, signInWithGoogle } from "../actions";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

function SignupForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07080d] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* ── BACKGROUND FLUID DESIGN ───────────────────────────────── */}
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:30px_30px]" />
      
      {/* Ambient glowing blobs (Liquid design) */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[var(--color-accent)]/10 blur-[130px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[var(--color-gold)]/5 blur-[130px] animate-pulse pointer-events-none" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Floating particles/grid accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* ── SIGNUP CARD (Compact & Portable) ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full max-w-[380px] relative z-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-indigo-500/30 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 md:p-8 transition-all duration-500 overflow-hidden"
      >
        {/* Cursor tracker radial glow overlay */}
        {isHovered && (
          <div
            className="absolute pointer-events-none inset-0 rounded-3xl opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(300px circle at ${coords.x}px ${coords.y}px, rgba(99,102,241,0.08), transparent 70%)`,
            }}
          />
        )}

        <div className="flex flex-col items-center mb-5 relative">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center shadow-[0_8px_24px_rgba(99,102,241,0.25)] mb-3"
          >
            <Shield className="w-6 h-6 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Create an account
          </h2>
          <p className="text-gray-400 text-xs mt-1 text-center leading-relaxed max-w-[280px]">
            Get started with Taylos AI-powered auditing.
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
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-[var(--color-success)] text-[11px] text-center font-medium"
          >
            {message}
          </motion.div>
        )}

        <form className="space-y-4 relative" action={signup}>
          {/* Email input */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[10px] font-semibold text-gray-450 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2.5 pl-10.5 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:shadow-[0_0_15px_rgba(99,102,241,0.12)] text-xs transition-all duration-300"
                placeholder="you@company.com"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[10px] font-semibold text-gray-450 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2.5 pl-10.5 pr-10.5 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:shadow-[0_0_15px_rgba(99,102,241,0.12)] text-xs transition-all duration-300"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            formAction={signup}
            className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.35)] focus:outline-none transition-all duration-300 cursor-pointer"
          >
            Create Account
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </form>

        <div className="mt-5 relative">
          <div className="relative flex items-center justify-center mb-4">
            <div className="absolute inset-0 w-full border-t border-white/5" />
            <span className="relative px-2.5 bg-[#08090e] text-[9px] font-semibold text-gray-500 uppercase tracking-widest">
              Or continue with
            </span>
          </div>

          {/* Google SSO Button */}
          <form action={signInWithGoogle}>
            <motion.button
              whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl border border-white/10 bg-white/[0.01] text-xs font-semibold text-white transition-all duration-300 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </motion.button>
          </form>
        </div>

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

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#07080d]">
        <div className="text-gray-500 font-mono text-[10px] animate-pulse">LOADING SECURE PORTAL...</div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
