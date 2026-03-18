"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardStats = {
  totalDocuments: number;
  totalPages: number;
  totalRedactions: number;
  totalWitnessFeesFound: number;
  lastProcessedAt: string | null;
};

const DASHBOARD_STORAGE_KEY = "notary-tool-dashboard-stats-v1";

function getDefaultStats(): DashboardStats {
  return {
    totalDocuments: 0,
    totalPages: 0,
    totalRedactions: 0,
    totalWitnessFeesFound: 0,
    lastProcessedAt: null
  };
}

function readStats(): DashboardStats {
  if (typeof window === "undefined") {
    return getDefaultStats();
  }

  const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY);
  if (!raw) {
    return getDefaultStats();
  }

  try {
    return JSON.parse(raw) as DashboardStats;
  } catch {
    return getDefaultStats();
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(getDefaultStats());

  useEffect(() => {
    setStats(readStats());
  }, []);

  const lastProcessedLabel = stats.lastProcessedAt
    ? new Date(stats.lastProcessedAt).toLocaleString()
    : "No completed downloads yet";

  return (
    <main className="shell">
      <div className="top-bar">
        <div>
          <Link href="/" className="back-link">
            ← Back home
          </Link>
          <h1 className="page-title">Dashboard</h1>
          <p className="muted">
            This phase tracks simple local browser totals only. Supabase-backed
            shop analytics comes next.
          </p>
        </div>

        <div className="actions-wrap">
          <Link href="/sanitize" className="primary-btn">
            Open sanitize
          </Link>
          <Link href="/review" className="secondary-btn">
            Open review
          </Link>
        </div>
      </div>

      <section className="stats-grid">
        <article className="stats-card">
          <div className="small-label">DOCUMENTS</div>
          <div className="stat-value">{stats.totalDocuments}</div>
          <div className="stat-copy">Completed clean downloads on this browser</div>
        </article>

        <article className="stats-card">
          <div className="small-label">PAGES PROCESSED</div>
          <div className="stat-value">{stats.totalPages}</div>
          <div className="stat-copy">Total pages that passed through review</div>
        </article>

        <article className="stats-card">
          <div className="small-label">REDACTION BOXES</div>
          <div className="stat-value">{stats.totalRedactions}</div>
          <div className="stat-copy">Visual blackouts applied before clean export</div>
        </article>

        <article className="stats-card">
          <div className="small-label">WITNESS FEES FOUND</div>
          <div className="stat-value">${stats.totalWitnessFeesFound.toFixed(2)}</div>
          <div className="stat-copy">Simple $5-per-page tally for this MVP phase</div>
        </article>
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <h2>What this phase proves</h2>
        <ul className="meta-list">
          <li>The upload and review workflow works in the browser</li>
          <li>The output PDF is rebuilt as a new image-only document</li>
          <li>The hash is generated for audit reference</li>
          <li>The counter-top operator gets a fast path from upload to clean file</li>
          <li>The fee story is visible now, even before full shop analytics</li>
        </ul>

        <div className="success-box">
          Last processed: {lastProcessedLabel}
        </div>
      </section>
    </main>
  );
}
