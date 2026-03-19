"use client";

import Link from "next/link";
import { useState } from "react";
import PublicHeader from "@/components/PublicHeader";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="sf-shell">
      <section className="sf-hero-wrap sf-auth-wrap">
        <PublicHeader ctaHref="/signup" ctaLabel="Create account" />

        <div className="sf-auth-card">
          <span className="sf-eyebrow">ACCOUNT ACCESS</span>
          <h1 className="sf-h2">Log in to Specterfy</h1>
          <p className="sf-body">
            Access your account and continue your privacy-first workflow.
          </p>

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
                  placeholder="Enter your password"
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

            <button type="button" className="sf-btn sf-btn-primary sf-btn-full">
              Log in
            </button>
          </form>

          <div className="sf-inline-links">
            <Link href="/forgot" className="sf-text-link">Forgot password?</Link>
            <Link href="/signup" className="sf-text-link">Create account</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
