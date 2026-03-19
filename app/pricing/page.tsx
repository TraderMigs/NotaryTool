import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";

export default function PricingPage() {
  return (
    <main className="shell">
      <section className="hero-panel hero-panel-legal">
        <PublicHeader compact />
        <div className="pricing-page-head">
          <span className="eyebrow">Pricing</span>
          <h1 className="legal-title">Clear plans. No noise.</h1>
          <p className="hero-support hero-support-legal">
            Free access for testing. Clean paid paths for unlimited usage once the
            full account system is wired.
          </p>
        </div>

        <div className="plan-grid">
          <article className="plan-card">
            <span className="micro-label">Starter</span>
            <h2>Free</h2>
            <p>5 sanitizes per day</p>
            <Link href="/signup" className="button button-secondary button-block">
              Start free
            </Link>
          </article>

          <article className="plan-card plan-card-featured">
            <span className="micro-label">Monthly</span>
            <h2>$14</h2>
            <p>Unlimited sanitization</p>
            <Link href="/signup" className="button button-primary button-block">
              Choose monthly
            </Link>
          </article>

          <article className="plan-card">
            <span className="micro-label">Yearly</span>
            <h2>$97</h2>
            <p>Unlimited sanitization</p>
            <Link href="/signup" className="button button-secondary button-block">
              Choose yearly
            </Link>
          </article>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
