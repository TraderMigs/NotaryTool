import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero-panel">
        <PublicHeader />

        <div className="update-strip">
          <span className="update-dot" />
          <span>Pennsylvania update</span>
          <span className="update-divider" />
          <span>March 28, 2026</span>
        </div>

        <section className="hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">PA Notary Privacy Pre-Processor</span>
            <h1 className="hero-title">
              Clean sensitive PDFs before they become a workflow liability.
            </h1>
            <p className="hero-support">
              A sleek pre-ingestion privacy utility built to help Pennsylvania
              notaries create cleaner copies before documents move into later
              handling.
            </p>

            <div className="hero-actions">
              <Link href="/signup" className="button button-primary">
                Start free
              </Link>
              <Link href="/pricing" className="button button-secondary">
                View pricing
              </Link>
            </div>

            <div className="pill-row">
              <span className="pill">5 sanitizes/day free</span>
              <span className="pill">$14 monthly</span>
              <span className="pill">$97 yearly</span>
            </div>
          </div>

          <aside className="hero-aside">
            <span className="eyebrow">What it is</span>
            <h2 className="aside-title">
              Serious utility. Cleaner positioning. Lower visual friction.
            </h2>
            <ul className="clean-list">
              <li>Privacy pre-processor</li>
              <li>Document sanitization utility</li>
              <li>Clean-copy generator</li>
              <li>Workflow helper</li>
            </ul>
          </aside>
        </section>
      </section>

      <section className="flow-band">
        <div>
          <span className="eyebrow">Why it matters</span>
          <h2 className="section-title">
            Less clutter. Better operator focus. Stronger first impression.
          </h2>
        </div>

        <div className="flow-grid">
          <article className="micro-card">
            <span className="micro-label">01</span>
            <h3>Cleaner front-end handling</h3>
            <p>Reduce exposure before documents move deeper into workflow.</p>
          </article>
          <article className="micro-card">
            <span className="micro-label">02</span>
            <h3>Sharper public posture</h3>
            <p>Utility-first framing instead of bloated platform language.</p>
          </article>
          <article className="micro-card">
            <span className="micro-label">03</span>
            <h3>Fast path to action</h3>
            <p>Simple account flow, clear pricing, and direct entry points.</p>
          </article>
        </div>
      </section>

      <section className="pricing-band">
        <div className="pricing-copy">
          <span className="eyebrow">Pricing</span>
          <h2 className="section-title">Simple entry. Clean upgrade path.</h2>
        </div>

        <div className="pricing-inline">
          <div className="price-chip">
            <strong>Free</strong>
            <span>5 sanitizes/day</span>
          </div>
          <div className="price-chip">
            <strong>$14/mo</strong>
            <span>Unlimited</span>
          </div>
          <div className="price-chip">
            <strong>$97/yr</strong>
            <span>Unlimited</span>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
