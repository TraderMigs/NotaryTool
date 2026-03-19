import Link from "next/link";

export default function ForgotPage() {
  return (
    <main className="auth-shell">
      <div className="auth-card">
        <Link href="/login" className="back-link">← Back to login</Link>

        <div className="eyebrow">PASSWORD RECOVERY</div>
        <h1 className="auth-title">Reset account access</h1>
        <p className="muted">
          Recovery email wiring lands in the next phase. This page is the public shell.
        </p>

        <form className="auth-form">
          <label className="field-wrap">
            <span className="field-label">Email</span>
            <input type="email" className="field-input" placeholder="you@example.com" />
          </label>

          <button type="button" className="primary-btn auth-btn">Send reset link</button>
        </form>

        <div className="auth-links">
          <Link href="/login" className="text-link">Back to login</Link>
          <Link href="/privacy" className="text-link">Privacy</Link>
        </div>
      </div>
    </main>
  );
}
