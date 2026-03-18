import Link from 'next/link';
import React from 'react';

type NavCardProps = {
  title: string;
  description: string;
  href: string;
};

export default function NavCard({ title, description, href }: NavCardProps) {
  return (
    <Link href={href} className="card navCard">
      <div>
        <p className="eyebrow">Phase 1</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <span className="linkText">Open</span>
    </Link>
  );
}
