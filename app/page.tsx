import Link from "next/link";
import PublicFooter from "../components/PublicFooter";
import PublicHeader from "../components/PublicHeader";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-wrap">
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />

        <div className="panel hero-panel">
          <PublicHeader />

          <div className="update-banner">
            <span className="update-dot" />
            <span>PA update</span>
            <span className="update-divider" />
            <span>March 28, 2026</span>
          </div>

          <div className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">PA Notary Privacy Pre-Processor</div>
              <h1 className="hero-title">
                Clean sensitive PDFs before they turn into a handling risk.
              </h1>
              <p className="hero-text">
                Specterfy is a privacy-first utility for creating cleaner copies before
                documents move into downstream notary handling.
              </p>

              <div className="hero-actions">
                <Link href="/signup" className="button button-primary">Start free</Link>
                <Link href="/pricing" className="button button-secondary">View pricing</Link>
              </div>

              <div className="hero-tags">
                <span className="tag">5 sanitizes/day free</span>
                <span className="tag">$14 monthly</span>
                <span className="tag">$97 yearly</span>
              </div>
            </div>

            <aside className="hero-card">
              <div className="mini-label">What it is</div>
              <h2 className="hero-card-title">A serious privacy utility with cleaner positioning.</h2>
              <p className="hero-card-text">
                Built for a tight public posture and a polished operator-facing experience.
              </p>

              <div className="bullet-list">
                <span>Privacy pre-processor</span>
                <span>Document sanitization utility</span>
                <span>Clean-copy generator</span>
                <span>Workflow helper</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section-shell compact-section">
        <div className="split-callout">
          <div>
            <div className="eyebrow">Designed for the shift ahead</div>
            <h2 className="section-title">Cleaner front-end handling. Less visual noise. Better trust.</h2>
          </div>

          <div className="callout-actions">
            <Link href="/signup" className="button button-primary">Create account</Link>
            <Link href="/privacy" className="button button-secondary">Read privacy</Link>
          </div>
        </div>
      </section>

      <section className="section-shell features-shell">
        <div className="feature-row">
          <article className="feature-card">
            <div className="mini-label">Focused</div>
            <h3>Minimal, controlled workflow</h3>
            <p>Sharper presentation without walls of filler copy or bulky blocks.</p>
          </article>

          <article className="feature-card">
            <div className="mini-label">Defensible</div>
            <h3>Narrow public wording</h3>
            <p>Cleaner product framing that stays in the utility lane.</p>
          </article>

          <article className="feature-card">
            <div className="mini-label">Modern</div>
            <h3>Sleek across desktop and mobile</h3>
            <p>Dark premium styling built around the Specterfy palette.</p>
          </article>
        </div>
      </section>

      <section className="section-shell pricing-preview">
        <div className="pricing-card">
          <div className="mini-label">Pricing</div>
          <h2 className="section-title">Simple entry. Clear upgrade path.</h2>

          <div className="pricing-inline">
            <div className="pricing-pill">
              <strong>Free</strong>
              <span>5 sanitizes/day</span>
            </div>
            <div className="pricing-pill">
              <strong>$14/mo</strong>
              <span>Unlimited</span>
            </div>
            <div className="pricing-pill">
              <strong>$97/yr</strong>
              <span>Unlimited</span>
            </div>
          </div>
        </div>
      </section>

      <div className="section-shell">
        <PublicFooter />
      </div>
    </main>
  );
}
