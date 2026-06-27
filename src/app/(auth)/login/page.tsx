"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/proposals");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#efe8db] px-4">
      <div className="w-full max-w-[380px]">
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/uploads/Main Logo black.png" alt="BrandAid" className="h-10 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-on-surface font-[family-name:var(--font-display)]">BrandAid</h1>
            <p className="text-[13px] text-on-surface-variant mt-1">Proposal Generator</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#dc2626]/5 border border-[#dc2626]/20 text-[13px] text-[#dc2626]">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-on-surface mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                  mail
                </span>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] bg-white text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-on-surface mb-1.5">
                Security Key
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                  lock
                </span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] bg-white text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRememberDevice(!rememberDevice)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  rememberDevice
                    ? "bg-[#004527] border-[#004527]"
                    : "border-[#c3cdd8] bg-white"
                }`}
              >
                {rememberDevice && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-[13px] text-on-surface-variant">Remember device</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004527] text-white py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#006B3F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#c3cdd8]" />
            <span className="text-[12px] text-on-surface-variant font-medium">OR</span>
            <div className="flex-1 h-px bg-[#c3cdd8]" />
          </div>

          {/* SSO */}
          <button className="w-full flex items-center justify-center gap-2 border border-[#c3cdd8] py-2.5 rounded-lg text-[13px] font-medium text-on-surface hover:bg-surface transition-colors">
            <span className="material-symbols-outlined text-[18px]">shield</span>
            Sign in with SSO
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span className="text-[12px]">Sign in with your organization SSO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
