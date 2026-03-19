import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";

export default function DisclaimerPage() {
  return (
    <main className="site-shell">
      <section className="landing-hero">
        <PublicHeader />
        <div className="legal-wrap">
          <div className="eyebrow">DISCLAIMER</div>
          <h1 className="page-title">Narrow claims only</h1>
          <div className="legal-card">
            <p>
              Specterfy does not provide legal advice, notarial acts, identity verification,
              compliance guarantees, forensic guarantees, or state approval.
            </p>
            <p>
              Users are responsible for final review, suitability, and downstream use of any output.
            </p>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
