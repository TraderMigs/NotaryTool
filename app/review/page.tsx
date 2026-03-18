"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  clearReviewSession,
  getReviewSession,
  ReviewSession
} from "@/lib/runtimeStore";

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

function writeStats(stats: DashboardStats) {
  window.localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(stats));
}

function addSessionToStats(session: ReviewSession) {
  const current = readStats();

  const next: DashboardStats = {
    totalDocuments: current.totalDocuments + 1,
    totalPages: current.totalPages + session.pageCount,
    totalRedactions: current.totalRedactions + session.redactionCount,
    totalWitnessFeesFound:
      current.totalWitnessFeesFound + session.estimatedWitnessFeesFound,
    lastProcessedAt: new Date().toISOString()
  };

  writeStats(next);
}

export default function ReviewPage() {
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [recorded, setRecorded] = useState(false);

  useEffect(() => {
    const loaded = getReviewSession();
    setSession(loaded);
  }, []);

  const createdAtLabel = useMemo(() => {
    if (!session?.createdAt) {
      return "—";
    }

    return new Date(session.createdAt).toLocaleString();
  }, [session]);

  function handleDownload() {
    if (!session || !confirmed) {
      return;
    }

    const link = document.createElement("a");
    link.href = session.cleanPdfDataUrl;
    link.download = session.cleanFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (!recorded) {
      addSessionToStats(session);
      setRecorded(true);
    }

    setDownloaded(true);
  }

  function handleClear() {
    clearReviewSession();
    setSession(null);
    setConfirmed(false);
    setDownloaded(false);
    setRecorded(false);
  }

  if (!session) {
    return (
      <main className="shell">
        <div className="top-bar">
          <div>
            <Link href="/" className="back-link">
              ← Back home
            </Link>
            <h1 className="page-title">Review clean PDF</h1>
            <p className="muted">
              There is no active sanitized file loaded right now.
            </p>
          </div>
        </div>

        <section className="panel">
          <div className="warning-box">
            Go to the Sanitize page first, upload a PDF, add redaction boxes,
            and generate a clean output.
          </div>

          <div className="actions-row" style={{ marginTop: 16 }}>
            <Link href="/sanitize" className="primary-btn">
              Go to sanitize
            </Link>

            <Link href="/dashboard" className="secondary-btn">
              Open dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <div className="top-bar">
        <div>
          <Link href="/" className="back-link">
            ← Back home
          </Link>
          <h1 className="page-title">Review clean PDF</h1>
          <p className="muted">
            Review the output, confirm responsibility, then download the
            sanitized PDF.
          </p>
        </div>

        <div className="actions-wrap">
          <Link href="/sanitize" className="secondary-btn">
            Back to sanitize
          </Link>

          <Link href="/dashboard" className="secondary-btn">
            Open dashboard
          </Link>
        </div>
      </div>

      <section className="review-grid">
        <div className="panel">
          <h2>Clean PDF preview</h2>
          <iframe
            title="Clean PDF preview"
            className="review-frame"
            src={session.cleanPdfDataUrl}
          />
        </div>

        <div className="panel">
          <h2>Audit summary</h2>

          <div
            className="info-grid"
            style={{ gridTemplateColumns: "1fr 1fr", marginTop: 18 }}
          >
            <div className="info-card">
              <div className="small-label">ORIGINAL</div>
              <div className="kv-strong">{session.originalFileName}</div>
            </div>

            <div className="info-card">
              <div className="small-label">CLEAN FILE</div>
              <div className="kv-strong">{session.cleanFileName}</div>
            </div>

            <div className="info-card">
              <div className="small-label">PAGES</div>
              <div className="kv-strong">{session.pageCount}</div>
            </div>

            <div className="info-card">
              <div className="small-label">REDACTIONS</div>
              <div className="kv-strong">{session.redactionCount}</div>
            </div>
          </div>

          <div className="divider" />

          <ul className="meta-list">
            <li>Processed in browser memory only during this phase</li>
            <li>Output PDF is rebuilt from rasterized page images</li>
            <li>Original text layer is not preserved in the clean PDF</li>
            <li>Review timestamp: {createdAtLabel}</li>
            <li>
              Estimated witnessing revenue opportunity: $
              {session.estimatedWitnessFeesFound.toFixed(2)}
            </li>
          </ul>

          <div className="hash-box">{session.hash}</div>

          <div className="check-row">
            <input
              id="confirm-redaction"
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />

            <label htmlFor="confirm-redaction" className="list-text">
              I reviewed the output and confirm the visible redactions are
              correct. I understand this utility does not replace my legal duty
              to verify what is being removed before using the clean PDF.
            </label>
          </div>

          <div className="actions-row">
            <button
              type="button"
              className="primary-btn"
              disabled={!confirmed}
              onClick={handleDownload}
            >
              Download clean PDF
            </button>

            <button
              type="button"
              className="danger-btn"
              onClick={handleClear}
            >
              Clear review session
            </button>
          </div>

          {!confirmed ? (
            <div className="warning-box">
              You must check the confirmation box before download is enabled.
            </div>
          ) : null}

          {downloaded ? (
            <div className="success-box">
              Clean PDF downloaded. Dashboard stats were updated in this browser.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
