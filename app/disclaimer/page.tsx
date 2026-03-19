import PublicFooter from "../../components/PublicFooter";
import PublicHeader from "../../components/PublicHeader";

export default function DisclaimerPage() {
  return (
    <main className="page-shell">
      <section className="section-shell">
        <div className="panel legal-panel">
          <PublicHeader />
          <div className="legal-wrap">
            <div className="eyebrow">Disclaimer</div>
            <h1 className="section-title">No overclaims</h1>

<p className="page-text">No compliance guarantee. No legal guarantee. No outcome guarantee. Final review, suitability, and downstream use remain with the user.</p>

          </div>
        </div>
      </section>

      <div className="section-shell">
        <PublicFooter />
      </div>
    </main>
  );
}
