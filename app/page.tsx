import Link from "next/link";

export default function HomePage() {
  return (
    <main className="site-shell">
      <section className="landing-hero">
        <div className="top-nav">
          <div className="brand-lockup">
            <div className="brand-mark">N</div>
            <div>
              <div className="eyebrow">PA COMPLIANCE UTILITY</div>
              <div className="brand-name">NotaryTool</div>
            </div>
          </div>

          <div className="nav-links">
            <Link href="/sanitize" className="nav-link">
              Sanitize
            </Link>
            <Link href="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link href="/sign-in" className="nav-link nav-link-cta">
              Sign in
            </Link>
          </div>
        </div>

        <div className="hero-grid">
          <div>
            <div className="eyebrow">MARCH 28, 2026 DEADLINE</div>
            <h1 className="landing-title">
              Clean private data before it ever touches your notary workflow
            </h1>
            <p className="landing-copy">
              A fast, privacy-first pre-processor for Pennsylvania notaries.
              Redact sensitive content, generate a clean image-only PDF, and
              support the new $5 witnessing fee story without dragging staff into
              clunky enterprise software.
            </p>

            <div className="hero-actions">
              <Link href="/sanitize" className="primary-btn">
                Start sanitizing
              </Link>
              <Link href="/sign-in" className="secondary-btn">
                Owner sign in
              </Link>
            </div>

            <div className="pill-row">
              <span className="pill">Image-only clean PDF</span>
              <span className="pill">SHA-256 audit hash</span>
              <span className="pill">Counter-top fast</span>
              <span className="pill">Browser-side processing</span>
            </div>
          </div>

          <div className="deadline-card">
            <div className="eyebrow">WHY THIS CONVERTS</div>
            <div className="deadline-amount">$1,000</div>
            <div className="deadline-copy">
              Put the compliance risk in front of the owner, not just the clerk.
            </div>
            <ul className="check-list">
              <li>Simple upload to clean-file flow</li>
              <li>Cleaner operator experience for busy shops</li>
              <li>Built to support the new $5 witnessing revenue hook</li>
              <li>Designed to stay lean, fast, and usable</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="value-strip">
        <div className="value-card">
          <div className="eyebrow">UTILITY POSITIONING</div>
          <h2>Not a journal. Not a RON platform.</h2>
          <p>
            This tool processes documents before they enter other workflows. That
            is the wedge.
          </p>
        </div>
        <div className="value-card">
          <div className="eyebrow">COUNTER-TOP UX</div>
          <h2>Built for speed at the desk</h2>
          <p>
            Fast page preview, smoother drag selection, clear review, fast
            download.
          </p>
        </div>
        <div className="value-card">
          <div className="eyebrow">OWNER CTA</div>
          <h2>Show the fee story</h2>
          <p>
            Make the $5 witnessing opportunity visible so adoption feels like
            risk reduction plus revenue.
          </p>
        </div>
      </section>

      <section className="tool-grid">
        <article className="tool-card">
          <div className="card-label">LIVE TOOL</div>
          <h3>Sanitize</h3>
          <p>Upload a PDF, draw boxes, and create a clean image-only output.</p>
          <Link href="/sanitize" className="primary-btn small-btn">
            Open tool
          </Link>
        </article>

        <article className="tool-card">
          <div className="card-label">REVIEW</div>
          <h3>Review clean PDF</h3>
          <p>
            Confirm redactions, see the audit hash, and download the clean file.
          </p>
          <Link href="/review" className="secondary-btn small-btn">
            Open review
          </Link>
        </article>

        <article className="tool-card">
          <div className="card-label">OWNER VIEW</div>
          <h3>Dashboard</h3>
          <p>Track processed files and the simple witnessing fee tally.</p>
          <Link href="/dashboard" className="secondary-btn small-btn">
            Open dashboard
          </Link>
        </article>
      </section>
    </main>
  );
}
