import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";

const plans = [
  {
    name: "Starter",
    price: "Free",
    note: "5 sanitizes per day",
    cta: "Start free",
    href: "/signup?plan=free",
  },
  {
    name: "Monthly",
    price: "$14/mo",
    note: "Unlimited sanitization access",
    cta: "Choose monthly",
    href: "/signup?plan=monthly",
    featured: true,
  },
  {
    name: "Yearly",
    price: "$97/yr",
    note: "Unlimited sanitization access",
    cta: "Choose yearly",
    href: "/signup?plan=yearly",
  },
];

export default function PricingPage() {
  return (
    <main className="sf-shell">
      <section className="sf-hero-wrap">
        <PublicHeader />
        <div className="sf-section-head">
          <span className="sf-eyebrow">PRICING</span>
          <h1 className="sf-h2">Simple plans. Clear limits. No messy presentation.</h1>
          <p className="sf-body">
            Start free, then upgrade when you want unlimited workflow usage.
          </p>
        </div>

        <div className="sf-card-grid">
          {plans.map((plan) => (
            <article className={`sf-card ${plan.featured ? "sf-card-featured" : ""}`} key={plan.name}>
              <span className="sf-card-kicker">{plan.name.toUpperCase()}</span>
              <h2 className="sf-price">{plan.price}</h2>
              <p className="sf-body">{plan.note}</p>
              <Link href={plan.href} className={`sf-btn ${plan.featured ? "sf-btn-primary" : "sf-btn-secondary"}`}>
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
