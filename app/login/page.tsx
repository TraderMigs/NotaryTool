"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <Link href="/" className="back-link">← Back home</Link>

        <div className="eyebrow">ACCOUNT ACCESS</div>
        <h1 className="auth-title">Log in to Specterfy</h1>
        <p className="muted">
          This is the polished login shell. Real authentication lands in the next phase.
        </p>

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
                placeholder="Enter your password"
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

          <button type="button" className="primary-btn auth-btn">Log in</button>
        </form>

        <div className="auth-links">
          <Link href="/forgot" className="text-link">Forgot password?</Link>
          <Link href="/signup" className="text-link">Create account</Link>
        </div>
      </div>
    </main>
  );
}
