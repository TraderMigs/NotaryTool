import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";

export default function PricingPage() {
  return (
    <main className="site-shell">
      <section className="landing-hero">
        <PublicHeader />
        <div className="page-stack">
          <div className="eyebrow">PRICING</div>
          <h1 className="page-title">Simple plans that match the real product direction</h1>
          <p className="muted">
            Free users get limited daily usage. Paid users will unlock unlimited access
            after Stripe verification in the next phase.
          </p>
        </div>
      </section>

      <section className="tool-grid">
        <article className="tool-card">
          <div className="card-label">FREE</div>
          <h3>Starter</h3>
          <p>5 sanitizes per day</p>
          <Link href="/signup" className="primary-btn small-btn">Start free</Link>
        </article>

        <article className="tool-card">
          <div className="card-label">MONTHLY</div>
          <h3>$14/month</h3>
          <p>Unlimited sanitization after verified payment.</p>
          <Link href="/signup?plan=monthly" className="secondary-btn small-btn">Choose monthly</Link>
        </article>

        <article className="tool-card">
          <div className="card-label">YEARLY</div>
          <h3>$97/year</h3>
          <p>Unlimited sanitization after verified payment.</p>
          <Link href="/signup?plan=yearly" className="secondary-btn small-btn">Choose yearly</Link>
        </article>
      </section>

      <PublicFooter />
    </main>
  );
}
