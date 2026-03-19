import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Specterfy home">
        <span className="brand-mark" aria-hidden="true">
          <span className="brand-mark-core" />
        </span>
        <span className="brand-copy">
          <span className="brand-kicker">Privacy Pre-Processor</span>
          <span className="brand-name">Specterfy</span>
        </span>
      </Link>

      <nav className="site-nav">
        <Link href="/pricing" className="nav-link">Pricing</Link>
        <Link href="/login" className="nav-link">Log in</Link>
        <Link href="/signup" className="button button-primary nav-cta">Start free</Link>
      </nav>
    </header>
  );
}
