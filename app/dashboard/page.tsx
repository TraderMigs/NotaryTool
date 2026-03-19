'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { readDashboardStats, DashboardStats, getDefaultStats } from '@/lib/runtimeStore'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(getDefaultStats())

  useEffect(() => {
    setStats(readDashboardStats())
  }, [])

  return (
    <>
      <PublicHeader />
      <main className="page-wrap">
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '100px' }}>

          {/* Back nav */}
          <div className="back-nav">
            <Link href="/" className="btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Home
            </Link>
            <span className="back-nav-divider" />
            <Link href="/sanitize" className="btn-ghost">Sanitize tool</Link>
            <span className="back-nav-divider" />
            <Link href="/review" className="btn-ghost">Review</Link>
          </div>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <span className="label" style={{ marginBottom: '10px' }}>Dashboard</span>
              <h1 style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--text-primary)', lineHeight: 1.06 }}>
                Operational view
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              <Link href="/sanitize" className="btn-primary">Open tool</Link>
              <Link href="/review" className="btn-secondary">Review file</Link>
            </div>
          </div>

          <div className="rule" style={{ marginBottom: '32px' }} />

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
            {[
              { label: 'Documents', value: stats.totalDocuments, desc: 'Completed clean downloads' },
              { label: 'Pages', value: stats.totalPages, desc: 'Pages processed' },
              { label: 'Redactions', value: stats.totalRedactions, desc: 'Blackout boxes applied' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'var(--bg-card)', padding: '26px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: 'var(--cyan)', marginBottom: '10px' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '36px', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '6px' }}>{s.value}</div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Witness tally */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '26px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: '8px' }}>Witness tally</div>
              <div style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                ${stats.totalWitnessFeesFound.toFixed(2)}
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, maxWidth: '280px' }}>
              Simple $5/page estimate. Browser-side only. Carries no legal weight.
            </p>
          </div>

          {/* Status block */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px 26px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: '14px' }}>Status</div>
            <h2 style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, letterSpacing: '-0.018em', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Current browser-side totals
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
              {stats.lastProcessedAt
                ? `Last activity: ${new Date(stats.lastProcessedAt).toLocaleString()}`
                : 'Last recorded activity: No completed downloads yet'}
            </p>
          </div>

        </div>
      </main>
      <PublicFooter />
    </>
  )
}
