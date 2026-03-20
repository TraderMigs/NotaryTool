"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  NormalizedRect,
  PageRectsMap,
  sanitizePdfWithRasterization
} from "@/lib/pdfSanitizer";
import { createSessionId, saveReviewSession } from "@/lib/runtimeStore";
import { supabase } from "@/lib/supabase";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
type PagePreview = { pageNumber: number; width: number; height: number; dataUrl: string };
type PointerDraft = { pageNumber: number; originX: number; originY: number; currentX: number; currentY: number } | null;

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
function normalizeRect(x1: number, y1: number, x2: number, y2: number): NormalizedRect | null {
  const x = Math.min(x1, x2), y = Math.min(y1, y2);
  const w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
  if (w < 0.008 || h < 0.008) return null;
  return { x: clamp01(x), y: clamp01(y), width: clamp01(w), height: clamp01(h) };
}
function getRectStyle(r: NormalizedRect) {
  return { left: `${r.x*100}%`, top: `${r.y*100}%`, width: `${r.width*100}%`, height: `${r.height*100}%` };
}
function buildDraftRect(d: PointerDraft): NormalizedRect | null {
  if (!d) return null;
  return normalizeRect(d.originX, d.originY, d.currentX, d.currentY);
}

// Get normalized coords from any element + clientX/Y
function getNormCoords(el: HTMLElement, clientX: number, clientY: number) {
  const r = el.getBoundingClientRect();
  return {
    x: clamp01((clientX - r.left) / r.width),
    y: clamp01((clientY - r.top) / r.height),
  };
}

