"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ReviewSession,
  addSessionToDashboard,
  clearReviewSession,
  getReviewSession,
  hasSessionBeenRecorded
} from "@/lib/runtimeStore";
import PublicHeader from "@/components/PublicHeader";

function base64ToBlob(base64: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: "application/pdf" });
}

export default function ReviewPage() {
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [alreadyRecorded, setAlreadyRecorded] = useState(false);

  useEffect(() => {
    const loaded = getReviewSession();
    setSession(loaded);

    if (!loaded?.cleanPdfBase64) return undefined;

    setAlreadyRecorded(hasSessionBeenRecorded(loaded.sessionId));
    const blob = base64ToBlob(loaded.cleanPdfBase64);
    const objectUrl = URL.createObjectURL(blob);
    setPdfUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
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
    const newlyRecorded = addSessionToDashboard(session);
    setAlreadyRecorded(!newlyRecorded);
    setDownloaded(true);
  }

  function handleClear() {
    clearReviewSession();
    setSession(null);
    setPdfUrl("");
    setConfirmed(false);
    setDownloaded(false);
    setAlreadyRecorded(false);
  }

  if (!session || !pdfUrl) {
    return (
      <main className="shell">
        <section className="tool-shell">
          <PublicHeader compact />
          <div className="tool-card wide-card">
            <span className="eyebrow">Review</span>
            <h1 className="tool-title">No active file loaded</h1>
            <p className="hero-support hero-support-legal">
              Go to the sanitize tool first, upload a PDF, add blackout boxes, and
              generate a clean output.
            </p>
            <div className="hero-actions">
              <Link href="/sanitize" className="button button-primary">Go to sanitize</Link>
              <Link href="/dashboard" className="button button-secondary">Open dashboard</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="tool-shell">
        <PublicHeader compact />

        <div className="tool-topbar">
          <div>
            <span className="eyebrow">Review</span>
            <h1 className="tool-title">Confirm and export</h1>
          </div>

          <div className="hero-actions">
            <Link href="/sanitize" className="button button-secondary">Back to sanitize</Link>
          </div>
        </div>

        <section className="review-layout">
          <div className="viewer-panel">
            <iframe title="Clean PDF preview" src={pdfUrl} className="viewer-frame" />
          </div>

          <aside className="review-side">
            <div className="tool-card">
              <span className="micro-label">Output</span>
              <strong>{session.cleanFileName}</strong>
              <p>Created {createdAtLabel}</p>
            </div>
            <div className="tool-card">
              <span className="micro-label">Summary</span>
              <p>{session.pageCount} pages</p>
              <p>{session.redactionCount} redactions</p>
              <p>${session.estimatedWitnessFeesFound.toFixed(2)} witness estimate</p>
            </div>
            <label className="check-row">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              <span>I reviewed the clean copy and I am ready to export it.</span>
            </label>
            <button
              type="button"
              className="button button-primary button-block"
              onClick={handleDownload}
              disabled={!confirmed}
            >
              Download clean PDF
            </button>
            <button
              type="button"
              className="button button-secondary button-block"
              onClick={handleClear}
            >
              Clear session
            </button>
            {downloaded ? <div className="inline-note success-note">Download started.</div> : null}
            {alreadyRecorded ? <div className="inline-note">Dashboard already counted this session.</div> : null}
          </aside>
        </section>
      </section>
    </main>
  );
}
