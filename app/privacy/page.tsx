import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";

export default function PrivacyPage() {
  return (
    <main className="sf-shell">
      <section className="sf-hero-wrap">
        <PublicHeader />
        <div className="sf-legal-card">
          <span className="sf-eyebrow">PRIVACY POLICY</span>
          <h1 className="sf-h2">Privacy-first product posture.</h1>
          <p className="sf-body">
            Specterfy is positioned as a privacy pre-processor utility. Public copy and account flow should stay narrow,
            accurate, and defensible.
          </p>
          <p className="sf-body">
            Final storage, retention, billing, and acceptance records will be governed by the connected SaaS stack as later phases are wired in.
          </p>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
