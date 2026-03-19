import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

export default function RecoverPage() {
  return (
    <main className="shell shell-tight">
      <section className="auth-panel">
        <PublicHeader compact />
        <div className="auth-wrap auth-wrap-single">
          <div className="auth-copy">
            <span className="eyebrow">Recovery</span>
            <h1 className="legal-title">Reset access</h1>
            <p className="hero-support hero-support-legal">
              Enter the email tied to your account to start the recovery path.
            </p>
          </div>

          <form className="auth-form auth-form-narrow">
            <label>
              <span>Email</span>
              <input type="email" placeholder="you@example.com" />
            </label>

            <button type="button" className="button button-primary button-block">
              Send reset link
            </button>

            <div className="auth-links">
              <Link href="/sign-in">Back to sign in</Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
