import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

export default function ForgotPage() {
  return (
    <main className="sf-shell">
      <section className="sf-hero-wrap sf-auth-wrap">
        <PublicHeader ctaHref="/login" ctaLabel="Log in" />

        <div className="sf-auth-card">
          <span className="sf-eyebrow">PASSWORD RECOVERY</span>
          <h1 className="sf-h2">Reset account access</h1>
          <p className="sf-body">
            Enter your email to continue the recovery flow.
          </p>

          <form className="sf-form">
            <label className="sf-field">
              <span>Email</span>
              <input type="email" placeholder="you@example.com" />
            </label>

            <button type="button" className="sf-btn sf-btn-primary sf-btn-full">
              Send reset link
            </button>
          </form>

          <div className="sf-inline-links">
            <Link href="/login" className="sf-text-link">Back to login</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
