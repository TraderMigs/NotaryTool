import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";

const valuePoints = [
  {
    title: "Pre-ingestion privacy step",
    body: "Sanitize sensitive PDFs before they move into later notary handling workflows.",
  },
  {
    title: "Narrow, safer positioning",
    body: "Utility tool. Not a journal, not a RON platform, not a compliance guarantee engine.",
  },
  {
    title: "Built for fast operator flow",
    body: "Simple account access, clear pricing, and a serious SaaS presentation that feels trustworthy.",
  },
];

const trustPoints = [
  "Privacy pre-processor",
  "Document sanitization utility",
  "Clean-copy generator",
  "Workflow helper",
];

export default function HomePage() {
  return (
    <main className="sf-shell">
      <section className="sf-hero-wrap">
        <PublicHeader />

        <div className="sf-hero-grid">
          <div className="sf-hero-copy">
            <span className="sf-eyebrow">PA NOTARY PRIVACY PRE-PROCESSOR</span>
            <h1 className="sf-h1">
              Clean sensitive PDFs before they become a workflow liability.
            </h1>
            <p className="sf-lead">
              Specterfy is a privacy-first pre-processing utility designed to help create
              cleaner copies before documents move into downstream notary handling.
              It stays in the utility lane, not the platform lane.
            </p>

            <div className="sf-actions">
              <Link href="/signup" className="sf-btn sf-btn-primary">
                Start free
              </Link>
              <Link href="/pricing" className="sf-btn sf-btn-secondary">
                View pricing
              </Link>
            </div>

            <div className="sf-pills">
              <span className="sf-pill">5 sanitizes/day free</span>
              <span className="sf-pill">$14 monthly unlimited</span>
              <span className="sf-pill">$97 yearly unlimited</span>
            </div>
          </div>

          <div className="sf-hero-panel">
            <div className="sf-panel-glow" />
            <div className="sf-panel-card">
              <div className="sf-panel-top">
                <span className="sf-chip">WHAT IT IS</span>
                <span className="sf-status-dot" />
              </div>
              <h2 className="sf-h2">A serious privacy utility, not a toy workflow.</h2>
              <p className="sf-body">
                Specterfy is built to feel modern, sharp, and trusted while keeping claims tight and defensible.
              </p>

              <ul className="sf-list">
                {trustPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="sf-section">
        <div className="sf-section-head">
          <span className="sf-eyebrow">WHY IT MATTERS</span>
          <h2 className="sf-h2">Designed for a cleaner, more controlled front end to document handling.</h2>
        </div>

        <div className="sf-card-grid">
          {valuePoints.map((point) => (
            <article className="sf-card" key={point.title}>
              <span className="sf-card-kicker">SPECTERFY</span>
              <h3 className="sf-h3">{point.title}</h3>
              <p className="sf-body">{point.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sf-section">
        <div className="sf-banner">
          <div>
            <span className="sf-eyebrow">POSITIONING</span>
            <h2 className="sf-h2">Utility-first wording. Safer public posture.</h2>
            <p className="sf-body">
              Keep claims narrow. Keep responsibility clear. Keep the product in the workflow-helper category.
            </p>
          </div>
          <div className="sf-banner-actions">
            <Link href="/signup" className="sf-btn sf-btn-primary">Create account</Link>
            <Link href="/privacy" className="sf-btn sf-btn-secondary">Read privacy</Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
