'use client'

import Link from 'next/link'
import PublicHeader from '../../components/PublicHeader'
import PublicFooter from '../../components/PublicFooter'

export default function DashboardPage() {
  return (
    <>
      <PublicHeader />

      <main className="page-wrap">
        <div className="container" style={{ paddingTop: '60px', paddingBottom: '100px' }}>

          {/* Top bar */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '48px',
            gap: '20px',
            flexWrap: 'wrap',
          }}>
            <div>
              <span className="label" style={{ marginBottom: '10px' }}>Dashboard</span>
              <h1 style={{
                fontFamily: 'var(--syne, sans-serif)',
                fontSize: 'clamp(32px, 4vw, 46px)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: 'var(--text-primary)',
                lineHeight: 1.05,
              }}>
                Operational view
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              <Link href="/sanitize" className="btn-primary">Open tool</Link>
              <Link href="/review" className="btn-secondary">Review file</Link>
            </div>
          </div>

          <div className="rule" style={{ marginBottom: '48px' }} />

          {/* Stats row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: 'var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '24px',
          }}>
            {[
              { label: 'Documents', value: '0', desc: 'Completed clean downloads' },
              { label: 'Pages', value: '0', desc: 'Pages processed' },
              { label: 'Redactions', value: '0', desc: 'Blackout boxes applied' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: 'var(--bg-card)',
                  padding: '28px 28px',
                }}
              >
                <div style={{
                  fontFamily: 'var(--syne, sans-serif)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--cyan)',
                  marginBottom: '12px',
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontFamily: 'var(--syne, sans-serif)',
                  fontSize: '40px',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                  marginBottom: '8px',
                }}>
                  {stat.value}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Witness tally */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '28px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--syne, sans-serif)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase' as const,
                color: 'var(--text-muted)',
                marginBottom: '8px',
              }}>
                Witness tally
              </div>
              <div style={{
                fontFamily: 'var(--syne, sans-serif)',
                fontSize: '28px',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: 'var(--text-primary)',
              }}>
                $0.00
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, maxWidth: '280px' }}>
              Simple $5 page estimate. Witness tally is a browser-side estimate only and carries no legal weight.
            </p>
          </div>

          {/* Status block */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '32px 28px',
          }}>
            <div style={{
              fontFamily: 'var(--syne, sans-serif)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase' as const,
              color: 'var(--text-muted)',
              marginBottom: '16px',
            }}>
              Status
            </div>
            <h2 style={{
              fontFamily: 'var(--syne, sans-serif)',
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '10px',
            }}>
              Current browser-side totals
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
              Last recorded activity: No completed downloads yet
            </p>
          </div>

        </div>
      </main>

      <PublicFooter />
    </>
  )
}
