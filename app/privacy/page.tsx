import PublicFooter from "../../components/PublicFooter";
import PublicHeader from "../../components/PublicHeader";

export default function PrivacyPage() {
  return (
    <main className="page-shell">
      <section className="section-shell">
        <div className="panel legal-panel">
          <PublicHeader />
          <div className="legal-wrap">
            <div className="eyebrow">Privacy</div>
            <h1 className="section-title">Privacy-first posture</h1>

<p className="page-text">Specterfy is positioned as a privacy pre-processor utility. Keep claims narrow, keep handling clear, and keep users responsible for final review and downstream use.</p>

          </div>
        </div>
      </section>

      <div className="section-shell">
        <PublicFooter />
      </div>
    </main>
  );
}
