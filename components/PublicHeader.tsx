import Link from "next/link";

type PublicHeaderProps = {
  compact?: boolean;
};

export default function PublicHeader({ compact = false }: PublicHeaderProps) {
  return (
    <header className={`header ${compact ? "header-compact" : ""}`}>
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden="true">
          <span className="brand-mark-core" />
        </span>
        <span className="brand-copy">
          <span className="brand-kicker">Privacy Pre-Processor</span>
          <span className="brand-name">Specterfy</span>
        </span>
      </Link>

      <nav className="nav">
        <Link href="/pricing">Pricing</Link>
        <Link href="/sign-in">Log in</Link>
        <Link href="/signup" className="button button-primary button-small">
          Start free
        </Link>
      </nav>
    </header>
  );
}
