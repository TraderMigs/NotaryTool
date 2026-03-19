import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";

export default function HomePage() {
  return (
    <main className="site-shell">
      <section className="landing-hero">
        <PublicHeader />

        <div className="hero-grid">
          <div>
            <div className="eyebrow">PA NOTARY PRIVACY PRE-PROCESSOR</div>
            <h1 className="landing-title">
              Sanitize sensitive PDFs before they enter downstream notary workflows
            </h1>

            <p className="landing-copy">
              Specterfy helps create clean privacy-first copies before a document moves into later processing.
              It is a document sanitization utility and workflow aid, not a journal,
              not a RON platform, and not a state-approved notarization provider.
            </p>

            <div className="hero-actions">
              <Link href="/signup" className="primary-btn">Start free</Link>
              <Link href="/pricing" className="secondary-btn">View pricing</Link>
            </div>

            <div className="pill-row">
              <span className="pill">Free plan: 5 sanitizes/day</span>
              <span className="pill">$14/mo unlimited</span>
              <span className="pill">$97/year unlimited</span>
              <span className="pill">Utility positioning only</span>
            </div>
          </div>

          <div className="deadline-card">
            <div>
              <div className="eyebrow">WHAT THIS PRODUCT IS</div>
              <h2 className="panel-title">Privacy-first pre-ingestion workflow layer</h2>
            </div>

            <p className="deadline-copy">
              Use Specterfy before downstream workflow steps so operators can reduce
              unnecessary exposure of sensitive information during handling.
            </p>

            <ul className="check-list">
              <li>Document sanitization utility</li>
              <li>Clean-copy generator</li>
              <li>Pre-ingestion privacy step</li>
              <li>Workflow helper, not a regulated platform</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="value-strip">
        <div className="value-card">
          <div className="eyebrow">WHAT IT IS</div>
          <h2>Utility first</h2>
          <p>Privacy pre-processor. Document sanitization utility. Clean-copy generator.</p>
        </div>

        <div className="value-card">
          <div className="eyebrow">WHAT IT IS NOT</div>
          <h2>Not a regulated notary platform</h2>
          <p>Not a journal. Not a notarization system. Not a seal or identity verification workflow.</p>
        </div>

        <div className="value-card">
          <div className="eyebrow">CURRENT BUILD PATH</div>
          <h2>Public product shell first</h2>
          <p>Landing, pricing, auth screens, legal pages, then real account and Stripe wiring.</p>
        </div>
      </section>

      <section className="tool-grid">
        <article className="tool-card">
          <div className="card-label">FREE</div>
          <h3>Starter</h3>
          <p>Create an account and access the free usage path with daily limits.</p>
          <Link href="/signup" className="primary-btn small-btn">Create account</Link>
        </article>

        <article className="tool-card">
          <div className="card-label">PAID</div>
          <h3>Unlimited</h3>
          <p>Choose monthly or yearly when you are ready for unlimited sanitization usage.</p>
          <Link href="/pricing" className="secondary-btn small-btn">View plans</Link>
        </article>

        <article className="tool-card">
          <div className="card-label">CURRENT TOOL</div>
          <h3>Sanitize utility</h3>
          <p>The working MVP tool stays available while the real SaaS shell is built around it.</p>
          <Link href="/sanitize" className="secondary-btn small-btn">Open tool</Link>
        </article>
      </section>

      <PublicFooter />
    </main>
  );
}
