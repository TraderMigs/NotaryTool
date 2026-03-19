import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

export default function SignupPage() {
  return (
    <main className="shell shell-tight">
      <section className="auth-panel">
        <PublicHeader compact />
        <div className="auth-wrap">
          <div className="auth-copy">
            <span className="eyebrow">Create account</span>
            <h1 className="legal-title">Start with a clean entry point.</h1>
            <p className="hero-support hero-support-legal">
              Build your account first. Billing, usage limits, and account wiring
              come next in the product flow.
            </p>
          </div>

          <form className="auth-form">
            <label>
              <span>Email</span>
              <input type="email" placeholder="you@example.com" />
            </label>
            <label>
              <span>Password</span>
              <input type="password" placeholder="Create password" />
            </label>
            <label>
              <span>Plan</span>
              <select defaultValue="free">
                <option value="free">Free • 5/day</option>
                <option value="monthly">$14/month</option>
                <option value="yearly">$97/year</option>
              </select>
            </label>

            <button type="button" className="button button-primary button-block">
              Create account
            </button>

            <div className="auth-links">
              <Link href="/sign-in">Already have an account?</Link>
              <Link href="/pricing">View pricing</Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
