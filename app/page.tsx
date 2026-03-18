import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero-card">
        <div className="eyebrow">PA COMPLIANCE UTILITY</div>
        <h1 className="hero-title">
          Privacy pre-processor for Pennsylvania notaries
        </h1>
        <p className="hero-copy">
          This is a utility, not a journal, not a RON platform, and not a
          state-approved e-notary system. It strips private data before a
          document moves into any other workflow.
        </p>

        <div className="pill-row">
          <span className="pill">Phase 2 live</span>
          <span className="pill">Client-side processing</span>
          <span className="pill">Image-only clean PDF</span>
          <span className="pill">SHA-256 hash</span>
        </div>

        <div className="alert-strip">
          March 28, 2026 matters. The hook is simple: reduce privacy risk and
          support the new $5 witnessing fee workflow.
        </div>
      </section>

      <section className="grid-3">
        <article className="feature-card">
          <div className="card-label">PHASE 2</div>
          <h2>Sanitize</h2>
          <p>
            Upload a PDF, draw redaction boxes, and generate a clean image-only
            PDF that removes the original selectable text layer.
          </p>
          <Link href="/sanitize" className="card-link">
            Open
          </Link>
        </article>

        <article className="feature-card">
          <div className="card-label">PHASE 2</div>
          <h2>Review</h2>
          <p>
            Review the clean output, confirm duty of care, and download the
            sanitized document with its SHA-256 audit hash.
          </p>
          <Link href="/review" className="card-link">
            Open
          </Link>
        </article>

        <article className="feature-card">
          <div className="card-label">PHASE 2</div>
          <h2>Dashboard</h2>
          <p>
            Track documents processed, daily activity, and the simple witness
            fee opportunity tally for the shop.
          </p>
          <Link href="/dashboard" className="card-link">
            Open
          </Link>
        </article>
      </section>
    </main>
  );
}
