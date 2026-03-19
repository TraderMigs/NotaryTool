"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  NormalizedRect,
  PageRectsMap,
  sanitizePdfWithRasterization
} from "@/lib/pdfSanitizer";
import { createSessionId, saveReviewSession } from "@/lib/runtimeStore";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

type PagePreview = {
  pageNumber: number;
  width: number;
  height: number;
  dataUrl: string;
};

type PointerDraft = {
  pageNumber: number;
  originX: number;
  originY: number;
  currentX: number;
  currentY: number;
} | null;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function normalizeRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): NormalizedRect | null {
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  if (width < 0.008 || height < 0.008) return null;
  return {
    x: clamp01(x),
    y: clamp01(y),
    width: clamp01(width),
    height: clamp01(height)
  };
}

function getRectStyle(rect: NormalizedRect) {
  return {
    left: `${rect.x * 100}%`,
    top: `${rect.y * 100}%`,
    width: `${rect.width * 100}%`,
    height: `${rect.height * 100}%`
  };
}

function buildDraftRect(draft: PointerDraft): NormalizedRect | null {
  if (!draft) return null;
  return normalizeRect(draft.originX, draft.originY, draft.currentX, draft.currentY);
}

export default function SanitizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
  const [pageRectsMap, setPageRectsMap] = useState<PageRectsMap>({});
  const [pointerDraft, setPointerDraft] = useState<PointerDraft>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Waiting");
  const [error, setError] = useState("");
  const [drawingLabel, setDrawingLabel] = useState("");
  const containerRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const totalRedactions = useMemo(
    () => Object.values(pageRectsMap).reduce((sum, rects) => sum + rects.length, 0),
    [pageRectsMap]
  );

  const estimatedWitnessFees = useMemo(() => pageCount * 5, [pageCount]);
  const liveDraftRect = useMemo(() => buildDraftRect(pointerDraft), [pointerDraft]);

  async function getPdfJs(): Promise<PdfJsModule> {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    }
    return pdfjsLib;
  }

  async function renderPreviewPages(selectedFile: File) {
    setBusy(true);
    setError("");
    setProgress(8);
    setProgressLabel("Rendering pages");
    try {
      const buffer = await selectedFile.arrayBuffer();
      const pdfjsLib = await getPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const previews: PagePreview[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.45 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas context unavailable.");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: context, viewport }).promise;
        previews.push({
          pageNumber,
          width: canvas.width,
          height: canvas.height,
          dataUrl: canvas.toDataURL("image/png")
        });
        setProgress(Math.round((pageNumber / pdf.numPages) * 42));
      }
      setPageCount(pdf.numPages);
      setPagePreviews(previews);
      setPageRectsMap({});
      setProgress(46);
      setProgressLabel("Ready");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to render PDF.");
      setPageCount(0);
      setPagePreviews([]);
      setPageRectsMap({});
    } finally {
      setBusy(false);
    }
  }

  function resetFileState() {
    setFile(null);
    setFileName("");
    setFileSize("");
    setPageCount(0);
    setPagePreviews([]);
    setPageRectsMap({});
    setPointerDraft(null);
    setProgress(0);
    setProgressLabel("Waiting");
    setDrawingLabel("");
    setError("");
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf") {
      resetFileState();
      setError("Upload a PDF file only.");
      return;
    }
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(`${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`);
    await renderPreviewPages(selectedFile);
  }

  function getNormalizedPointer(
    event: React.PointerEvent<HTMLDivElement>,
    pageNumber: number
  ) {
    const node = containerRefs.current[pageNumber];
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    return {
      x: clamp01((event.clientX - rect.left) / rect.width),
      y: clamp01((event.clientY - rect.top) / rect.height)
    };
  }

  function handlePointerDown(pageNumber: number, event: React.PointerEvent<HTMLDivElement>) {
    if (busy) return;
    const point = getNormalizedPointer(event, pageNumber);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPointerDraft({
      pageNumber,
      originX: point.x,
      originY: point.y,
      currentX: point.x,
      currentY: point.y
    });
  }

  function handlePointerMove(pageNumber: number, event: React.PointerEvent<HTMLDivElement>) {
    if (!pointerDraft || pointerDraft.pageNumber !== pageNumber) return;
    const point = getNormalizedPointer(event, pageNumber);
    if (!point) return;
    setPointerDraft((current) =>
      current && current.pageNumber === pageNumber
        ? { ...current, currentX: point.x, currentY: point.y }
        : current
    );
  }

  function handlePointerUp(pageNumber: number, event: React.PointerEvent<HTMLDivElement>) {
    if (!pointerDraft || pointerDraft.pageNumber !== pageNumber) return;
    const point = getNormalizedPointer(event, pageNumber);
    event.currentTarget.releasePointerCapture(event.pointerId);
    const finalRect = normalizeRect(
      pointerDraft.originX,
      pointerDraft.originY,
      point?.x ?? pointerDraft.currentX,
      point?.y ?? pointerDraft.currentY
    );
    setPointerDraft(null);
    if (!finalRect) return;
    setPageRectsMap((current) => ({
      ...current,
      [pageNumber]: [...(current[pageNumber] ?? []), finalRect]
    }));
  }

  function clearPage(pageNumber: number) {
    setPageRectsMap((current) => {
      const next = { ...current };
      delete next[pageNumber];
      return next;
    });
  }

  async function handleGenerateCleanPdf() {
    if (!file || pagePreviews.length === 0) return;
    setBusy(true);
    setError("");
    setProgress(52);
    setProgressLabel("Generating clean PDF");
    try {
      const result = await sanitizePdfWithRasterization({
        file,
        pageRectsMap,
        onProgress: (percent, label) => {
          setProgress(percent);
          setProgressLabel(label);
        }
      });
      saveReviewSession({
        sessionId: createSessionId(),
        originalFileName: file.name,
        cleanFileName: result.cleanFileName,
        hash: result.hash,
        pageCount: result.pageCount,
        redactionCount: result.redactionCount,
        createdAt: new Date().toISOString(),
        estimatedWitnessFeesFound: result.pageCount * 5,
        cleanPdfBase64: result.base64
      });
      window.location.href = "/review";
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to generate clean PDF.");
      setBusy(false);
    }
  }

  /* ─── Styles ────────────────────────────── */

  const sideCardStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "20px 18px",
  };

  const microLabelStyle: React.CSSProperties = {
    fontFamily: "var(--syne, sans-serif)",
    fontSize: "9.5px",
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "var(--cyan)",
    display: "block",
    marginBottom: "14px",
  };

  const statRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid var(--border)",
  };

  const statValStyle: React.CSSProperties = {
    fontFamily: "var(--syne, sans-serif)",
    fontSize: "18px",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  };

  const statKeyStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "var(--text-muted)",
  };

  return (
    <>
      <PublicHeader />

      <main className="page-wrap">
        <div className="container" style={{ paddingTop: "44px", paddingBottom: "80px" }}>

          {/* ── Top bar ────────────────────── */}
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "32px",
            gap: "16px",
            flexWrap: "wrap",
          }}>
            <div>
              <span className="label" style={{ marginBottom: "8px" }}>Sanitize</span>
              <h1 style={{
                fontFamily: "var(--syne, sans-serif)",
                fontSize: "clamp(26px, 3.5vw, 38px)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                color: "var(--text-primary)",
                lineHeight: 1.05,
              }}>
                Prep a cleaner PDF
              </h1>
            </div>
            <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
              <Link href="/review" className="btn-secondary">Review</Link>
              <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
            </div>
          </div>

          <div className="rule" style={{ marginBottom: "32px" }} />

          {/* ── Two-column layout ──────────── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "24px",
            alignItems: "start",
          }}>

            {/* ── Sidebar ──────────────────── */}
            <aside style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Upload */}
              <div style={sideCardStyle}>
                <span style={microLabelStyle}>Upload</span>
                <label style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  border: "1px dashed var(--border-mid)",
                  borderRadius: "8px",
                  padding: "16px 14px",
                  cursor: "pointer",
                  transition: "border-color 0.18s",
                  background: "rgba(255,255,255,0.02)",
                }}>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <span style={{
                    fontFamily: "var(--syne, sans-serif)",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: fileName ? "var(--text-primary)" : "var(--text-secondary)",
                    wordBreak: "break-word",
                  }}>
                    {fileName || "Choose PDF"}
                  </span>
                  <small style={{ fontSize: "11px", color: "var(--text-faint)" }}>
                    {fileSize || "PDF only"}
                  </small>
                </label>
              </div>

              {/* Live totals */}
              <div style={sideCardStyle}>
                <span style={microLabelStyle}>Live totals</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  <div style={statRowStyle}>
                    <span style={statValStyle}>{pageCount}</span>
                    <span style={statKeyStyle}>Pages</span>
                  </div>
                  <div style={statRowStyle}>
                    <span style={statValStyle}>{totalRedactions}</span>
                    <span style={statKeyStyle}>Redactions</span>
                  </div>
                  <div style={{ ...statRowStyle, borderBottom: "none" }}>
                    <span style={statValStyle}>${estimatedWitnessFees.toFixed(2)}</span>
                    <span style={statKeyStyle}>Witness tally</span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div style={sideCardStyle}>
                <span style={microLabelStyle}>Progress</span>
                <div style={{
                  height: "3px",
                  background: "var(--border)",
                  borderRadius: "100px",
                  overflow: "hidden",
                  marginBottom: "10px",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "var(--cyan)",
                    borderRadius: "100px",
                    transition: "width 0.3s ease",
                  }} />
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                  {progressLabel}
                </p>
                {drawingLabel ? (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    {drawingLabel}
                  </p>
                ) : null}
                {error ? (
                  <div style={{
                    marginTop: "10px",
                    background: "rgba(255,80,80,0.08)",
                    border: "1px solid rgba(255,80,80,0.2)",
                    borderRadius: "7px",
                    padding: "10px 12px",
                    fontSize: "12px",
                    color: "#FF8080",
                    lineHeight: "1.55",
                  }}>
                    {error}
                  </div>
                ) : null}
              </div>

              {/* Generate button */}
              <button
                type="button"
                className="btn-primary btn-full"
                disabled={!file || busy || pagePreviews.length === 0}
                onClick={handleGenerateCleanPdf}
                style={{
                  opacity: (!file || busy || pagePreviews.length === 0) ? 0.4 : 1,
                  cursor: (!file || busy || pagePreviews.length === 0) ? "not-allowed" : "pointer",
                }}
              >
                {busy ? "Processing..." : "Generate clean PDF"}
              </button>

            </aside>

            {/* ── Preview area ─────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {pagePreviews.length === 0 ? (
                <div style={{
                  background: "var(--bg-card)",
                  border: "1px dashed var(--border-mid)",
                  borderRadius: "12px",
                  padding: "60px 40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-faint)",
                  fontSize: "14px",
                  textAlign: "center",
                  minHeight: "300px",
                }}>
                  Upload a PDF to render preview pages and draw blackout boxes.
                </div>
              ) : null}

              {pagePreviews.map((page) => {
                const pageRects = pageRectsMap[page.pageNumber] ?? [];
                return (
                  <article
                    key={page.pageNumber}
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Page meta bar */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)",
                    }}>
                      <span style={{
                        fontFamily: "var(--syne, sans-serif)",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                      }}>
                        Page {page.pageNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => clearPage(page.pageNumber)}
                        style={{
                          fontFamily: "var(--syne, sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                          background: "none",
                          border: "1px solid var(--border)",
                          borderRadius: "5px",
                          padding: "4px 10px",
                          cursor: "pointer",
                          transition: "color 0.15s, border-color 0.15s",
                        }}
                      >
                        Clear page
                      </button>
                    </div>

                    {/* Canvas stage */}
                    <div
                      ref={(node) => { containerRefs.current[page.pageNumber] = node; }}
                      style={{
                        position: "relative",
                        userSelect: "none",
                        cursor: "crosshair",
                        display: "block",
                        lineHeight: 0,
                      }}
                      onPointerDown={(event) => handlePointerDown(page.pageNumber, event)}
                      onPointerMove={(event) => handlePointerMove(page.pageNumber, event)}
                      onPointerUp={(event) => handlePointerUp(page.pageNumber, event)}
                    >
                      <img
                        src={page.dataUrl}
                        alt={`Page ${page.pageNumber}`}
                        style={{ width: "100%", display: "block", pointerEvents: "none" }}
                        draggable={false}
                      />

                      {pageRects.map((rect, index) => (
                        <div
                          key={`${page.pageNumber}-${index}`}
                          style={{
                            position: "absolute",
                            background: "#000",
                            opacity: 0.85,
                            ...getRectStyle(rect),
                          }}
                        />
                      ))}

                      {pointerDraft?.pageNumber === page.pageNumber && liveDraftRect ? (
                        <div
                          style={{
                            position: "absolute",
                            background: "rgba(0, 212, 255, 0.25)",
                            border: "1.5px solid var(--cyan)",
                            ...getRectStyle(liveDraftRect),
                          }}
                        />
                      ) : null}
                    </div>
                  </article>
                );
              })}

            </div>
          </div>

        </div>
      </main>

      <PublicFooter />
    </>
  );
}
