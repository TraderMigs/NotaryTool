import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="sf-footer">
      <div className="sf-footer-top">
        <div className="sf-footer-copy-wrap">
          <div className="sf-eyebrow">SPECTERFY</div>
          <p className="sf-footer-copy">
            Privacy-first document sanitization utility for Pennsylvania notaries.
            This product is a workflow helper and pre-ingestion privacy step. It is
            not a journal, not a notarization platform, and not a government-approved provider.
          </p>
        </div>

        <div className="sf-footer-links">
          <Link href="/pricing" className="sf-text-link">Pricing</Link>
          <Link href="/privacy" className="sf-text-link">Privacy</Link>
          <Link href="/terms" className="sf-text-link">Terms</Link>
          <Link href="/disclaimer" className="sf-text-link">Disclaimer</Link>
          <Link href="/login" className="sf-text-link">Log in</Link>
        </div>
      </div>

      <div className="sf-footer-bottom">
        <span>Utility positioning only.</span>
        <span>User remains responsible for final review and downstream use.</span>
      </div>
    </footer>
  );
}
