"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import PublicHeader from "@/components/PublicHeader";

function SignupInner() {
  const params = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const plan = params.get("plan") ?? "free";

  return (
    <main className="sf-shell">
      <section className="sf-hero-wrap sf-auth-wrap">
        <PublicHeader ctaHref="/login" ctaLabel="Log in" />

        <div className="sf-auth-card sf-auth-card-wide">
          <span className="sf-eyebrow">CREATE ACCOUNT</span>
          <h1 className="sf-h2">Start with a plan that fits your workflow.</h1>
          <p className="sf-body">
            Free users get limited daily access. Paid users unlock unlimited use after verified billing flow.
          </p>

          <div className="sf-pills">
            <span className={`sf-pill ${plan === "free" ? "sf-pill-active" : ""}`}>Free</span>
            <span className={`sf-pill ${plan === "monthly" ? "sf-pill-active" : ""}`}>Monthly</span>
            <span className={`sf-pill ${plan === "yearly" ? "sf-pill-active" : ""}`}>Yearly</span>
          </div>

          <form className="sf-form">
            <label className="sf-field">
              <span>Email</span>
              <input type="email" placeholder="you@example.com" />
            </label>

            <label className="sf-field">
              <span>Password</span>
              <div className="sf-password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="sf-eye-btn"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <label className="sf-field">
              <span>Plan</span>
              <select defaultValue={plan}>
                <option value="free">Free · 5 sanitizes/day</option>
                <option value="monthly">$14/month unlimited</option>
                <option value="yearly">$97/year unlimited</option>
              </select>
            </label>

            <label className="sf-check">
              <input type="checkbox" />
              <span>
                I understand Specterfy is a privacy pre-processor utility and does not replace legal judgment,
                downstream review, or user responsibility.
              </span>
            </label>

            <button type="button" className="sf-btn sf-btn-primary sf-btn-full">
              Continue
            </button>
          </form>

          <div className="sf-inline-links">
            <Link href="/terms" className="sf-text-link">Terms</Link>
            <Link href="/privacy" className="sf-text-link">Privacy</Link>
            <Link href="/login" className="sf-text-link">Already have an account?</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupInner />
    </Suspense>
  );
}
