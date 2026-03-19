import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="footer-grid">
        <div>
          <div className="eyebrow">SPECTERFY</div>
          <p className="footer-copy">
            A privacy-first document sanitization utility for Pennsylvania notaries.
            This product is a workflow helper and pre-ingestion privacy step.
            It is not a notarization platform, not a journal, and not a government-approved provider.
          </p>
        </div>

        <div className="footer-links">
          <Link href="/pricing" className="text-link">Pricing</Link>
          <Link href="/terms" className="text-link">Terms</Link>
          <Link href="/privacy" className="text-link">Privacy</Link>
          <Link href="/disclaimer" className="text-link">Disclaimer</Link>
          <Link href="/login" className="text-link">Log in</Link>
          <Link href="/signup" className="text-link">Start free</Link>
        </div>
      </div>
    </footer>
  );
}