export default function SanitizePage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [limitHit, setLimitHit] = useState(false);

  // Mobile fullscreen + scroll lock
  const [mobileFullscreen, setMobileFullscreen] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
  const [pageRectsMap, setPageRectsMap] = useState<PageRectsMap>({});
  const rectsHistoryRef = useRef<PageRectsMap[]>([]); // undo stack - ref avoids stale closure
  const [pointerDraft, setPointerDraft] = useState<PointerDraft>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Waiting");
  const [error, setError] = useState("");
  const containerRefs = useRef<Record<number, HTMLDivElement | null>>({});
  // Track active drawing per page for touch events
  const drawingRef = useRef<PointerDraft>(null);

  const totalRedactions = useMemo(() => Object.values(pageRectsMap).reduce((s, r) => s + r.length, 0), [pageRectsMap]);
  const estimatedFees = useMemo(() => pageCount * 5, [pageCount]);
  const liveDraftRect = useMemo(() => buildDraftRect(pointerDraft), [pointerDraft]);

  useEffect(() => {
    if (!supabase) { router.push('/sign-in'); return; }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push('/sign-in'); return; }
      const user = data.session.user;
      setUserId(user.id);
      const ownerCheck = user.email === 'infiniappsofficial@gmail.com';
      setIsOwner(ownerCheck);
      const { data: planRow } = await supabase!.from('user_plans').select('plan,status').eq('user_id', user.id).single();
      const paid = ownerCheck || ((planRow?.plan === 'monthly' || planRow?.plan === 'yearly') && planRow?.status === 'active');
      setIsPaid(paid);
      if (!ownerCheck && !paid) {
        const today = new Date().toISOString().split('T')[0];
        const { data: countRow } = await supabase!.from('daily_sanitize_counts').select('count').eq('user_id', user.id).eq('date', today).single();
        const count = countRow?.count ?? 0;
        setTodayCount(count);
        if (count >= 5) setLimitHit(true);
      }
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setSessionExpired(true);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  async function getPdfJs(): Promise<PdfJsModule> {
    const lib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    if (!lib.GlobalWorkerOptions.workerSrc) {
      lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.mjs`;
    }
    return lib;
  }

  async function renderPreviewPages(f: File) {
    setBusy(true); setError(""); setProgress(8); setProgressLabel("Rendering pages");
    try {
      const buffer = await f.arrayBuffer();
      const lib = await getPdfJs();
      const pdf = await lib.getDocument({ data: buffer }).promise;
      const previews: PagePreview[] = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const vp = page.getViewport({ scale: 1.45 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unavailable.");
        canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        previews.push({ pageNumber: n, width: canvas.width, height: canvas.height, dataUrl: canvas.toDataURL("image/png") });
        setProgress(Math.round((n / pdf.numPages) * 42));
      }
      setPageCount(pdf.numPages); setPagePreviews(previews); setPageRectsMap({});
      setProgress(46); setProgressLabel("Ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to render PDF.");
      setPageCount(0); setPagePreviews([]); setPageRectsMap({});
    } finally { setBusy(false); }
  }

  function resetFileState() {
    setFile(null); setFileName(""); setFileSize(""); setPageCount(0);
    setPagePreviews([]); setPageRectsMap({}); setPointerDraft(null);
    setProgress(0); setProgressLabel("Waiting"); setError("");
    setMobileFullscreen(false); setScrollLocked(false);
    rectsHistoryRef.current = [];
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { resetFileState(); setError("Upload a PDF file only."); return; }
    setFile(f); setFileName(f.name); setFileSize(`${(f.size/1024/1024).toFixed(2)} MB`);
    await renderPreviewPages(f);
  }

  // ── Pointer handlers (desktop + stylus) ──────────────────
  function handlePointerDown(pn: number, e: React.PointerEvent<HTMLDivElement>) {
    if (busy || scrollLocked) return;
    const pt = getNormCoords(e.currentTarget, e.clientX, e.clientY);
    e.currentTarget.setPointerCapture(e.pointerId);
    const draft = { pageNumber: pn, originX: pt.x, originY: pt.y, currentX: pt.x, currentY: pt.y };
    drawingRef.current = draft;
    setPointerDraft(draft);
  }
  function handlePointerMove(pn: number, e: React.PointerEvent<HTMLDivElement>) {
    if (!drawingRef.current || drawingRef.current.pageNumber !== pn) return;
    const pt = getNormCoords(e.currentTarget, e.clientX, e.clientY);
    const updated = { ...drawingRef.current, currentX: pt.x, currentY: pt.y };
    drawingRef.current = updated;
    setPointerDraft(updated);
  }
  function handlePointerUp(pn: number, e: React.PointerEvent<HTMLDivElement>) {
    if (!drawingRef.current || drawingRef.current.pageNumber !== pn) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const d = drawingRef.current;
    const rect = normalizeRect(d.originX, d.originY, d.currentX, d.currentY);
    drawingRef.current = null;
    setPointerDraft(null);
    if (!rect) return;
    setPageRectsMap(c => {
      rectsHistoryRef.current = [...rectsHistoryRef.current, c];
      return { ...c, [pn]: [...(c[pn] ?? []), rect] };
    });
  }

  // ── Touch handlers (mobile finger) ───────────────────────
  // These fire when touch-action:none is set, preventing scroll interference
  const handleTouchStart = useCallback((pn: number, e: React.TouchEvent<HTMLDivElement>) => {
    if (busy || !scrollLocked) return;
    const touch = e.touches[0];
    const pt = getNormCoords(e.currentTarget, touch.clientX, touch.clientY);
    const draft = { pageNumber: pn, originX: pt.x, originY: pt.y, currentX: pt.x, currentY: pt.y };
    drawingRef.current = draft;
    setPointerDraft(draft);
  }, [busy, scrollLocked]);

  const handleTouchMove = useCallback((pn: number, e: React.TouchEvent<HTMLDivElement>) => {
    if (!drawingRef.current || drawingRef.current.pageNumber !== pn) return;
    const touch = e.touches[0];
    const pt = getNormCoords(e.currentTarget, touch.clientX, touch.clientY);
    const updated = { ...drawingRef.current, currentX: pt.x, currentY: pt.y };
    drawingRef.current = updated;
    setPointerDraft(updated);
  }, []);

  const handleTouchEnd = useCallback((pn: number, _e: React.TouchEvent<HTMLDivElement>) => {
    if (!drawingRef.current || drawingRef.current.pageNumber !== pn) return;
    const d = drawingRef.current;
    const rect = normalizeRect(d.originX, d.originY, d.currentX, d.currentY);
    drawingRef.current = null;
    setPointerDraft(null);
    if (!rect) return;
    setPageRectsMap(c => {
      rectsHistoryRef.current = [...rectsHistoryRef.current, c];
      return { ...c, [pn]: [...(c[pn] ?? []), rect] };
    });
  }, []);

  function clearPage(pn: number) {
    rectsHistoryRef.current = [...rectsHistoryRef.current, pageRectsMap];
    setPageRectsMap(c => { const n = { ...c }; delete n[pn]; return n; });
  }

  function undoLast() {
    const h = rectsHistoryRef.current;
    if (h.length === 0) return;
    const prev = h[h.length - 1];
    rectsHistoryRef.current = h.slice(0, -1);
    setPageRectsMap(prev);
  }

  function removeRect(pn: number, idx: number) {
    rectsHistoryRef.current = [...rectsHistoryRef.current, pageRectsMap];
    setPageRectsMap(c => {
      const updated = [...(c[pn] ?? [])];
      updated.splice(idx, 1);
      return { ...c, [pn]: updated };
    });
  }

  async function handleGenerate() {
    if (!file || pagePreviews.length === 0 || !userId) return;
    if (!isOwner && !isPaid) {
      const session = await supabase!.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) { setSessionExpired(true); return; }
      const res = await fetch('/api/usage/increment', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const usageData = await res.json();
      if (!usageData.allowed) { setLimitHit(true); setTodayCount(usageData.count ?? 5); setMobileFullscreen(false); return; }
      setTodayCount(usageData.count ?? 0);
    }
    setMobileFullscreen(false);
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

  const canGenerate = !!file && !busy && pagePreviews.length > 0 && !limitHit;
  const remainingToday = Math.max(0, 5 - todayCount);
  const showUpsellNudge = !isPaid && !isOwner && !limitHit && todayCount >= 4 && authChecked;

  // Shared page renderer — used in both desktop and mobile fullscreen
  function renderPages(inFullscreen = false) {
    return pagePreviews.map((page) => {
      const rects = pageRectsMap[page.pageNumber] ?? [];
      return (
        <article key={page.pageNumber} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: inFullscreen ? '12px' : '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' as const }}>
              Page {page.pageNumber}
            </span>
            <button type="button" onClick={() => clearPage(page.pageNumber)}
              style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', borderRadius: '5px', padding: '4px 10px', cursor: 'pointer' }}>
              Clear
            </button>
          </div>
          {/* FIX 4: redaction hint above page */}
          {rects.length === 0 && (
            <div style={{ padding: '7px 14px', background: 'rgba(0,200,240,0.05)', borderBottom: '1px solid var(--border-cyan)', fontSize: '11px', color: 'var(--cyan-dim)', lineHeight: 1.5 }}>
              Draw boxes over sensitive fields. Blue preview = placement check. Full block applied on generate.
            </div>
          )}
          <div
            ref={(node) => { containerRefs.current[page.pageNumber] = node; }}
            style={{
              position: 'relative',
              userSelect: 'none',
              // FIX 7: touch-action none PREVENTS browser scroll from stealing touch events
              touchAction: scrollLocked ? 'none' : 'pan-y',
              cursor: scrollLocked ? 'crosshair' : 'default',
              lineHeight: 0,
            }}
            onPointerDown={(e) => handlePointerDown(page.pageNumber, e)}
            onPointerMove={(e) => handlePointerMove(page.pageNumber, e)}
            onPointerUp={(e) => handlePointerUp(page.pageNumber, e)}
            onTouchStart={(e) => handleTouchStart(page.pageNumber, e)}
            onTouchMove={(e) => handleTouchMove(page.pageNumber, e)}
            onTouchEnd={(e) => handleTouchEnd(page.pageNumber, e)}
          >
            <img src={page.dataUrl} alt={`Page ${page.pageNumber}`} style={{ width: '100%', display: 'block', pointerEvents: 'none' }} draggable={false} />
            {rects.map((rect, idx) => (
              <div
                key={`${page.pageNumber}-${idx}`}
                title="Tap or click to remove this box"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); removeRect(page.pageNumber, idx); }}
                onPointerDown={(e) => { e.stopPropagation(); }}
                onMouseEnter={(e) => { const x = e.currentTarget.querySelector('.brx') as HTMLElement; if (x) x.style.opacity = '1'; }}
                onMouseLeave={(e) => { const x = e.currentTarget.querySelector('.brx') as HTMLElement; if (x) x.style.opacity = '0'; }}
                style={{
                  position: 'absolute', background: '#000', opacity: 1,
                  ...getRectStyle(rect),
                  cursor: 'pointer',
                }}
              >
                <div className="brx" style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%,-50%)',
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'rgba(255,50,50,0.9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 800, color: '#fff',
                  opacity: 0,
                  transition: 'opacity 0.12s',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}>✕</div>
              </div>
            ))}
            {pointerDraft?.pageNumber === page.pageNumber && liveDraftRect && (
              <div style={{ position: 'absolute', background: 'rgba(0,200,240,0.28)', border: '2px solid var(--cyan)', borderRadius: '2px', ...getRectStyle(liveDraftRect) }} />
            )}
          </div>
        </article>
      );
    });
  }

  if (!authChecked) return (
    <>
      <PublicHeader />
      <main className="page-wrap">
        <div className="container" style={{ paddingTop: '80px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
        </div>
      </main>
    </>
  );

  return (
    <>
      <PublicHeader />

      {sessionExpired && (
        <div className="session-expiry-banner">
          <p>Your session expired.</p>
          <Link href="/sign-in" className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>Sign in again</Link>
        </div>
      )}

      {/* ══ MOBILE FULLSCREEN ══ */}
      {mobileFullscreen && (
        <div className="sanitize-fullscreen-overlay">
          <div className="sanitize-fullscreen-header">
            <button type="button"
              onClick={() => setMobileFullscreen(false)}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', padding: '7px 12px', fontSize: '13px', fontFamily: 'var(--dm-sans, sans-serif)', cursor: 'pointer', flexShrink: 0 }}>
              ← Back
            </button>
            <span className="sanitize-fullscreen-title">{fileName}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{totalRedactions} box{totalRedactions !== 1 ? 'es' : ''}</span>
              {/* FIX 6: scroll lock toggle */}
              <button
                type="button"
                onClick={() => setScrollLocked(l => !l)}
                style={{
                  fontFamily: 'var(--dm-sans, sans-serif)',
                  fontSize: '11px', fontWeight: 600,
                  padding: '5px 10px', borderRadius: '5px', cursor: 'pointer',
                  background: scrollLocked ? 'var(--cyan)' : 'none',
                  border: scrollLocked ? 'none' : '1px solid var(--border)',
                  color: scrollLocked ? '#020C14' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              >
                {scrollLocked ? '🔒 Drawing' : '🔓 Scroll'}
              </button>
            </div>
          </div>

          {/* Instruction strip */}
          <div style={{ padding: '8px 16px', background: scrollLocked ? 'rgba(0,200,240,0.09)' : 'rgba(255,160,0,0.06)', borderBottom: scrollLocked ? '1px solid var(--border-cyan)' : '1px solid rgba(255,160,0,0.2)', transition: 'all 0.2s' }}>
            <p style={{ fontSize: '12px', color: scrollLocked ? 'var(--cyan-dim)' : 'rgba(255,200,80,0.8)', margin: 0, textAlign: 'center' }}>
              {scrollLocked
                ? 'Drawing mode — tap and drag to draw redaction boxes'
                : 'Scroll mode — tap 🔒 Drawing to start redacting'}
            </p>
          </div>

          <div className="sanitize-fullscreen-scroll" style={{ padding: '12px' }}>
            {pagePreviews.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-faint)', fontSize: '14px' }}>
                Loading pages…
              </div>
            ) : renderPages(true)}
          </div>

          <div className="sanitize-fullscreen-footer">
            <div style={{ flex: 1 }}>
              <div style={{ height: '3px', background: 'var(--border)', borderRadius: '100px', overflow: 'hidden', marginBottom: '5px' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--cyan)', borderRadius: '100px', transition: 'width 0.3s ease' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{progressLabel}</span>
            </div>
            <button
              type="button"
              onClick={undoLast}
              disabled={rectsHistoryRef.current.length === 0 || busy}
              style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '12px', fontWeight: 600, padding: '9px 14px', borderRadius: '6px', cursor: rectsHistoryRef.current.length > 0 ? 'pointer' : 'not-allowed', background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', opacity: rectsHistoryRef.current.length > 0 ? 1 : 0.35, flexShrink: 0, transition: 'all 0.15s' }}>
              ↩ Undo
            </button>
            <button type="button" className="btn-primary"
              disabled={!canGenerate}
              onClick={handleGenerate}
              style={{ opacity: canGenerate ? 1 : 0.38, cursor: canGenerate ? 'pointer' : 'not-allowed', fontSize: '13px', padding: '10px 20px', flexShrink: 0 }}>
              {busy ? 'Processing…' : 'Generate clean PDF'}
            </button>
          </div>
        </div>
      )}

      {/* ══ NORMAL PAGE ══ */}
      <main className="page-wrap">
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>

          <div className="back-nav">
            <Link href="/" className="btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              Home
            </Link>
            <span className="back-nav-divider" />
            <Link href="/review" className="btn-ghost">Review</Link>
            <span className="back-nav-divider" />
            <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
          </div>

          {limitHit && (
            <div className="upgrade-nudge">
              <p><strong>Daily limit reached — 5/5 free sanitizes used.</strong> Upgrade for unlimited or come back tomorrow.</p>
              <Link href="/account?tab=billing" className="btn-primary" style={{ fontSize: '13px', padding: '9px 18px', flexShrink: 0 }}>Upgrade now</Link>
            </div>
          )}
          {showUpsellNudge && (
            <div className="upgrade-nudge">
              <p>You've used <strong>{todayCount} of 5</strong> free sanitizes today — {remainingToday} remaining.</p>
              <Link href="/account?tab=billing" style={{ fontSize: '12px', color: 'var(--cyan-dim)', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>Upgrade →</Link>
            </div>
          )}
          {!isPaid && !isOwner && !limitHit && !showUpsellNudge && authChecked && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Free plan: <strong style={{ color: 'var(--text-secondary)' }}>{remainingToday}</strong> of 5 sanitizes remaining today
              </span>
              <Link href="/account?tab=billing" style={{ fontSize: '12px', color: 'var(--cyan-dim)', textDecoration: 'none', fontWeight: 500 }}>Upgrade →</Link>
            </div>
          )}
          {(isPaid || isOwner) && authChecked && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--cyan-glow)', border: '1px solid var(--border-cyan)', borderRadius: '6px', padding: '5px 12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--cyan)' }}>
                {isOwner ? 'Owner — Unlimited' : 'Paid — Unlimited'}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <span className="label" style={{ marginBottom: '8px' }}>Sanitize</span>
              <h1 style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--text-primary)', lineHeight: 1.06 }}>
                Prep a cleaner PDF
              </h1>
            </div>
          </div>

          <div className="rule" style={{ marginBottom: '28px' }} />

          {/* ── MOBILE UI ── */}
          <div className="sanitize-mobile-upload">
            {error && (
              <div style={{ background: 'rgba(255,80,80,0.07)', border: '1px solid rgba(255,80,80,0.18)', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#FF8080' }}>{error}</div>
            )}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--cyan)', marginBottom: '14px' }}>Upload PDF</div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', border: '1px dashed var(--border-mid)', borderRadius: '10px', padding: '20px 16px', cursor: limitHit ? 'not-allowed' : 'pointer', background: 'rgba(255,255,255,0.02)', opacity: limitHit ? 0.45 : 1, textAlign: 'center', alignItems: 'center' }}>
                <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} disabled={limitHit || busy} />
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-faint)', marginBottom: '8px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '14px', fontWeight: 600, color: fileName ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {fileName || 'Tap to choose PDF'}
                </span>
                {fileSize && <small style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{fileSize}</small>}
              </label>
            </div>
            {pagePreviews.length > 0 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                {[{ val: pageCount, k: 'Pages' }, { val: totalRedactions, k: 'Redactions' }, { val: `$${estimatedFees.toFixed(2)}`, k: 'Est. tally' }].map(s => (
                  <div key={s.k} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{s.val}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.k}</div>
                  </div>
                ))}
              </div>
            )}
            {pagePreviews.length > 0 && !limitHit && (
              <button type="button" className="btn-secondary btn-full"
                onClick={() => { setScrollLocked(false); setMobileFullscreen(true); }}
                style={{ fontSize: '14px', padding: '14px' }}>
                ✏️ Open redaction view
              </button>
            )}
            {busy && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ height: '3px', background: 'var(--border)', borderRadius: '100px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'var(--cyan)', borderRadius: '100px', transition: 'width 0.3s ease' }} />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{progressLabel}</p>
              </div>
            )}
            <button type="button" className="btn-primary btn-full"
              disabled={!canGenerate}
              onClick={handleGenerate}
              style={{ opacity: canGenerate ? 1 : 0.38, cursor: canGenerate ? 'pointer' : 'not-allowed', padding: '14px', fontSize: '15px' }}>
              {busy ? 'Processing…' : limitHit ? 'Limit reached — upgrade' : canGenerate ? 'Generate clean PDF' : 'Upload a PDF to begin'}
            </button>
          </div>

          {/* ── DESKTOP TWO-COL ── */}
          <div className="sanitize-desktop-layout">
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 16px' }}>
                <div style={{ fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--cyan)', marginBottom: '12px' }}>Upload</div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', border: '1px dashed var(--border-mid)', borderRadius: '8px', padding: '14px 12px', cursor: limitHit ? 'not-allowed' : 'pointer', background: 'rgba(255,255,255,0.02)', opacity: limitHit ? 0.45 : 1 }}>
                  <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} disabled={limitHit} />
                  <span style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '13px', fontWeight: 500, color: fileName ? 'var(--text-primary)' : 'var(--text-secondary)', wordBreak: 'break-word' }}>
                    {fileName || 'Choose PDF'}
                  </span>
                  <small style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{fileSize || 'PDF only'}</small>
                </label>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 16px' }}>
                <div style={{ fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--cyan)', marginBottom: '12px' }}>Live totals</div>
                {[{ val: pageCount, key: 'Pages' }, { val: totalRedactions, key: 'Redactions' }, { val: `$${estimatedFees.toFixed(2)}`, key: 'Witness tally' }].map((s, i, arr) => (
                  <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>{s.val}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.key}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 16px' }}>
                <div style={{ fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--cyan)', marginBottom: '12px' }}>Progress</div>
                <div style={{ height: '3px', background: 'var(--border)', borderRadius: '100px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'var(--cyan)', borderRadius: '100px', transition: 'width 0.3s ease' }} />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{progressLabel}</p>
                {error && (
                  <div style={{ marginTop: '10px', background: 'rgba(255,80,80,0.07)', border: '1px solid rgba(255,80,80,0.18)', borderRadius: '7px', padding: '10px 12px', fontSize: '12px', color: '#FF8080', lineHeight: '1.55' }}>{error}</div>
                )}
              </div>
              <button type="button" className="btn-primary btn-full"
                disabled={!canGenerate} onClick={handleGenerate}
                style={{ opacity: canGenerate ? 1 : 0.38, cursor: canGenerate ? 'pointer' : 'not-allowed' }}>
                {busy ? 'Processing…' : limitHit ? 'Limit reached — upgrade' : 'Generate clean PDF'}
              </button>
            </aside>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pagePreviews.length === 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-mid)', borderRadius: '12px', padding: '56px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: '14px', textAlign: 'center', minHeight: '280px' }}>
                  {limitHit ? 'Daily limit reached. Upgrade to continue.' : 'Upload a PDF to render preview pages and draw blackout boxes.'}
                </div>
              )}
              {renderPages(false)}
            </div>
          </div>

        </div>
      </main>
      <PublicFooter />
    </>
  );
}
