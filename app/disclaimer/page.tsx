import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";

export default function DisclaimerPage() {
  return (
    <main className="sf-shell">
      <section className="sf-hero-wrap">
        <PublicHeader />
        <div className="sf-legal-card">
          <span className="sf-eyebrow">DISCLAIMER</span>
          <h1 className="sf-h2">Narrow claims only.</h1>
          <p className="sf-body">
            Specterfy does not provide legal advice, notarial acts, identity verification, or compliance guarantees.
          </p>
          <p className="sf-body">
            Users are responsible for final review, suitability, and downstream use of any output.
          </p>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
