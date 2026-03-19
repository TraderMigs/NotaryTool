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

  return (
    <main className="shell">
      <section className="tool-shell">
        <PublicHeader compact />

        <div className="tool-topbar">
          <div>
            <span className="eyebrow">Sanitize</span>
            <h1 className="tool-title">Prep a cleaner PDF</h1>
          </div>

          <div className="hero-actions">
            <Link href="/review" className="button button-secondary">Review</Link>
            <Link href="/dashboard" className="button button-secondary">Dashboard</Link>
          </div>
        </div>

        <section className="tool-layout">
          <aside className="tool-side">
            <div className="tool-card">
              <span className="micro-label">Upload</span>
              <label className="upload-drop">
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                <span>{fileName || "Choose PDF"}</span>
                <small>{fileSize || "PDF only"}</small>
              </label>
            </div>

            <div className="tool-card">
              <span className="micro-label">Live totals</span>
              <div className="side-stat"><strong>{pageCount}</strong><span>Pages</span></div>
              <div className="side-stat"><strong>{totalRedactions}</strong><span>Redactions</span></div>
              <div className="side-stat"><strong>${estimatedWitnessFees.toFixed(2)}</strong><span>Witness tally</span></div>
            </div>

            <div className="tool-card">
              <span className="micro-label">Progress</span>
              <div className="progress-bar"><span style={{ width: `${progress}%` }} /></div>
              <p>{progressLabel}</p>
              {drawingLabel ? <p>{drawingLabel}</p> : null}
              {error ? <div className="inline-note error-note">{error}</div> : null}
            </div>

            <button
              type="button"
              className="button button-primary button-block"
              disabled={!file || busy || pagePreviews.length === 0}
              onClick={handleGenerateCleanPdf}
            >
              Generate clean PDF
            </button>
          </aside>

          <div className="preview-stack">
            {pagePreviews.length === 0 ? (
              <div className="empty-preview">
                Upload a PDF to render preview pages and draw blackout boxes.
              </div>
            ) : null}

            {pagePreviews.map((page) => {
              const pageRects = pageRectsMap[page.pageNumber] ?? [];
              return (
                <article key={page.pageNumber} className="preview-card">
                  <div className="preview-meta">
                    <span>Page {page.pageNumber}</span>
                    <button type="button" onClick={() => clearPage(page.pageNumber)}>
                      Clear page
                    </button>
                  </div>

                  <div
                    ref={(node) => {
                      containerRefs.current[page.pageNumber] = node;
                    }}
                    className="canvas-stage canvas-stage-tool"
                    onPointerDown={(event) => handlePointerDown(page.pageNumber, event)}
                    onPointerMove={(event) => handlePointerMove(page.pageNumber, event)}
                    onPointerUp={(event) => handlePointerUp(page.pageNumber, event)}
                  >
                    <img
                      src={page.dataUrl}
                      alt={`Page ${page.pageNumber}`}
                      className="page-preview-image"
                    />

                    {pageRects.map((rect, index) => (
                      <div
                        key={`${page.pageNumber}-${index}`}
                        className="redaction-box"
                        style={getRectStyle(rect)}
                      />
                    ))}

                    {pointerDraft?.pageNumber === page.pageNumber && liveDraftRect ? (
                      <div className="redaction-draft" style={getRectStyle(liveDraftRect)} />
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
