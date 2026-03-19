import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="footer">
      <div>
        <div className="footer-brand">Specterfy</div>
        <p className="footer-copy">
          Privacy-first document sanitization utility for Pennsylvania notaries.
        </p>
      </div>

      <div className="footer-links">
        <Link href="/pricing">Pricing</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/disclaimer">Disclaimer</Link>
        <Link href="/sign-in">Log in</Link>
      </div>
    </footer>
  );
}
