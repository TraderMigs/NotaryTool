import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function SignupPage() {
  return (
    <main className="page-shell">
      <section className="section-shell">
        <div className="panel auth-panel">
          <PublicHeader />
          <div className="auth-wrap">
            <div className="update-banner compact-banner">
              <span className="update-dot" />
              <span>March 28, 2026 update</span>
            </div>
            <div className="eyebrow">Create account</div>
            <h1 className="section-title">Start with a cleaner front end</h1>
            <p className="page-text">Pick a plan and create your account. Payment wiring comes in the next phase.</p>

            <form className="auth-form">

<label className="field">
  <span>Email</span>
  <input type="email" placeholder="you@example.com" />
</label>
<label className="field">
  <span>Password</span>
  <input type="password" placeholder="Create password" />
</label>
<label className="field">
  <span>Plan</span>
  <select defaultValue="free">
    <option value="free">Free • 5/day</option>
    <option value="monthly">$14/month</option>
    <option value="yearly">$97/year</option>
  </select>
</label>

              <button type="button" className="button button-primary button-full">Create account</button>
            </form>

            <div className="sub-links">

<Link href="/login">Already have an account?</Link>
<Link href="/pricing">View pricing</Link>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
