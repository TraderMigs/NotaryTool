import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";

export default function TermsPage() {
  return (
    <main className="site-shell">
      <section className="landing-hero">
        <PublicHeader />
        <div className="legal-wrap">
          <div className="eyebrow">TERMS OF SERVICE</div>
          <h1 className="page-title">Use the utility responsibly</h1>
          <div className="legal-card">
            <p>
              Specterfy is a document sanitization utility and workflow helper.
              It is not a journal, not a RON platform, not a legal decision engine,
              and not a government-approved notarization provider.
            </p>
            <p>
              You remain responsible for review, legal use, document handling,
              and compliance decisions. The tool does not guarantee compliance,
              admissibility, accuracy, or outcome.
            </p>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
