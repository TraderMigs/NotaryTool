import NavCard from '@/components/NavCard';

const cards = [
  {
    title: 'Sanitize',
    description: 'Phase 2 home for the upload box, redaction flow, and clean PDF output.',
    href: '/sanitize',
  },
  {
    title: 'Review',
    description: 'Phase 2 home for the human confirmation step that transfers duty of care.',
    href: '/review',
  },
  {
    title: 'Dashboard',
    description: 'Phase 3 home for the $5 witnessing fee tracker and daily revenue tally.',
    href: '/dashboard',
  },
];

export default function HomePage() {
  return (
    <main>
      <div className="shell stack">
        <section className="hero">
          <div className="stack">
            <p className="eyebrow">PA Compliance Utility</p>
            <h1>Privacy pre-processor for Pennsylvania notaries</h1>
            <p className="subtext">
              This shell is the clean Phase 1 starting point. It is not a journal, not a RON platform,
              and not a state-approved e-notary system. It is the front door for a document sanitizer that
              strips private data before the document enters any other workflow.
            </p>
          </div>
          <div className="badgeRow">
            <span className="badge">Next.js 14 App Router</span>
            <span className="badge">Supabase connected by env</span>
            <span className="badge">Vercel-ready</span>
            <span className="badge">Zero-budget starter</span>
          </div>
          <div className="notice">
            March 28, 2026 matters. The hook is simple: avoid compliance pain and capture the new $5 witnessing fee.
          </div>
        </section>

        <section className="grid cols3">
          {cards.map((card) => (
            <NavCard key={card.href} {...card} />
          ))}
        </section>
      </div>
    </main>
  );
}
