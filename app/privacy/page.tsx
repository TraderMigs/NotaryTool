import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";

export default function PrivacyPage() {
  return (
    <main className="site-shell">
      <section className="landing-hero">
        <PublicHeader />
        <div className="legal-wrap">
          <div className="eyebrow">PRIVACY POLICY</div>
          <h1 className="page-title">Privacy-first positioning</h1>
          <div className="legal-card">
            <p>
              The product is positioned as a privacy pre-processor utility.
              Public legal language should stay narrow, defensible, and accurate.
            </p>
            <p>
              Final storage, retention, auth records, billing events, and policy details
              will be wired in later phases as the real SaaS stack is connected.
            </p>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
