import PublicFooter from "../../components/PublicFooter";
import PublicHeader from "../../components/PublicHeader";

export default function TermsPage() {
  return (
    <main className="page-shell">
      <section className="section-shell">
        <div className="panel legal-panel">
          <PublicHeader />
          <div className="legal-wrap">
            <div className="eyebrow">Terms</div>
            <h1 className="section-title">Use the utility responsibly</h1>

<p className="page-text">Specterfy is not a journal, not a RON platform, not a legal decision engine, and not a government-approved provider. It is a workflow utility used before later handling stages.</p>

          </div>
        </div>
      </section>

      <div className="section-shell">
        <PublicFooter />
      </div>
    </main>
  );
}
