"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function SignupContent() {
  const params = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const preselectedPlan = params.get("plan") || "free";

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <Link href="/" className="back-link">← Back home</Link>

        <div className="eyebrow">CREATE ACCOUNT</div>
        <h1 className="auth-title">Start with the right plan</h1>
        <p className="muted">
          This is the public account entry shell. Real auth wiring, legal acceptance storage,
          and Stripe gating land in the next phase.
        </p>

        <div className="plan-pills">
          <span className={preselectedPlan === "free" ? "pill active-plan-pill" : "pill"}>Free</span>
          <span className={preselectedPlan === "monthly" ? "pill active-plan-pill" : "pill"}>Monthly</span>
          <span className={preselectedPlan === "yearly" ? "pill active-plan-pill" : "pill"}>Yearly</span>
        </div>

        <form className="auth-form">
          <label className="field-wrap">
            <span className="field-label">Email</span>
            <input type="email" className="field-input" placeholder="you@example.com" />
          </label>

          <label className="field-wrap">
            <span className="field-label">Password</span>
            <div className="password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                className="field-input password-input"
                placeholder="Create a password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label className="field-wrap">
            <span className="field-label">Plan</span>
            <select className="field-input" defaultValue={preselectedPlan}>
              <option value="free">Free • 5/day</option>
              <option value="monthly">$14/month</option>
              <option value="yearly">$97/year</option>
            </select>
          </label>

          <label className="check-row legal-row">
            <input type="checkbox" />
            <span className="list-text">
              I understand this tool is a privacy pre-processor utility and does not replace legal judgment or workflow review.
            </span>
          </label>

          <button type="button" className="primary-btn auth-btn">Continue</button>
        </form>

        <div className="auth-links">
          <Link href="/login" className="text-link">Already have an account?</Link>
          <Link href="/terms" className="text-link">Terms</Link>
          <Link href="/privacy" className="text-link">Privacy</Link>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}
