import Link from 'next/link'
import type { Metadata } from 'next'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
}

export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <main className="page-wrap">
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '120px', textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>

          <div style={{
            fontFamily: 'var(--dm-sans, sans-serif)',
            fontSize: '96px',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'var(--text-faint)',
            lineHeight: 1,
            marginBottom: '24px',
          }}>
            404
          </div>

          <h1 style={{
            fontFamily: 'var(--dm-sans, sans-serif)',
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 700,
            letterSpacing: '-0.022em',
            color: 'var(--text-primary)',
            marginBottom: '14px',
          }}>
            Page not found
          </h1>

          <p style={{
            fontSize: '15px',
            color: 'var(--text-muted)',
            lineHeight: '1.7',
            marginBottom: '36px',
            maxWidth: '340px',
            margin: '0 auto 36px',
          }}>
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn-primary">Back to home</Link>
            <Link href="/sanitize" className="btn-secondary">Open tool</Link>
          </div>

        </div>
      </main>
      <PublicFooter />
    </>
  )
}
