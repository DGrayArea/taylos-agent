"use client";

import { useState } from "react";
import { User, Lock } from "lucide-react";
import { signInWithGoogleForInvite } from "../actions";

interface AcceptInviteClientProps {
  token: string;
  email: string;
}

export function AcceptInviteClient({ token, email }: AcceptInviteClientProps) {
  const [showEmailFields, setShowEmailFields] = useState(false);

  return (
    <div className="space-y-4">
      {!showEmailFields ? (
        <div className="space-y-4">
          {/* Continue with Google button */}
          <button
            type="button"
            onClick={() => signInWithGoogleForInvite(token)}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold text-gray-900 bg-white hover:bg-gray-100 shadow-[0_4px_16px_rgba(255,255,255,0.05)] focus:outline-none transition-all cursor-pointer border border-gray-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.49 3.77v3.13h4.02c2.35-2.16 3.7-5.34 3.7-8.75z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.02-3.13c-1.12.75-2.55 1.19-3.91 1.19-3.02 0-5.58-2.04-6.5-4.79H1.36v3.24A12 12 0 0 0 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.5 14.36a7.16 7.16 0 0 1 0-4.72V6.4H1.36a11.97 11.97 0 0 0 0 11.2l4.14-3.24z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.96 11.96 0 0 0 1.36 6.4l4.14 3.24c.92-2.75 3.48-4.79 6.5-4.79z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Toggle link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowEmailFields(true)}
              className="text-xs text-[var(--color-gold-light)] hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Sign up with email instead
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-[10px] font-semibold text-gray-450 uppercase tracking-wider block">
              Your Full Name
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
                className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2.5 pl-10.5 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] text-xs transition-all"
                placeholder="Adaeze Okonkwo"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[10px] font-semibold text-gray-450 uppercase tracking-wider block">
              Create Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2.5 pl-10.5 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] text-xs transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_4px_16px_rgba(16,185,129,0.25)] focus:outline-none transition-all cursor-pointer"
          >
            Create Account & Join →
          </button>

          {/* Back to Google Option */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setShowEmailFields(false)}
              className="text-[11px] text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
            >
              ← Back to Google sign up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
