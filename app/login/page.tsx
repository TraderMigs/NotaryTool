import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function LoginPage() {
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
            <div className="eyebrow">Account access</div>
            <h1 className="section-title">Log in</h1>
            <p className="page-text">Access the Specterfy account shell. Full auth wiring comes next.</p>

            <form className="auth-form">

<label className="field">
  <span>Email</span>
  <input type="email" placeholder="you@example.com" />
</label>
<label className="field">
  <span>Password</span>
  <input type="password" placeholder="Enter password" />
</label>

              <button type="button" className="button button-primary button-full">Log in</button>
            </form>

            <div className="sub-links">

<Link href="/forgot">Forgot password?</Link>
<Link href="/signup">Create account</Link>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
