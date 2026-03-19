"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  NormalizedRect,
  PageRectsMap,
  sanitizePdfWithRasterization
} from "@/lib/pdfSanitizer";
import { createSessionId, saveReviewSession } from "@/lib/runtimeStore";

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

  const totalRedactions = useMemo(() => {
    return Object.values(pageRectsMap).reduce((sum, rects) => sum + rects.length, 0);
  }, [pageRectsMap]);

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
    setProgress(5);
    setProgressLabel("Loading preview");

    try {
      const pdfjsLib = await getPdfJs();
      const bytes = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const previews: PagePreview[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.15 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Preview canvas could not be created.");
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport
        }).promise;

        previews.push({
          pageNumber,
          width: viewport.width,
          height: viewport.height,
          dataUrl: canvas.toDataURL("image/jpeg", 0.92)
        });

        setProgress(Math.round((pageNumber / pdf.numPages) * 85) + 5);
        setProgressLabel(`Preview page ${pageNumber} of ${pdf.numPages}`);
      }

      setPageCount(pdf.numPages);
      setPagePreviews(previews);
      setPageRectsMap({});
      setPointerDraft(null);
      setDrawingLabel("");
      setProgress(100);
      setProgressLabel("Preview ready");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "The PDF could not be loaded.";
      setError(message);
      setProgress(0);
      setProgressLabel("Failed");
    } finally {
      setBusy(false);
    }
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    setError("");

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF only.");
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(`${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`);
    void renderPreviewPages(selectedFile);
  }

  function getPointerPosition(pageNumber: number, clientX: number, clientY: number) {
    const container = containerRefs.current[pageNumber];
    if (!container) return null;

    const rect = container.getBoundingClientRect();

    return {
      x: clamp01((clientX - rect.left) / rect.width),
      y: clamp01((clientY - rect.top) / rect.height)
    };
  }

  function handlePointerDown(pageNumber: number, event: React.PointerEvent<HTMLDivElement>) {
    const point = getPointerPosition(pageNumber, event.clientX, event.clientY);
    if (!point) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    setPointerDraft({
      pageNumber,
      originX: point.x,
      originY: point.y,
      currentX: point.x,
      currentY: point.y
    });

    setDrawingLabel("Drawing redaction box...");
  }

  function handlePointerMove(pageNumber: number, event: React.PointerEvent<HTMLDivElement>) {
    setPointerDraft((current) => {
      if (!current || current.pageNumber !== pageNumber) return current;

      const point = getPointerPosition(pageNumber, event.clientX, event.clientY);
      if (!point) return current;

      const width = Math.abs(point.x - current.originX);
      const height = Math.abs(point.y - current.originY);
      setDrawingLabel(`Drawing ${(width * 100).toFixed(1)}% × ${(height * 100).toFixed(1)}%`);

      return {
        ...current,
        currentX: point.x,
        currentY: point.y
      };
    });
  }

  function finishPointer(pageNumber: number) {
    setPointerDraft((current) => {
      if (!current || current.pageNumber !== pageNumber) return current;

      const finalRect = normalizeRect(
        current.originX,
        current.originY,
        current.currentX,
        current.currentY
      );

      if (finalRect) {
        setPageRectsMap((existing) => ({
          ...existing,
          [pageNumber]: [...(existing[pageNumber] ?? []), finalRect]
        }));
      }

      setDrawingLabel("");
      return null;
    });
  }

  function removeLastRect(pageNumber: number) {
    setPageRectsMap((current) => {
      const existing = current[pageNumber] ?? [];
      if (existing.length === 0) return current;

      return {
        ...current,
        [pageNumber]: existing.slice(0, -1)
      };
    });
  }

  function clearPage(pageNumber: number) {
    setPageRectsMap((current) => ({
      ...current,
      [pageNumber]: []
    }));
  }

  async function handleSanitize() {
    if (!file) {
      setError("Upload a PDF first.");
      return;
    }

    if (totalRedactions === 0) {
      setError("Draw at least one redaction box before sanitizing.");
      return;
    }

    setBusy(true);
    setError("");

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
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Sanitization failed.";
      setError(message);
      setBusy(false);
    }
  }

  return (
    <main className="site-shell">
      <section className="page-header">
        <div>
          <Link href="/" className="back-link">
            ← Back home
          </Link>
          <div className="eyebrow">LIVE TOOL</div>
          <h1 className="page-title">Sanitize PDF</h1>
          <p className="muted">
            Upload a PDF, drag redaction boxes, and build a clean image-only copy.
          </p>
        </div>

        <div className="actions-wrap">
          <Link href="/review" className="secondary-btn small-btn">
            Review
          </Link>
          <Link href="/dashboard" className="secondary-btn small-btn">
            Dashboard
          </Link>
        </div>
      </section>

      <section className="panel">
        <div className="eyebrow">STEP 1</div>
        <h2 className="panel-title">Upload document</h2>

        <div className="upload-box">
          <input type="file" accept="application/pdf" onChange={onFileChange} />
          <div className="upload-hint">
            Browser-side processing for this MVP. Unredacted files are not stored in the database.
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="small-label">FILE</div>
            <div className="kv-strong">{fileName || "No file loaded yet"}</div>
          </div>
          <div className="info-card">
            <div className="small-label">SIZE</div>
            <div className="kv-strong">{fileSize || "—"}</div>
          </div>
          <div className="info-card">
            <div className="small-label">PAGES</div>
            <div className="kv-strong">{pageCount || 0}</div>
          </div>
          <div className="info-card">
            <div className="small-label">BOXES</div>
            <div className="kv-strong">{totalRedactions}</div>
          </div>
        </div>

        <div className="progress-wrap">
          <div className="status-line">{progressLabel}</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {error ? <div className="warning-box">{error}</div> : null}
      </section>

      <section className="panel">
        <div className="section-row">
          <div>
            <div className="eyebrow">STEP 2</div>
            <h2 className="panel-title">Draw redaction boxes</h2>
            <p className="muted">
              Drag directly on the page. The live box and size badge stay visible while you draw.
            </p>
          </div>
          <div className="live-pill">
            {pointerDraft ? drawingLabel || "Drawing..." : `${totalRedactions} boxes ready`}
          </div>
        </div>

        {pagePreviews.length === 0 ? (
          <div className="empty-state">Upload a PDF first. Pages will appear here.</div>
        ) : (
          <div className="page-stack">
            {pagePreviews.map((preview) => {
              const pageRects = pageRectsMap[preview.pageNumber] ?? [];
              const draftForPage =
                pointerDraft?.pageNumber === preview.pageNumber ? liveDraftRect : null;

              return (
                <div className="page-canvas-wrap" key={preview.pageNumber}>
                  <div className="page-toolbar">
                    <div>
                      <div className="page-number">Page {preview.pageNumber}</div>
                      <div className="redaction-count">
                        {pageRects.length} redaction box{pageRects.length === 1 ? "" : "es"}
                      </div>
                    </div>

                    <div className="actions-wrap">
                      <button
                        type="button"
                        className="secondary-btn small-btn"
                        onClick={() => removeLastRect(preview.pageNumber)}
                      >
                        Undo last box
                      </button>
                      <button
                        type="button"
                        className="secondary-btn small-btn"
                        onClick={() => clearPage(preview.pageNumber)}
                      >
                        Clear page
                      </button>
                    </div>
                  </div>

                  <div
                    className="canvas-stage"
                    ref={(node) => {
                      containerRefs.current[preview.pageNumber] = node;
                    }}
                  >
                    <img
                      src={preview.dataUrl}
                      alt={`Preview page ${preview.pageNumber}`}
                      className="page-canvas"
                    />

                    <div
                      className="rect-layer"
                      onPointerDown={(event) => handlePointerDown(preview.pageNumber, event)}
                      onPointerMove={(event) => handlePointerMove(preview.pageNumber, event)}
                      onPointerUp={() => finishPointer(preview.pageNumber)}
                      onPointerCancel={() => finishPointer(preview.pageNumber)}
                    >
                      {pageRects.map((rect, index) => (
                        <div
                          key={`${preview.pageNumber}-${index}`}
                          className="redact-box"
                          style={getRectStyle(rect)}
                        />
                      ))}

                      {draftForPage ? (
                        <>
                          <div className="redact-box draft" style={getRectStyle(draftForPage)} />
                          <div
                            className="drag-size-pill"
                            style={{
                              left: `calc(${(draftForPage.x + draftForPage.width) * 100}% - 8px)`,
                              top: `calc(${draftForPage.y * 100}% - 8px)`
                            }}
                          >
                            {(draftForPage.width * 100).toFixed(1)}% × {(draftForPage.height * 100).toFixed(1)}%
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="eyebrow">STEP 3</div>
        <h2 className="panel-title">Build clean PDF</h2>
        <p className="muted">
          The clean file is rebuilt from rasterized page images with your blackouts burned in.
        </p>

        <div className="actions-wrap">
          <button
            type="button"
            className="primary-btn"
            onClick={handleSanitize}
            disabled={busy}
          >
            {busy ? "Working..." : "Sanitize PDF"}
          </button>

          <Link href="/review" className="secondary-btn small-btn">
            Open review
          </Link>
        </div>
      </section>
    </main>
  );
}
