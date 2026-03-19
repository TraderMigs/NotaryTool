import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";

export default function TermsPage() {
  return (
    <main className="sf-shell">
      <section className="sf-hero-wrap">
        <PublicHeader />
        <div className="sf-legal-card">
          <span className="sf-eyebrow">TERMS OF SERVICE</span>
          <h1 className="sf-h2">Use the utility responsibly.</h1>
          <p className="sf-body">
            Specterfy is a document sanitization utility and workflow helper. It is not a journal,
            not a RON platform, not a legal decision engine, and not a government-approved provider.
          </p>
          <p className="sf-body">
            Users remain responsible for document review, legal use, workflow handling, and downstream decisions.
            The tool does not guarantee compliance, admissibility, or outcome.
          </p>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
