'use client'

import Link from 'next/link'
import PublicHeader from '../../components/PublicHeader'
import PublicFooter from '../../components/PublicFooter'

export default function ReviewPage() {
  return (
    <>
      <PublicHeader />
      <main className="page-wrap">
        <div className="container" style={{ paddingTop: '56px', paddingBottom: '100px' }}>
          <span className="label" style={{ marginBottom: '20px' }}>Review</span>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '48px 40px', maxWidth: '660px' }}>
            <h1 style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--text-primary)', marginBottom: '12px' }}>
              No active file loaded
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '28px', maxWidth: '420px' }}>
              Go to the sanitize tool first, upload a PDF, add blackout boxes, and generate a clean output.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link href="/sanitize" className="btn-primary">Go to sanitize</Link>
              <Link href="/dashboard" className="btn-secondary">Open dashboard</Link>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
