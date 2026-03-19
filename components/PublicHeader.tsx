import Image from "next/image";
import Link from "next/link";

type PublicHeaderProps = {
  ctaHref?: string;
  ctaLabel?: string;
};

export default function PublicHeader({
  ctaHref = "/signup",
  ctaLabel = "Start free",
}: PublicHeaderProps) {
  return (
    <header className="sf-header">
      <Link href="/" className="sf-brand" aria-label="Specterfy home">
        <Image
          src="/specterfy-logo.png"
          alt="Specterfy logo"
          width={170}
          height={55}
          className="sf-brand-logo"
          priority
        />
        <div className="sf-brand-copy">
          <span className="sf-eyebrow">PRIVACY PRE-PROCESSOR</span>
          <span className="sf-brand-name">Specterfy</span>
        </div>
      </Link>

      <nav className="sf-nav">
        <Link href="/pricing" className="sf-nav-link">Pricing</Link>
        <Link href="/login" className="sf-nav-link">Log in</Link>
        <Link href={ctaHref} className="sf-btn sf-btn-primary sf-btn-sm">
          {ctaLabel}
        </Link>
      </nav>
    </header>
  );
}
