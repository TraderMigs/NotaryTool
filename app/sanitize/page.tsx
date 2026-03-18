"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  PageRectsMap,
  NormalizedRect,
  sanitizePdfWithRasterization
} from "@/lib/pdfSanitizer";
import { setReviewSession } from "@/lib/runtimeStore";

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

type PagePreview = {
  pageNumber: number;
  width: number;
  height: number;
  dataUrl: string;
};

type DraftRect = {
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

type DragState = {
  pageNumber: number;
  pointerId: number;
  startX: number;
  startY: number;
};

type PointerBadge = {
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

function clamp01(value: number) {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
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

  if (width < 0.006 || height < 0.006) {
    return null;
  }

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

function formatPercentSize(value: number) {
  return `${Math.max(1, Math.round(value * 100))}%`;
}

export default function SanitizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
  const [pageRectsMap, setPageRectsMap] = useState<PageRectsMap>({});
  const [draftRect, setDraftRect] = useState<DraftRect>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [pointerBadge, setPointerBadge] = useState<PointerBadge>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Waiting");
  const [error, setError] = useState("");
  const containerRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const rafRef = useRef<number | null>(null);
  const pendingDraftRef = useRef<DraftRect>(null);

  const totalRedactions = useMemo(() => {
    return Object.values(pageRectsMap).reduce(
      (sum, rects) => sum + rects.length,
      0
    );
  }, [pageRectsMap]);

  async function getPdfJs(): Promise<PdfJsModule> {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    }
    return pdfjsLib;
  }

  function flushDraftRect() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (pendingDraftRef.current !== null) {
      setDraftRect(pendingDraftRef.current);
      pendingDraftRef.current = null;
    }
  }

  function scheduleDraftRect(nextDraft: DraftRect) {
    pendingDraftRef.current = nextDraft;

    if (rafRef.current !== null) {
      return;
    }

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      setDraftRect(pendingDraftRef.current);
      pendingDraftRef.current = null;
    });
  }

  async function renderPreviewPages(selectedFile: File) {
    setBusy(true);
    setError("");
    setProgress(4);
    setProgressLabel("Loading preview");
    setDraftRect(null);
    setDragState(null);
    setPointerBadge(null);

    try {
      const pdfjsLib = await getPdfJs();
      const bytes = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;

      const previews: PagePreview[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.2 });
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

        const nextPercent = Math.round((pageNumber / pdf.numPages) * 85) + 5;
        setProgress(nextPercent);
        setProgressLabel(`Preview page ${pageNumber} of ${pdf.numPages}`);
      }

      setPageCount(pdf.numPages);
      setPagePreviews(previews);
      setPageRectsMap({});
      setProgress(100);
      setProgressLabel("Preview ready");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "The PDF could not be loaded.";
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

    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF only.");
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(`${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`);
    void renderPreviewPages(selectedFile);
  }

  function getPointerPosition(
    pageNumber: number,
    clientX: number,
    clientY: number
  ) {
    const container = containerRefs.current[pageNumber];
    if (!container) {
      return null;
    }

    const rect = container.getBoundingClientRect();
    const x = clamp01((clientX - rect.left) / rect.width);
    const y = clamp01((clientY - rect.top) / rect.height);

    return { x, y };
  }

  function updatePointerBadge(pageNumber: number, rect: NormalizedRect | null) {
    if (!rect) {
      setPointerBadge(null);
      return;
    }

    setPointerBadge({
      pageNumber,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    });
  }

  function handlePointerDown(
    pageNumber: number,
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (busy) {
      return;
    }

    const point = getPointerPosition(pageNumber, event.clientX, event.clientY);
    if (!point) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const nextDragState: DragState = {
      pageNumber,
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y
    };

    setDragState(nextDragState);

    const initialDraft: DraftRect = {
      pageNumber,
      x: point.x,
      y: point.y,
      width: 0,
      height: 0
    };

    setDraftRect(initialDraft);
    setPointerBadge({
      pageNumber,
      x: point.x,
      y: point.y,
      width: 0,
      height: 0
    });
  }

  function handlePointerMove(
    pageNumber: number,
    event: React.PointerEvent<HTMLDivElement>
  ) {
    const activeDrag = dragState;
    if (!activeDrag || activeDrag.pageNumber !== pageNumber) {
      return;
    }

    const point = getPointerPosition(pageNumber, event.clientX, event.clientY);
    if (!point) return;

    const nextRect = normalizeRect(
      activeDrag.startX,
      activeDrag.startY,
      point.x,
      point.y
    );

    if (!nextRect) {
      const tinyDraft: DraftRect = {
        pageNumber,
        x: activeDrag.startX,
        y: activeDrag.startY,
        width: 0,
        height: 0
      };
      scheduleDraftRect(tinyDraft);
      setPointerBadge({
        pageNumber,
        x: activeDrag.startX,
        y: activeDrag.startY,
        width: Math.abs(point.x - activeDrag.startX),
        height: Math.abs(point.y - activeDrag.startY)
      });
      return;
    }

    scheduleDraftRect({
      pageNumber,
      ...nextRect
    });
    updatePointerBadge(pageNumber, nextRect);
  }

  function finishDrag(pageNumber: number, event?: React.PointerEvent<HTMLDivElement>) {
    const activeDrag = dragState;
    if (!activeDrag || activeDrag.pageNumber !== pageNumber) {
      return;
    }

    flushDraftRect();

    let finalRect: NormalizedRect | null = null;

    if (event) {
      const point = getPointerPosition(pageNumber, event.clientX, event.clientY);
      if (point) {
        finalRect = normalizeRect(
          activeDrag.startX,
          activeDrag.startY,
          point.x,
          point.y
        );
      }
    }

    if (!finalRect && draftRect && draftRect.pageNumber === pageNumber) {
      finalRect = normalizeRect(
        draftRect.x,
        draftRect.y,
        draftRect.x + draftRect.width,
        draftRect.y + draftRect.height
      );
    }

    if (finalRect) {
      setPageRectsMap((current) => {
        const existing = current[pageNumber] ?? [];
        return {
          ...current,
          [pageNumber]: [...existing, finalRect]
        };
      });
    }

    setDragState(null);
    setDraftRect(null);
    setPointerBadge(null);
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

      const cleanPdfUrl = URL.createObjectURL(result.blob);

      setReviewSession({
        originalFileName: file.name,
        cleanFileName: result.cleanFileName,
        hash: result.hash,
        pageCount: result.pageCount,
        redactionCount: result.redactionCount,
        cleanPdfUrl,
        createdAt: new Date().toISOString(),
        estimatedWitnessFeesFound: result.pageCount * 5
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
    <main className="shell">
      <div className="top-bar">
        <div>
          <Link href="/" className="back-link">
            ← Back home
          </Link>
          <h1 className="page-title">Sanitize PDF</h1>
          <p className="muted">
            Upload a PDF, drag boxes over private areas, then rebuild a clean
            image-only PDF.
          </p>
        </div>

        <div className="actions-wrap">
          <Link href="/review" className="secondary-btn">
            Go to review
          </Link>
          <Link href="/dashboard" className="secondary-btn">
            Open dashboard
          </Link>
        </div>
      </div>

      <section className="panel">
        <h2>1. Upload document</h2>
        <div className="upload-box">
          <input type="file" accept="application/pdf" onChange={onFileChange} />
          <div className="upload-hint">
            Nothing unredacted is stored in the database in this phase. This is
            browser-side processing only.
          </div>
        </div>

        <div className="info-grid" style={{ marginTop: 18 }}>
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
            <div className="small-label">REDACTION BOXES</div>
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
        <div className="section-header-row">
          <div>
            <h2>2. Draw redaction boxes</h2>
            <p className="muted">
              Click and drag on a page to mark private content. The live guide
              now follows your pointer and shows the box size as you drag.
            </p>
          </div>
          <div className="draw-mode-pill">
            {dragState ? "Drawing box..." : `${totalRedactions} boxes ready`}
          </div>
        </div>

        {pagePreviews.length === 0 ? (
          <div className="empty-state">
            Upload a PDF first. Your pages will appear here.
          </div>
        ) : (
          <div className="page-stack">
            {pagePreviews.map((preview) => {
              const pageRects = pageRectsMap[preview.pageNumber] ?? [];
              const isDraftPage = draftRect?.pageNumber === preview.pageNumber;
              const isDraggingThisPage = dragState?.pageNumber === preview.pageNumber;
              const showBadge = pointerBadge?.pageNumber === preview.pageNumber;

              return (
                <div className="page-canvas-wrap" key={preview.pageNumber}>
                  <div className="page-toolbar">
                    <div>
                      <div className="page-number">Page {preview.pageNumber}</div>
                      <div className="redaction-count">
                        {pageRects.length} redaction box
                        {pageRects.length === 1 ? "" : "es"}
                      </div>
                    </div>

                    <div className="actions-row">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => removeLastRect(preview.pageNumber)}
                      >
                        Undo last box
                      </button>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => clearPage(preview.pageNumber)}
                      >
                        Clear page
                      </button>
                    </div>
                  </div>

                  <div
                    className={`canvas-stage ${isDraggingThisPage ? "is-drawing" : ""}`}
                    ref={(node) => {
                      containerRefs.current[preview.pageNumber] = node;
                    }}
                  >
                    <img
                      src={preview.dataUrl}
                      alt={`Preview page ${preview.pageNumber}`}
                      className="page-canvas"
                      draggable={false}
                    />

                    <div
                      className="rect-layer"
                      onPointerDown={(event) =>
                        handlePointerDown(preview.pageNumber, event)
                      }
                      onPointerMove={(event) =>
                        handlePointerMove(preview.pageNumber, event)
                      }
                      onPointerUp={(event) => finishDrag(preview.pageNumber, event)}
                      onPointerCancel={(event) => finishDrag(preview.pageNumber, event)}
                      onLostPointerCapture={(event) =>
                        finishDrag(preview.pageNumber, event)
                      }
                    >
                      <div className="stage-crosshair stage-crosshair-x" />
                      <div className="stage-crosshair stage-crosshair-y" />

                      {pageRects.map((rect, index) => (
                        <div
                          key={`${preview.pageNumber}-${index}`}
                          className="redact-box"
                          style={getRectStyle(rect)}
                        />
                      ))}

                      {isDraftPage && draftRect ? (
                        <div
                          className="redact-box draft"
                          style={getRectStyle({
                            x: draftRect.x,
                            y: draftRect.y,
                            width: draftRect.width,
                            height: draftRect.height
                          })}
                        />
                      ) : null}

                      {showBadge && pointerBadge ? (
                        <div
                          className="drag-size-badge"
                          style={{
                            left: `${Math.min(pointerBadge.x + pointerBadge.width, 0.94) * 100}%`,
                            top: `${Math.max(pointerBadge.y - 0.04, 0.02) * 100}%`
                          }}
                        >
                          {formatPercentSize(pointerBadge.width)} × {formatPercentSize(pointerBadge.height)}
                        </div>
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
        <h2>3. Build clean PDF</h2>
        <p className="muted">
          This creates a new PDF composed of rasterized page images with your
          black redaction areas burned in.
        </p>

        <div className="actions-row">
          <button
            type="button"
            className="primary-btn"
            onClick={handleSanitize}
            disabled={busy}
          >
            {busy ? "Working..." : "Sanitize PDF"}
          </button>

          <Link href="/review" className="secondary-btn">
            Review last clean file
          </Link>
        </div>

        <div className="inline-note">
          Duty-of-care confirmation happens on the Review page before download.
        </div>
      </section>
    </main>
  );
}
