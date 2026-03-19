import Link from "next/link";

export default function RecoverPage() {
  return (
    <main className="auth-shell">
      <div className="auth-card">
        <Link href="/sign-in" className="back-link">
          ← Back to sign in
        </Link>

        <div className="eyebrow">ACCOUNT RECOVERY</div>
        <h1 className="auth-title">Recover account access</h1>
        <p className="muted">
          Enter the owner email and continue. This is the front-end recovery step
          so the account flow looks complete and credible from the start.
        </p>

        <form className="auth-form">
          <label className="field-wrap">
            <span className="field-label">Owner email</span>
            <input type="email" className="field-input" placeholder="owner@shop.com" />
          </label>

          <button type="button" className="primary-btn auth-btn">
            Send recovery link
          </button>
        </form>

        <div className="auth-links">
          <Link href="/" className="text-link">
            Back home
          </Link>
          <Link href="/dashboard" className="text-link">
            Owner dashboard preview
          </Link>
        </div>
      </div>
    </main>
  );
}
