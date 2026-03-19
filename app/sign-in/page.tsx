"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <Link href="/" className="back-link">
          ← Back home
        </Link>

        <div className="eyebrow">OWNER ACCESS</div>
        <h1 className="auth-title">Sign in to NotaryTool</h1>
        <p className="muted">
          This screen is a polished front-end owner entry point for the March
          refresh. Full authenticated account wiring can sit behind this later.
        </p>

        <form className="auth-form">
          <label className="field-wrap">
            <span className="field-label">Email</span>
            <input type="email" className="field-input" placeholder="owner@shop.com" />
          </label>

          <label className="field-wrap">
            <span className="field-label">Password</span>
            <div className="password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                className="field-input password-input"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="eye-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </label>

          <button type="button" className="primary-btn auth-btn">
            Sign in
          </button>
        </form>

        <div className="auth-links">
          <Link href="/recover" className="text-link">
            Recover account
          </Link>
          <Link href="/dashboard" className="text-link">
            Owner dashboard preview
          </Link>
        </div>
      </div>
    </main>
  );
}
