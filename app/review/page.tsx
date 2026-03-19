"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ReviewSession,
  addSessionToDashboard,
  clearReviewSession,
  getReviewSession
} from "@/lib/runtimeStore";

function base64ToBlob(base64: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: "application/pdf" });
}

export default function ReviewPage() {
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [recorded, setRecorded] = useState(false);

  useEffect(() => {
    const loaded = getReviewSession();
    setSession(loaded);

    if (loaded?.cleanPdfBase64) {
      const blob = base64ToBlob(loaded.cleanPdfBase64);
      const objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    return undefined;
  }, []);

  const createdAtLabel = useMemo(() => {
    if (!session?.createdAt) return "—";
    return new Date(session.createdAt).toLocaleString();
  }, [session]);

  function handleDownload() {
    if (!session || !confirmed || !pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = session.cleanFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (!recorded) {
      addSessionToDashboard(session);
      setRecorded(true);
    }

    setDownloaded(true);
  }

  function handleClear() {
    clearReviewSession();
    setSession(null);
    setPdfUrl("");
    setConfirmed(false);
    setDownloaded(false);
    setRecorded(false);
  }

  if (!session || !pdfUrl) {
    return (
      <main className="site-shell">
        <section className="page-header">
          <div>
            <Link href="/" className="back-link">
              ← Back home
            </Link>
            <div className="eyebrow">REVIEW STEP</div>
            <h1 className="page-title">Review clean PDF</h1>
            <p className="muted">
              There is no active sanitized file loaded in browser storage right now.
            </p>
          </div>
        </section>

        <section className="panel">
          <div className="warning-box">
            Go to the Sanitize page first, upload a PDF, add redaction boxes, and
            generate a clean output.
          </div>

          <div className="actions-wrap">
            <Link href="/sanitize" className="primary-btn small-btn">
              Go to sanitize
            </Link>
            <Link href="/dashboard" className="secondary-btn small-btn">
              Open dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="site-shell">
      <section className="page-header">
        <div>
          <Link href="/" className="back-link">
            ← Back home
          </Link>
          <div className="eyebrow">REVIEW STEP</div>
          <h1 className="page-title">Review clean PDF</h1>
          <p className="muted">
            Confirm the output, then download the sanitized PDF.
          </p>
        </div>

        <div className="actions-wrap">
          <Link href="/sanitize" className="secondary-btn small-btn">
            Back to sanitize
          </Link>
          <Link href="/dashboard" className="secondary-btn small-btn">
            Open dashboard
          </Link>
        </div>
      </section>

      <section className="review-grid">
        <div className="panel">
          <div className="eyebrow">PREVIEW</div>
          <h2 className="panel-title">Clean PDF preview</h2>
          <iframe title="Clean PDF preview" className="review-frame" src={pdfUrl} />
        </div>

        <div className="panel">
          <div className="eyebrow">AUDIT SUMMARY</div>
          <h2 className="panel-title">Ready for owner review</h2>

          <div className="info-grid compact-grid">
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

          <ul className="check-list">
            <li>Session persisted in browser storage so route change does not kill it</li>
            <li>Output is rebuilt from rasterized page images</li>
            <li>Original selectable text layer is not preserved</li>
            <li>Review timestamp: {createdAtLabel}</li>
            <li>
              Estimated witnessing revenue opportunity: $
              {session.estimatedWitnessFeesFound.toFixed(2)}
            </li>
          </ul>

          <div className="hash-box">{session.hash}</div>

          <label className="check-row">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            <span className="list-text">
              I reviewed the output and confirm the visible redactions are correct.
            </span>
          </label>

          <div className="actions-wrap">
            <button
              type="button"
              className="primary-btn small-btn"
              disabled={!confirmed}
              onClick={handleDownload}
            >
              Download clean PDF
            </button>
            <button type="button" className="secondary-btn small-btn" onClick={handleClear}>
              Clear review session
            </button>
          </div>

          {!confirmed ? (
            <div className="warning-box">
              Confirm the checkbox before downloading.
            </div>
          ) : null}

          {downloaded ? (
            <div className="success-box">
              Clean PDF downloaded. Dashboard totals updated in browser storage.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
