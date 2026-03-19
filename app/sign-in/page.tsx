import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

export default function SignInPage() {
  return (
    <main className="shell shell-tight">
      <section className="auth-panel">
        <PublicHeader compact />
        <div className="auth-wrap">
          <div className="auth-copy">
            <span className="eyebrow">Account access</span>
            <h1 className="legal-title">Sign in</h1>
            <p className="hero-support hero-support-legal">
              Secure access to your Specterfy workspace.
            </p>
          </div>

          <form className="auth-form">
            <label>
              <span>Email</span>
              <input type="email" placeholder="you@example.com" />
            </label>
            <label>
              <span>Password</span>
              <input type="password" placeholder="Enter password" />
            </label>

            <button type="button" className="button button-primary button-block">
              Continue
            </button>

            <div className="auth-links">
              <Link href="/recover">Forgot password?</Link>
              <Link href="/signup">Create account</Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
