import { PDFDocument } from "pdf-lib";

export type NormalizedRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PageRectsMap = Record<number, NormalizedRect[]>;

export type SanitizeResult = {
  blob: Blob;
  hash: string;
  pageCount: number;
  redactionCount: number;
  cleanFileName: string;
};

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

function ensureWorkerConfigured(pdfjsLib: PdfJsModule) {
  if (typeof window === "undefined") {
    return;
  }

  const current = pdfjsLib.GlobalWorkerOptions.workerSrc;
  if (!current) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
}

async function getPdfJs() {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  ensureWorkerConfigured(pdfjsLib);
  return pdfjsLib;
}

async function fileToArrayBuffer(file: File) {
  return await file.arrayBuffer();
}

async function sha256FromBuffer(buffer: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const byteArray = Array.from(new Uint8Array(digest));
  return byteArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function dataUrlToUint8Array(dataUrl: string) {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function getJpegDataUrl(canvas: HTMLCanvasElement) {
  return canvas.toDataURL("image/jpeg", 0.92);
}

function drawRectsOnCanvas(
  canvas: HTMLCanvasElement,
  rects: NormalizedRect[],
  viewportWidth: number,
  viewportHeight: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx || rects.length === 0) {
    return;
  }

  ctx.fillStyle = "#000000";

  rects.forEach((rect) => {
    const x = rect.x * viewportWidth;
    const y = rect.y * viewportHeight;
    const width = rect.width * viewportWidth;
    const height = rect.height * viewportHeight;

    ctx.fillRect(x, y, width, height);
  });
}

export async function sanitizePdfWithRasterization(params: {
  file: File;
  pageRectsMap: PageRectsMap;
  onProgress?: (percent: number, label: string) => void;
}): Promise<SanitizeResult> {
  const { file, pageRectsMap, onProgress } = params;

  onProgress?.(4, "Loading PDF");
  const inputBytes = await fileToArrayBuffer(file);
  const pdfjsLib = await getPdfJs();
  const loadingTask = pdfjsLib.getDocument({
    data: inputBytes
  });

  const sourcePdf = await loadingTask.promise;
  const cleanPdf = await PDFDocument.create();

  cleanPdf.setTitle("");
  cleanPdf.setAuthor("");
  cleanPdf.setSubject("");
  cleanPdf.setKeywords([]);
  cleanPdf.setProducer("");
  cleanPdf.setCreator("");
  cleanPdf.setLanguage("");

  let totalRects = 0;

  for (let pageNumber = 1; pageNumber <= sourcePdf.numPages; pageNumber += 1) {
    const pdfPage = await sourcePdf.getPage(pageNumber);
    const viewport = pdfPage.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas rendering context could not be created.");
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await pdfPage.render({
      canvasContext: ctx,
      viewport
    }).promise;

    const pageRects = pageRectsMap[pageNumber] ?? [];
    totalRects += pageRects.length;

    drawRectsOnCanvas(canvas, pageRects, viewport.width, viewport.height);

    const jpegDataUrl = getJpegDataUrl(canvas);
    const jpegBytes = dataUrlToUint8Array(jpegDataUrl);
    const embeddedImage = await cleanPdf.embedJpg(jpegBytes);

    const newPage = cleanPdf.addPage([viewport.width, viewport.height]);
    newPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height
    });

    const percent = Math.round((pageNumber / sourcePdf.numPages) * 82) + 8;
    onProgress?.(percent, `Rendering page ${pageNumber} of ${sourcePdf.numPages}`);
  }

  onProgress?.(94, "Saving clean PDF");

  const cleanBytes = await cleanPdf.save({
    useObjectStreams: false,
    addDefaultPage: false,
    updateFieldAppearances: false
  });

  const cleanArrayBuffer = cleanBytes.buffer.slice(
    cleanBytes.byteOffset,
    cleanBytes.byteOffset + cleanBytes.byteLength
  );

  const hash = await sha256FromBuffer(cleanArrayBuffer);
  const cleanBlob = new Blob([cleanBytes], { type: "application/pdf" });

  onProgress?.(100, "Clean PDF ready");

  return {
    blob: cleanBlob,
    hash,
    pageCount: sourcePdf.numPages,
    redactionCount: totalRects,
    cleanFileName: file.name.replace(/\.pdf$/i, "") + "-clean.pdf"
  };
}
