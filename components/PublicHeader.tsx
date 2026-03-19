import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="public-header">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true">S</div>
        <div>
          <div className="eyebrow">PRIVACY PRE-PROCESSOR</div>
          <div className="brand-name">Specterfy</div>
        </div>
      </div>

      <nav className="nav-links">
        <Link href="/pricing" className="nav-link">Pricing</Link>
        <Link href="/login" className="nav-link">Log in</Link>
        <Link href="/signup" className="nav-link nav-link-cta">Start free</Link>
      </nav>
    </header>
  );
}
