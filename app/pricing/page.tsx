import PublicFooter from "../../components/PublicFooter";
import PublicHeader from "../../components/PublicHeader";

export default function PricingPage() {
  return (
    <main className="page-shell">
      <section className="section-shell">
        <div className="panel legal-panel">
          <PublicHeader />
          <div className="legal-wrap">
            <div className="eyebrow">Pricing</div>
            <h1 className="section-title">Simple plans</h1>

<div className="pricing-inline spacious">
  <div className="pricing-pill"><strong>Free</strong><span>5 sanitizes/day</span></div>
  <div className="pricing-pill"><strong>$14/mo</strong><span>Unlimited</span></div>
  <div className="pricing-pill"><strong>$97/yr</strong><span>Unlimited</span></div>
</div>
<p className="page-text">Paid checkout and entitlement verification are part of the next build phase.</p>

          </div>
        </div>
      </section>

      <div className="section-shell">
        <PublicFooter />
      </div>
    </main>
  );
}
