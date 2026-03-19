import Link from 'next/link'

export default function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="logo-name">Specterfy</div>
          <p className="footer-tag">
            Privacy-first document sanitization utility for Pennsylvania notaries.
          </p>
        </div>

        <nav className="footer-links">
          <Link href="/pricing" className="footer-link">Pricing</Link>
          <Link href="/privacy" className="footer-link">Privacy</Link>
          <Link href="/terms" className="footer-link">Terms</Link>
          <Link href="/disclaimer" className="footer-link">Disclaimer</Link>
          <Link href="/sign-in" className="footer-link">Log in</Link>
        </nav>
      </div>
    </footer>
  )
}
