"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardStats, getDefaultStats, readDashboardStats } from "@/lib/runtimeStore";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(getDefaultStats());

  useEffect(() => {
    const refreshStats = () => {
      setStats(readDashboardStats());
    };

    refreshStats();
    window.addEventListener("storage", refreshStats);
    window.addEventListener("focus", refreshStats);

    return () => {
      window.removeEventListener("storage", refreshStats);
      window.removeEventListener("focus", refreshStats);
    };
  }, []);

  const lastProcessedLabel = stats.lastProcessedAt
    ? new Date(stats.lastProcessedAt).toLocaleString()
    : "No completed downloads yet";

  return (
    <main className="site-shell">
      <section className="page-header">
        <div>
          <Link href="/" className="back-link">
            ← Back home
          </Link>
          <div className="eyebrow">OWNER VIEW</div>
          <h1 className="page-title">Dashboard</h1>
          <p className="muted">
            Simple shop-side browser totals for this MVP. Supabase analytics can
            replace this layer later.
          </p>
        </div>

        <div className="actions-wrap">
          <Link href="/sanitize" className="primary-btn small-btn">
            Open sanitize
          </Link>
          <Link href="/review" className="secondary-btn small-btn">
            Open review
          </Link>
          <Link href="/sign-in" className="secondary-btn small-btn">
            Owner sign in
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stats-card">
          <div className="small-label">DOCUMENTS</div>
          <div className="stat-value">{stats.totalDocuments}</div>
          <div className="stat-copy">Completed clean downloads recorded once per session</div>
        </article>
        <article className="stats-card">
          <div className="small-label">PAGES</div>
          <div className="stat-value">{stats.totalPages}</div>
          <div className="stat-copy">Pages processed through review</div>
        </article>
        <article className="stats-card">
          <div className="small-label">REDACTIONS</div>
          <div className="stat-value">{stats.totalRedactions}</div>
          <div className="stat-copy">Blackout boxes applied before clean export</div>
        </article>
        <article className="stats-card">
          <div className="small-label">WITNESS FEES FOUND</div>
          <div className="stat-value">${stats.totalWitnessFeesFound.toFixed(2)}</div>
          <div className="stat-copy">Simple $5 tally for the current MVP</div>
        </article>
      </section>

      <section className="panel">
        <div className="eyebrow">WHY THIS MATTERS</div>
        <h2 className="panel-title">A cleaner owner story</h2>
        <ul className="check-list">
          <li>Fast proof that the file moved through a privacy step</li>
          <li>Clear tally for the witnessing fee story</li>
          <li>Nothing overwhelming on the screen</li>
          <li>Built for a real desk workflow, not a demo fantasy</li>
        </ul>

        <div className="success-box">Last processed: {lastProcessedLabel}</div>
      </section>
    </main>
  );
}
