'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getReviewSession, clearReviewSession, addSessionToDashboard, ReviewSession } from '@/lib/runtimeStore'
import { supabase } from '@/lib/supabase'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'

export default function ReviewPage() {
  const router = useRouter()
  const [session, setSession] = useState<ReviewSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloaded, setDownloaded] = useState(false)

  useEffect(() => {
    if (!supabase) { router.push('/sign-in'); return }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/sign-in'); return }
      const s = getReviewSession()
      if (s) { setSession(s); addSessionToDashboard(s) }
      setLoading(false)
    })
  }, [router])

  function handleDownload() {
    if (!session?.cleanPdfBase64) return
    try {
      const binary = atob(session.cleanPdfBase64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = session.cleanFileName || 'clean-output.pdf'
      a.click(); URL.revokeObjectURL(url)
      setDownloaded(true)
    } catch { alert('Download failed. Please try regenerating.') }
  }

  function handleClear() { clearReviewSession(); setSession(null) }

  if (loading) return (
    <>
      <PublicHeader />
      <main className="page-wrap">
        <div className="container" style={{ paddingTop: '80px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
        </div>
      </main>
    </>
  )

  return (
    <>
      <PublicHeader />
      <main className="page-wrap">
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '100px' }}>
          <div className="back-nav">
            <Link href="/" className="btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              Home
            </Link>
            <span className="back-nav-divider" />
            <Link href="/sanitize" className="btn-ghost">Sanitize tool</Link>
            <span className="back-nav-divider" />
            <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
          </div>

          <span className="label" style={{ marginBottom: '20px', display: 'block' }}>Review</span>

          {!session ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '40px 36px', maxWidth: '680px' }}>
              <h1 style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--text-primary)', marginBottom: '12px' }}>
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
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '680px' }}>
              <div style={{ background: 'rgba(0,200,240,0.04)', border: '1px solid rgba(0,200,240,0.22)', borderRadius: '14px', padding: '28px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)', flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: 'var(--cyan)' }}>Clean output ready</span>
                </div>
                <h1 style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 700, letterSpacing: '-0.018em', color: 'var(--text-primary)' }}>
                  {session.cleanFileName}
                </h1>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)' }}>
                  {[
                    { label: 'Pages', value: session.pageCount },
                    { label: 'Redactions', value: session.redactionCount },
                    { label: 'Witness tally', value: `$${session.estimatedWitnessFeesFound.toFixed(2)}` },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--bg-card)', padding: '20px' }}>
                      <div style={{ fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--text-faint)', marginBottom: '8px' }}>{s.label}</div>
                      <div style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--text-faint)', marginBottom: '4px' }}>Original file</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{session.originalFileName}</div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-faint)', flexShrink: 0 }}>{new Date(session.createdAt).toLocaleString()}</div>
              </div>

              <div style={{ background: 'rgba(255,200,0,0.04)', border: '1px solid rgba(255,200,0,0.12)', borderRadius: '10px', padding: '14px 18px' }}>
                <p style={{ fontSize: '12.5px', color: 'rgba(255,220,100,0.7)', margin: 0, lineHeight: '1.65' }}>
                  Review this output carefully before downstream use. Specterfy is a pre-processing utility — not a compliance guarantee. You remain responsible for final review and handling.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button type="button" className="btn-primary" onClick={handleDownload} style={{ minWidth: '180px' }}>
                  {downloaded ? 'Downloaded ✓' : 'Download clean PDF'}
                </button>
                <Link href="/sanitize" className="btn-secondary">Process another</Link>
                <button type="button" onClick={handleClear}
                  style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px 14px', fontSize: '12px', color: 'var(--text-faint)', cursor: 'pointer', fontFamily: 'var(--dm-sans, sans-serif)', transition: 'color 0.15s' }}>
                  Clear session
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
