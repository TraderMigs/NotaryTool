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

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }

function normalizeRect(x1: number, y1: number, x2: number, y2: number): NormalizedRect | null {
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  if (width < 0.008 || height < 0.008) return null;
  return { x: clamp01(x), y: clamp01(y), width: clamp01(width), height: clamp01(height) };
}

function getRectStyle(rect: NormalizedRect) {
  return { left: `${rect.x * 100}%`, top: `${rect.y * 100}%`, width: `${rect.width * 100}%`, height: `${rect.height * 100}%` };
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
  const containerRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const totalRedactions = useMemo(
    () => Object.values(pageRectsMap).reduce((sum, r) => sum + r.length, 0),
    [pageRectsMap]
  );
  const estimatedWitnessFees = useMemo(() => pageCount * 5, [pageCount]);
  const liveDraftRect = useMemo(() => buildDraftRect(pointerDraft), [pointerDraft]);

  async function getPdfJs(): Promise<PdfJsModule> {
    const lib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    if (!lib.GlobalWorkerOptions.workerSrc) {
      lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.mjs`;
    }
    return lib;
  }

  async function renderPreviewPages(selectedFile: File) {
    setBusy(true); setError(""); setProgress(8); setProgressLabel("Rendering pages");
    try {
      const buffer = await selectedFile.arrayBuffer();
      const lib = await getPdfJs();
      const pdf = await lib.getDocument({ data: buffer }).promise;
      const previews: PagePreview[] = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const vp = page.getViewport({ scale: 1.45 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable.");
        canvas.width = Math.ceil(vp.width);
        canvas.height = Math.ceil(vp.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        previews.push({ pageNumber: n, width: canvas.width, height: canvas.height, dataUrl: canvas.toDataURL("image/png") });
        setProgress(Math.round((n / pdf.numPages) * 42));
      }
      setPageCount(pdf.numPages);
      setPagePreviews(previews);
      setPageRectsMap({});
      setProgress(46);
      setProgressLabel("Ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to render PDF.");
      setPageCount(0); setPagePreviews([]); setPageRectsMap({});
    } finally {
      setBusy(false);
    }
  }

  function resetFileState() {
    setFile(null); setFileName(""); setFileSize(""); setPageCount(0);
    setPagePreviews([]); setPageRectsMap({}); setPointerDraft(null);
    setProgress(0); setProgressLabel("Waiting"); setError("");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { resetFileState(); setError("Upload a PDF file only."); return; }
    setFile(f); setFileName(f.name); setFileSize(`${(f.size / 1024 / 1024).toFixed(2)} MB`);
    await renderPreviewPages(f);
  }

  function getNormPtr(e: React.PointerEvent<HTMLDivElement>, pn: number) {
    const node = containerRefs.current[pn];
    if (!node) return null;
    const r = node.getBoundingClientRect();
    return { x: clamp01((e.clientX - r.left) / r.width), y: clamp01((e.clientY - r.top) / r.height) };
  }

  function handlePointerDown(pn: number, e: React.PointerEvent<HTMLDivElement>) {
    if (busy) return;
    const pt = getNormPtr(e, pn); if (!pt) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPointerDraft({ pageNumber: pn, originX: pt.x, originY: pt.y, currentX: pt.x, currentY: pt.y });
  }

  function handlePointerMove(pn: number, e: React.PointerEvent<HTMLDivElement>) {
    if (!pointerDraft || pointerDraft.pageNumber !== pn) return;
    const pt = getNormPtr(e, pn); if (!pt) return;
    setPointerDraft(c => c && c.pageNumber === pn ? { ...c, currentX: pt.x, currentY: pt.y } : c);
  }

  function handlePointerUp(pn: number, e: React.PointerEvent<HTMLDivElement>) {
    if (!pointerDraft || pointerDraft.pageNumber !== pn) return;
    const pt = getNormPtr(e, pn);
    e.currentTarget.releasePointerCapture(e.pointerId);
    const rect = normalizeRect(pointerDraft.originX, pointerDraft.originY, pt?.x ?? pointerDraft.currentX, pt?.y ?? pointerDraft.currentY);
    setPointerDraft(null);
    if (!rect) return;
    setPageRectsMap(c => ({ ...c, [pn]: [...(c[pn] ?? []), rect] }));
  }

  function clearPage(pn: number) {
    setPageRectsMap(c => { const n = { ...c }; delete n[pn]; return n; });
  }

  async function handleGenerate() {
    if (!file || pagePreviews.length === 0) return;
    setBusy(true); setError(""); setProgress(52); setProgressLabel("Generating clean PDF");
    try {
      const result = await sanitizePdfWithRasterization({
        file, pageRectsMap,
        onProgress: (pct, lbl) => { setProgress(pct); setProgressLabel(lbl); }
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate clean PDF.");
      setBusy(false);
    }
  }

  const canGenerate = !!file && !busy && pagePreviews.length > 0;

  return (
    <>
      <PublicHeader />

      <main className="page-wrap">
        <div className="container" style={{ paddingTop: "40px", paddingBottom: "80px" }}>

          {/* Back nav */}
          <div className="back-nav">
            <Link href="/" className="btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Home
            </Link>
            <span className="back-nav-divider" />
            <Link href="/review" className="btn-ghost">Review</Link>
            <span className="back-nav-divider" />
            <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
          </div>

          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <span className="label" style={{ marginBottom: "8px" }}>Sanitize</span>
              <h1 style={{ fontFamily: "var(--dm-sans, sans-serif)", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.022em", color: "var(--text-primary)", lineHeight: 1.06 }}>
                Prep a cleaner PDF
              </h1>
            </div>
          </div>

          <div className="rule" style={{ marginBottom: "28px" }} />

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "20px", alignItems: "start" }}>

            {/* Sidebar */}
            <aside style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "18px 16px" }}>
                <div style={{ fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "var(--cyan)", marginBottom: "12px" }}>Upload</div>
                <label style={{ display: "flex", flexDirection: "column", gap: "5px", border: "1px dashed var(--border-mid)", borderRadius: "8px", padding: "14px 12px", cursor: "pointer", background: "rgba(255,255,255,0.02)" }}>
                  <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: "none" }} />
                  <span style={{ fontFamily: "var(--dm-sans, sans-serif)", fontSize: "13px", fontWeight: 500, color: fileName ? "var(--text-primary)" : "var(--text-secondary)", wordBreak: "break-word" }}>
                    {fileName || "Choose PDF"}
                  </span>
                  <small style={{ fontSize: "11px", color: "var(--text-faint)" }}>{fileSize || "PDF only"}</small>
                </label>
              </div>

              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "18px 16px" }}>
                <div style={{ fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "var(--cyan)", marginBottom: "12px" }}>Live totals</div>
                {[
                  { val: pageCount, key: "Pages" },
                  { val: totalRedactions, key: "Redactions" },
                  { val: `$${estimatedWitnessFees.toFixed(2)}`, key: "Witness tally" },
                ].map((s, i, arr) => (
                  <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <span style={{ fontFamily: "var(--dm-sans, sans-serif)", fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.015em" }}>{s.val}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{s.key}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "18px 16px" }}>
                <div style={{ fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "var(--cyan)", marginBottom: "12px" }}>Progress</div>
                <div style={{ height: "3px", background: "var(--border)", borderRadius: "100px", overflow: "hidden", marginBottom: "10px" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "var(--cyan)", borderRadius: "100px", transition: "width 0.3s ease" }} />
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>{progressLabel}</p>
                {error && (
                  <div style={{ marginTop: "10px", background: "rgba(255,80,80,0.07)", border: "1px solid rgba(255,80,80,0.18)", borderRadius: "7px", padding: "10px 12px", fontSize: "12px", color: "#FF8080", lineHeight: "1.55" }}>
                    {error}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="btn-primary btn-full"
                disabled={!canGenerate}
                onClick={handleGenerate}
                style={{ opacity: canGenerate ? 1 : 0.38, cursor: canGenerate ? "pointer" : "not-allowed" }}
              >
                {busy ? "Processing…" : "Generate clean PDF"}
              </button>

            </aside>

            {/* Preview area */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {pagePreviews.length === 0 && (
                <div style={{ background: "var(--bg-card)", border: "1px dashed var(--border-mid)", borderRadius: "12px", padding: "56px 32px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)", fontSize: "14px", textAlign: "center", minHeight: "280px" }}>
                  Upload a PDF to render preview pages and draw blackout boxes.
                </div>
              )}

              {pagePreviews.map((page) => {
                const rects = pageRectsMap[page.pageNumber] ?? [];
                return (
                  <article key={page.pageNumber} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" as const }}>
                        Page {page.pageNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => clearPage(page.pageNumber)}
                        style={{ fontFamily: "var(--dm-sans, sans-serif)", fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", background: "none", border: "1px solid var(--border)", borderRadius: "5px", padding: "4px 10px", cursor: "pointer" }}
                      >
                        Clear page
                      </button>
                    </div>
                    <div
                      ref={(node) => { containerRefs.current[page.pageNumber] = node; }}
                      style={{ position: "relative", userSelect: "none", cursor: "crosshair", lineHeight: 0 }}
                      onPointerDown={(e) => handlePointerDown(page.pageNumber, e)}
                      onPointerMove={(e) => handlePointerMove(page.pageNumber, e)}
                      onPointerUp={(e) => handlePointerUp(page.pageNumber, e)}
                    >
                      <img src={page.dataUrl} alt={`Page ${page.pageNumber}`} style={{ width: "100%", display: "block", pointerEvents: "none" }} draggable={false} />
                      {rects.map((rect, idx) => (
                        <div key={`${page.pageNumber}-${idx}`} style={{ position: "absolute", background: "#000", opacity: 0.88, ...getRectStyle(rect) }} />
                      ))}
                      {pointerDraft?.pageNumber === page.pageNumber && liveDraftRect && (
                        <div style={{ position: "absolute", background: "rgba(0,200,240,0.22)", border: "1.5px solid var(--cyan)", ...getRectStyle(liveDraftRect) }} />
                      )}
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
