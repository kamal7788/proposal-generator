"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Failed to reset password");
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-[#c3cdd8]/50 p-8 text-center max-w-md">
          <span className="material-symbols-outlined text-[48px] text-red-500 mb-3 block">error</span>
          <h1 className="text-[20px] font-bold text-on-surface mb-2">Invalid Link</h1>
          <p className="text-[13px] text-on-surface-variant mb-4">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="text-[13px] text-[#004527] font-medium hover:underline">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-[#c3cdd8]/50 p-8">
          <div className="text-center mb-6">
            <h1 className="text-[20px] font-bold text-on-surface font-[family-name:var(--font-display)]">
              Reset Password
            </h1>
            <p className="text-[13px] text-on-surface-variant mt-1">
              Enter your new password below
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <span className="material-symbols-outlined text-[48px] text-[#004527] mb-3 block">check_circle</span>
              <p className="text-[13px] text-on-surface mb-4">Password reset successful!</p>
              <Link href="/login" className="text-[13px] text-[#004527] font-medium hover:underline">
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527]"
                  placeholder="Min. 8 characters"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527]"
                  placeholder="Repeat password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#004527] text-white py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#006B3F] transition-colors disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-[13px] text-on-surface-variant">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
