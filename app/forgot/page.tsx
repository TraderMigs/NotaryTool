import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function ForgotPage() {
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
            <div className="eyebrow">Password recovery</div>
            <h1 className="section-title">Reset access</h1>
            <p className="page-text">Request a reset link. Final email flow wiring comes next.</p>

            <form className="auth-form">

<label className="field">
  <span>Email</span>
  <input type="email" placeholder="you@example.com" />
</label>

              <button type="button" className="button button-primary button-full">Send reset link</button>
            </form>

            <div className="sub-links">

<Link href="/login">Back to log in</Link>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
