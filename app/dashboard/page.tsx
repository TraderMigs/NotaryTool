"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardStats, getDefaultStats, readDashboardStats } from "@/lib/runtimeStore";
import PublicHeader from "@/components/PublicHeader";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(getDefaultStats());

  useEffect(() => {
    const refreshStats = () => setStats(readDashboardStats());
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
    <main className="shell">
      <section className="tool-shell">
        <PublicHeader compact />

        <div className="tool-topbar">
          <div>
            <span className="eyebrow">Dashboard</span>
            <h1 className="tool-title">Operational view</h1>
          </div>

          <div className="hero-actions">
            <Link href="/sanitize" className="button button-primary">Open tool</Link>
            <Link href="/review" className="button button-secondary">Review file</Link>
          </div>
        </div>

        <section className="stat-grid">
          <article className="stat-panel">
            <span className="micro-label">Documents</span>
            <strong>{stats.totalDocuments}</strong>
            <p>Completed clean downloads</p>
          </article>
          <article className="stat-panel">
            <span className="micro-label">Pages</span>
            <strong>{stats.totalPages}</strong>
            <p>Pages processed</p>
          </article>
          <article className="stat-panel">
            <span className="micro-label">Redactions</span>
            <strong>{stats.totalRedactions}</strong>
            <p>Blackout boxes applied</p>
          </article>
          <article className="stat-panel stat-panel-glow">
            <span className="micro-label">Witness tally</span>
            <strong>${stats.totalWitnessFeesFound.toFixed(2)}</strong>
            <p>Simple $5 page estimate</p>
          </article>
        </section>

        <section className="tool-card wide-card">
          <span className="eyebrow">Status</span>
          <h2 className="aside-title">Current browser-side totals</h2>
          <p className="hero-support hero-support-legal">
            Last recorded activity: {lastProcessedLabel}
          </p>
        </section>
      </section>
    </main>
  );
}
