"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {}
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-[#c3cdd8]/50 p-8">
          <div className="text-center mb-6">
            <h1 className="text-[20px] font-bold text-on-surface font-[family-name:var(--font-display)]">
              Forgot Password
            </h1>
            <p className="text-[13px] text-on-surface-variant mt-1">
              Enter your email to receive a reset link
            </p>
          </div>

          {submitted ? (
            <div className="text-center">
              <span className="material-symbols-outlined text-[48px] text-[#004527] mb-3 block">check_circle</span>
              <p className="text-[13px] text-on-surface mb-4">
                If an account exists with that email, you&apos;ll receive a password reset link shortly.
              </p>
              <Link href="/login" className="text-[13px] text-[#004527] font-medium hover:underline">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527]"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#004527] text-white py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#006B3F] transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <div className="text-center">
                <Link href="/login" className="text-[13px] text-on-surface-variant hover:text-on-surface">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
