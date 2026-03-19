import Link from 'next/link'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'

export default function HomePage() {
  return (
    <>
      <PublicHeader />

      <main className="page-wrap">

        {/* ── HERO ─────────────────────────── */}
        <section className="hero-section">
          <div className="container">

            <div className="hero-pa-pill">
              <span className="hero-pa-dot" />
              <span className="hero-pa-text">
                Pennsylvania update
                <span className="hero-pa-date"> &nbsp;March 28, 2026</span>
              </span>
            </div>

            <div className="hero-headline-glow">
              <h1 className="hero-headline">
                Clean sensitive PDFs<br />
                before they become<br />
                a workflow liability.
              </h1>
            </div>

            <p className="hero-sub">
              A pre-ingestion privacy utility for Pennsylvania notaries.
              Sanitize. Review. Move clean.
            </p>

            <div className="hero-ctas">
              <Link href="/signup" className="btn-primary">Start free</Link>
              <Link href="/pricing" className="btn-secondary">View pricing</Link>
            </div>

            <div className="hero-pills">
              <span className="hero-pill">5 sanitizes/day free</span>
              <span className="hero-pill">$14/mo unlimited</span>
              <span className="hero-pill">$97/yr unlimited</span>
            </div>

          </div>
        </section>

        {/* ── WHAT IT IS ───────────────────── */}
        <section className="what-section">
          <div className="container">
            <div className="what-grid">

              <div>
                <p className="label" style={{ marginBottom: '28px' }}>What it is</p>
                <h2 className="what-statement">
                  Serious utility.<br />
                  Cleaner positioning.<br />
                  Lower visual friction.
                </h2>
              </div>

              <div>
                <div className="what-descriptors">
                  <div className="what-item">
                    <span className="what-num">01</span>
                    <span className="what-text">Privacy pre-processor</span>
                  </div>
                  <div className="what-item">
                    <span className="what-num">02</span>
                    <span className="what-text">Document sanitization utility</span>
                  </div>
                  <div className="what-item">
                    <span className="what-num">03</span>
                    <span className="what-text">Clean-copy generator</span>
                  </div>
                  <div className="what-item">
                    <span className="what-num">04</span>
                    <span className="what-text">Workflow helper</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── WHY IT MATTERS ───────────────── */}
        <section className="why-section">
          <div className="container">

            <div className="why-header">
              <p className="label" style={{ marginBottom: '16px' }}>Why it matters</p>
              <h2 className="why-headline">
                Less clutter.<br />
                Stronger first impression.
              </h2>
            </div>

            <div className="why-grid">
              <div className="why-item">
                <div className="why-num">01</div>
                <div className="why-title">Cleaner front-end handling</div>
                <p className="why-body">
                  Reduce exposure before documents move deeper into your workflow.
                </p>
              </div>
              <div className="why-item">
                <div className="why-num">02</div>
                <div className="why-title">Sharper public posture</div>
                <p className="why-body">
                  Utility-first framing instead of bloated platform language.
                </p>
              </div>
              <div className="why-item">
                <div className="why-num">03</div>
                <div className="why-title">Fast path to action</div>
                <p className="why-body">
                  Simple account flow, clear pricing, direct entry points.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── PRICING STRIP ────────────────── */}
        <section className="pricing-section">
          <div className="container">

            <div className="pricing-header">
              <p className="label" style={{ marginBottom: '16px' }}>Pricing</p>
              <h2 className="pricing-headline">Simple entry. Clean upgrade path.</h2>
              <p className="pricing-sub">
                Free access for testing. Clean paid paths for unlimited usage once the full account system is live.
              </p>
            </div>

            <div className="pricing-cards">
              <div className="pricing-card">
                <div className="pricing-badge">Starter</div>
                <div className="pricing-price">Free</div>
                <p className="pricing-desc">5 sanitizes per day. No card required.</p>
                <Link href="/signup" className="btn-secondary" style={{ marginTop: 'auto' }}>
                  Start free
                </Link>
              </div>

              <div className="pricing-card featured">
                <div className="pricing-badge">Monthly</div>
                <div className="pricing-price">
                  $14
                  <span className="pricing-per">/mo</span>
                </div>
                <p className="pricing-desc">Unlimited sanitization. Full access.</p>
                <Link href="/pricing" className="btn-primary btn-full" style={{ marginTop: 'auto' }}>
                  Choose monthly
                </Link>
              </div>

              <div className="pricing-card">
                <div className="pricing-badge">Yearly</div>
                <div className="pricing-price">
                  $97
                  <span className="pricing-per">/yr</span>
                </div>
                <p className="pricing-desc">Unlimited sanitization. Best value.</p>
                <Link href="/pricing" className="btn-secondary" style={{ marginTop: 'auto' }}>
                  Choose yearly
                </Link>
              </div>
            </div>

          </div>
        </section>

      </main>

      <PublicFooter />
    </>
  )
}
