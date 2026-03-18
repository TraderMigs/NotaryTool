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

type PointerDraft = {
  pointerId: number;
  pageNumber: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
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

  if (width < 0.008 || height < 0.008) {
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

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("The clean PDF could not be converted for review."));
    };

    reader.onerror = () => {
      reject(new Error("The clean PDF could not be converted for review."));
    };

    reader.readAsDataURL(blob);
  });
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

  const totalRedactions = useMemo(() => {
    return Object.values(pageRectsMap).reduce((sum, rects) => sum + rects.length, 0);
  }, [pageRectsMap]);

  const draftRect = useMemo(() => {
    if (!pointerDraft) {
      return null;
    }

    const normalized = normalizeRect(
      pointerDraft.startX,
      pointerDraft.startY,
      pointerDraft.currentX,
      pointerDraft.currentY
    );

    if (!normalized) {
      return null;
    }

    return {
      pageNumber: pointerDraft.pageNumber,
      rect: normalized
    };
  }, [pointerDraft]);

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
    setProgress(4);
    setProgressLabel("Loading preview");

    try {
      const pdfjsLib = await getPdfJs();
      const bytes = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      const previews: PagePreview[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.25 });
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
      setPointerDraft(null);
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

  function handlePointerDown(
    pageNumber: number,
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (busy) {
      return;
    }

    const point = getPointerPosition(pageNumber, event.clientX, event.clientY);

    if (!point) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    setPointerDraft({
      pointerId: event.pointerId,
      pageNumber,
      startX: point.x,
      startY: point.y,
      currentX: point.x,
      currentY: point.y
    });
  }

  function handlePointerMove(
    pageNumber: number,
    event: React.PointerEvent<HTMLDivElement>
  ) {
    setPointerDraft((current) => {
      if (!current) {
        return current;
      }

      if (current.pageNumber !== pageNumber || current.pointerId !== event.pointerId) {
        return current;
      }

      const point = getPointerPosition(pageNumber, event.clientX, event.clientY);

      if (!point) {
        return current;
      }

      return {
        ...current,
        currentX: point.x,
        currentY: point.y
      };
    });
  }

  function finalizePointerDrag(
    pageNumber: number,
    pointerId: number,
    clientX: number,
    clientY: number
  ) {
    setPointerDraft((current) => {
      if (!current) {
        return null;
      }

      if (current.pageNumber !== pageNumber || current.pointerId !== pointerId) {
        return current;
      }

      const point =
        getPointerPosition(pageNumber, clientX, clientY) ?? {
          x: current.currentX,
          y: current.currentY
        };

      const finalRect = normalizeRect(
        current.startX,
        current.startY,
        point.x,
        point.y
      );

      if (finalRect) {
        setPageRectsMap((existingMap) => {
          const existingRects = existingMap[pageNumber] ?? [];

          return {
            ...existingMap,
            [pageNumber]: [...existingRects, finalRect]
          };
        });
      }

      return null;
    });
  }

  function handlePointerUp(
    pageNumber: number,
    event: React.PointerEvent<HTMLDivElement>
  ) {
    finalizePointerDrag(pageNumber, event.pointerId, event.clientX, event.clientY);
  }

  function handlePointerCancel(
    pageNumber: number,
    event: React.PointerEvent<HTMLDivElement>
  ) {
    finalizePointerDrag(pageNumber, event.pointerId, event.clientX, event.clientY);
  }

  function removeLastRect(pageNumber: number) {
    setPageRectsMap((current) => {
      const existing = current[pageNumber] ?? [];

      if (existing.length === 0) {
        return current;
      }

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

      const cleanPdfDataUrl = await blobToDataUrl(result.blob);

      setReviewSession({
        originalFileName: file.name,
        cleanFileName: result.cleanFileName,
        hash: result.hash,
        pageCount: result.pageCount,
        redactionCount: result.redactionCount,
        cleanPdfDataUrl,
        createdAt: new Date().toISOString(),
        estimatedWitnessFeesFound: result.pageCount * 5
      });

      window.location.href = "/review";
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Sanitization failed.";

      setError(message);
      setBusy(false);
      setProgressLabel("Failed");
    }
  }

  const drawingStatus = pointerDraft
    ? "Drawing box..."
    : totalRedactions > 0
      ? `${totalRedactions} box${totalRedactions === 1 ? "" : "es"} ready`
      : "No boxes yet";

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
        <div className="section-head">
          <div>
            <h2>2. Draw redaction boxes</h2>
            <p className="muted">
              Click and drag on a page to mark private content. These blacked-out
              regions will be burned into a new image-only PDF so the original text
              layer is no longer recoverable from the output file.
            </p>
          </div>

          <div className={`draw-status${pointerDraft ? " drawing" : ""}`}>
            {drawingStatus}
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
              const previewDraft =
                draftRect && draftRect.pageNumber === preview.pageNumber
                  ? draftRect.rect
                  : null;

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
                    className="canvas-stage"
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
                      className={`rect-layer${pointerDraft ? " is-drawing" : ""}`}
                      onPointerDown={(event) =>
                        handlePointerDown(preview.pageNumber, event)
                      }
                      onPointerMove={(event) =>
                        handlePointerMove(preview.pageNumber, event)
                      }
                      onPointerUp={(event) =>
                        handlePointerUp(preview.pageNumber, event)
                      }
                      onPointerCancel={(event) =>
                        handlePointerCancel(preview.pageNumber, event)
                      }
                    >
                      {pageRects.map((rect, index) => (
                        <div
                          key={`${preview.pageNumber}-${index}`}
                          className="redact-box"
                          style={getRectStyle(rect)}
                        />
                      ))}

                      {previewDraft ? (
                        <div
                          className="redact-box draft"
                          style={getRectStyle(previewDraft)}
                        />
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
