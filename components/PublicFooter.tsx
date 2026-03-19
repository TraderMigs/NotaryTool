import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-title">Specterfy</div>
          <p className="footer-copy">
            Privacy-first document sanitization utility for Pennsylvania notaries.
          </p>
        </div>

        <nav className="footer-links">
          <Link href="/pricing">Pricing</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/disclaimer">Disclaimer</Link>
          <Link href="/login">Log in</Link>
        </nav>
      </div>

      <div className="footer-bottom">
        <span>Built for a cleaner pre-ingestion workflow.</span>
        <span>User remains responsible for final review and downstream use.</span>
      </div>
    </footer>
  );
}
