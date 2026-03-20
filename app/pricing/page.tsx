import Link from 'next/link'
import type { Metadata } from 'next'
import PublicHeader from '../../components/PublicHeader'
import PublicFooter from '../../components/PublicFooter'

export const metadata: Metadata = {
  title: 'Pricing — Specterfy',
  description: 'Simple pricing for Pennsylvania notaries. 5 free sanitizes per day, or unlimited for $9.97/mo.',
}

export default function PricingPage() {
  return (
    <>
      <PublicHeader />
      <main className="page-wrap">
        <div className="container">

          <div className="pricing-page-hero">
            <p className="label">Pricing</p>
            <h1 style={{
              fontFamily: 'var(--dm-sans, sans-serif)',
              fontSize: 'clamp(34px, 5vw, 58px)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              marginTop: '14px',
              marginBottom: '14px',
              lineHeight: 1.06,
            }}>
              Simple pricing.<br />No surprises.
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '380px', lineHeight: '1.65' }}>
              Start with 5 free sanitizes per day. Upgrade to unlimited whenever your volume needs it.
            </p>
          </div>

          <div className="rule" />

          <div style={{ padding: '56px 0' }}>
            <div className="pricing-cards">

              <div className="pricing-card">
                <div className="pricing-badge">Starter</div>
                <div className="pricing-price">Free</div>
                <p className="pricing-desc">5 sanitizes per day. No payment required.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', margin: '4px 0 8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>5 sanitizes/day</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Account access</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No card required</span>
                </div>
                <Link href="/signup" className="btn-secondary btn-full" style={{ marginTop: 'auto' }}>
                  Start free
                </Link>
              </div>

              <div className="pricing-card featured">
                <div className="pricing-badge">Monthly</div>
                <div className="pricing-price">$9.97<span className="pricing-per">/mo</span></div>
                <p className="pricing-desc">Unlimited sanitization. No daily cap.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', margin: '4px 0 8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--cyan-dim)' }}>Unlimited sanitizes</span>
                  <span style={{ fontSize: '13px', color: 'var(--cyan-dim)' }}>Full account access</span>
                  <span style={{ fontSize: '13px', color: 'var(--cyan-dim)' }}>Cancel anytime</span>
                </div>
                <Link href="/signup?plan=monthly" className="btn-primary btn-full" style={{ marginTop: 'auto' }}>
                  Choose monthly
                </Link>
              </div>

              <div className="pricing-card">
                <div className="pricing-badge">Yearly</div>
                <div className="pricing-price">$89<span className="pricing-per">/yr</span></div>
                <p className="pricing-desc">Unlimited sanitization. Equivalent to $7.42/mo.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', margin: '4px 0 8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Unlimited sanitizes</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Full account access</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Best value — save 26%</span>
                </div>
                <Link href="/signup?plan=yearly" className="btn-secondary btn-full" style={{ marginTop: 'auto' }}>
                  Choose yearly
                </Link>
              </div>

            </div>

            <p style={{ marginTop: '28px', textAlign: 'center', fontSize: '13px', color: 'var(--text-faint)' }}>
              Billing activates only after payment is confirmed.
              You remain responsible for reviewing all outputs before downstream use.
            </p>
          </div>

          <div className="rule" />

          <div style={{ padding: '48px 0', maxWidth: '540px' }}>
            <p className="label" style={{ marginBottom: '12px' }}>Important</p>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.75' }}>
              Specterfy is a privacy pre-processing utility. It is not a notary platform,
              journal, or compliance guarantee. Users remain responsible for reviewing all outputs
              and ensuring downstream handling meets applicable obligations.
            </p>
          </div>

        </div>
      </main>
      <PublicFooter />
    </>
  )
}
