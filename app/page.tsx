'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'

const FAQ_ITEMS = [
  {
    q: "Is Specterfy responsible if something goes wrong with my documents?",
    a: "No. Specterfy is a pre-processing utility — a tool, not a legal service. You remain fully responsible for reviewing all outputs before any downstream use. We do not store your documents, access your files, or make compliance determinations. Every output you download must be reviewed by you before use.",
  },
  {
    q: "What exactly does Specterfy do?",
    a: "You upload a PDF, draw black boxes over any fields you want to redact, and Specterfy generates a clean copy with those areas permanently blocked out. That's it. Simple, fast, no guessing. The tool processes everything in your browser — nothing is sent to a server.",
  },
  {
    q: "Why would a notary use this?",
    a: "Before a document enters your official workflow — filing, scanning, forwarding to a client or attorney — you can sanitize sensitive fields that don't need to travel with it. It keeps your front-end handling clean and reduces unnecessary PII exposure in your day-to-day operations.",
  },
  {
    q: "Can I use this to train my staff?",
    a: "Absolutely. This is one of the best use cases. Walk new staff through which fields to redact, which to leave, and why. The visual draw-and-block approach makes it fast to teach and easy to repeat consistently. It also builds a good habit of reviewing every document before it moves forward.",
  },
  {
    q: "What about the $5 witness fee — how does that work?",
    a: "Pennsylvania notaries can charge up to $5 per notarized signature as a witness fee. Specterfy shows you a running tally based on page count as a quick reminder — so you never lose track of what you're owed. It's a rough estimate, not a billing tool, but it keeps the number front and center while you work.",
  },
  {
    q: "How fast is it?",
    a: "Upload, draw, generate. Most single-page documents are done in under 10 seconds. Multi-page documents take longer to render previews but the redaction generation itself is quick. No waiting on a server — it runs locally in your browser.",
  },
  {
    q: "Is the redaction permanent?",
    a: "Yes. Once you generate a clean PDF, the blocked areas are baked in. The original file is never modified — you always get a new clean copy. The preview shows a semi-transparent blue box so you can verify placement before committing. After generation, those areas are fully opaque and unrecoverable.",
  },
]

export default function HomePage() {
  const [paOpen, setPaOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <PublicHeader />

      {/* ── PA Update Modal ────────────────────────────── */}
      {paOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(2, 8, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setPaOpen(false)}
        >
          <div
            style={{
              background: '#080F1A',
              border: '1px solid rgba(0, 200, 240, 0.22)',
              borderRadius: '14px',
              padding: '40px 36px',
              maxWidth: '580px',
              width: '100%',
              position: 'relative',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setPaOpen(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--dm-sans, sans-serif)',
                fontSize: '12px', fontWeight: 600,
                padding: '5px 10px', cursor: 'pointer',
                transition: 'color 0.15s',
              }}
            >
              Close
            </button>

            <span className="label" style={{ marginBottom: '14px' }}>Pennsylvania Update</span>
            <h2 style={{
              fontFamily: 'var(--dm-sans, sans-serif)',
              fontSize: 'clamp(20px, 3vw, 26px)',
              fontWeight: 700,
              letterSpacing: '-0.018em',
              color: 'var(--text-primary)',
              marginBottom: '16px',
              lineHeight: 1.15,
            }}>
              Pennsylvania Notary Workflow Update<br />
              <span style={{ color: 'var(--cyan)', fontSize: '0.85em' }}>Effective March 28, 2026</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.75' }}>
                Pennsylvania has updated guidance around document-handling workflows for notaries,
                placing increased attention on how sensitive information is handled during front-end
                processing steps before documents enter official workflows.
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.75' }}>
                Operators are expected to exercise greater care around unnecessary exposure of
                personally identifiable information (PII) during document intake and pre-submission
                stages. This includes redacting or sanitizing sensitive fields before documents
                move into downstream handling.
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.75' }}>
                Specterfy is positioned as a pre-ingestion privacy utility to assist with this step.
                It is not a compliance guarantee, legal platform, or state-approved system.
                Final responsibility for compliance rests with the operator.
              </p>
              <div style={{
                background: 'rgba(0,200,240,0.05)',
                border: '1px solid rgba(0,200,240,0.15)',
                borderRadius: '8px',
                padding: '14px 16px',
              }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.65' }}>
                  This summary is for informational purposes only and does not constitute legal advice.
                  Consult a qualified attorney for guidance specific to your practice and obligations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="page-wrap">

        {/* ── HERO ─────────────────────── */}
        <section className="hero-section">
          <div className="container">

            <button
              className="hero-pa-pill"
              onClick={() => setPaOpen(true)}
              style={{
                background: 'rgba(0, 200, 240, 0.07)',
                border: '1px solid rgba(0, 200, 240, 0.18)',
                borderRadius: '100px',
                padding: '6px 14px 6px 10px',
                marginBottom: '40px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'background 0.16s, border-color 0.16s',
                outline: 'none',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,200,240,0.12)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,200,240,0.3)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,200,240,0.07)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,200,240,0.18)'
              }}
            >
              <span className="hero-pa-dot" />
              <span className="hero-pa-text">
                Pennsylvania update
                <span className="hero-pa-date">&nbsp; March 28, 2026</span>
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-faint)', marginLeft: '4px' }}>↗</span>
            </button>

            <div style={{ marginBottom: '32px' }}>
              <Image
                src="/specterfy-logo.png"
                alt="Specterfy"
                width={280}
                height={100}
                style={{ width: 'clamp(180px, 30vw, 280px)', height: 'auto', opacity: 0.92 }}
                priority
              />
            </div>

            <h1 className="hero-headline">
              Clean sensitive PDFs<br />
              before they become<br />
              a workflow liability.
            </h1>

            <p className="hero-sub">
              A pre-ingestion privacy utility for Pennsylvania notaries.
              Sanitize. Review. Move clean.
            </p>

            <div className="hero-ctas">
              <Link href="/signup" className="btn-primary">Start free</Link>
              <Link href="/pricing" className="btn-secondary">View pricing</Link>
            </div>

          </div>
        </section>

        {/* ── WHAT IT IS ───────────────── */}
        <section className="what-section">
          <div className="container">
            <p className="label" style={{ marginBottom: '28px' }}>What it is</p>
            <div className="what-grid">
              <div>
                <h2 className="what-statement">
                  Serious utility.<br />
                  Cleaner positioning.<br />
                  Lower visual friction.
                </h2>
              </div>
              <div className="what-descriptors">
                {[
                  { n: '01', t: 'Privacy pre-processor' },
                  { n: '02', t: 'Document sanitization utility' },
                  { n: '03', t: 'Clean-copy generator' },
                  { n: '04', t: 'Workflow helper' },
                ].map(i => (
                  <div key={i.n} className="what-item">
                    <span className="what-num">{i.n}</span>
                    <span className="what-text">{i.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY IT MATTERS ───────────── */}
        <section className="why-section">
          <div className="container">
            <div className="why-header">
              <p className="label">Why it matters</p>
              <h2 className="why-headline">
                Less clutter.<br />
                Stronger first impression.
              </h2>
            </div>
            <div className="why-grid">
              {[
                { n: '01', t: 'Cleaner front-end handling', b: 'Reduce exposure before documents move deeper into your workflow.' },
                { n: '02', t: 'Sharper public posture', b: 'Utility-first framing instead of bloated platform language.' },
                { n: '03', t: 'Fast path to action', b: 'Simple account flow, clear pricing, direct entry points.' },
              ].map(i => (
                <div key={i.n} className="why-item">
                  <div className="why-num">{i.n}</div>
                  <div className="why-title">{i.t}</div>
                  <p className="why-body">{i.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────── */}
        <section className="faq-section">
          <div className="container">
            <div className="faq-header">
              <p className="label">Common questions</p>
              <h2 className="faq-headline">Straight answers.<br />No fluff.</h2>
            </div>
            <div className="faq-list">
              {FAQ_ITEMS.map((item, idx) => (
                <div key={idx} className="faq-item">
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    aria-expanded={openFaq === idx}
                  >
                    <span>{item.q}</span>
                    <span className="faq-chevron" style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="faq-answer">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING STRIP ────────────── */}
        <section className="pricing-section">
          <div className="container">
            <div className="pricing-header">
              <p className="label">Pricing</p>
              <h2 className="pricing-headline">Start free. Upgrade when you need more.</h2>
              <p className="pricing-sub">5 sanitizes per day at no cost. Unlimited for $9.97/mo.</p>
            </div>
            <div className="pricing-cards">
              <div className="pricing-card">
                <div className="pricing-badge">Starter</div>
                <div className="pricing-price">Free</div>
                <p className="pricing-desc">5 sanitizes per day. No card required.</p>
                <Link href="/signup" className="btn-secondary" style={{ marginTop: 'auto' }}>Start free</Link>
              </div>
              <div className="pricing-card featured">
                <div className="pricing-badge">Monthly</div>
                <div className="pricing-price">$9.97<span className="pricing-per">/mo</span></div>
                <p className="pricing-desc">Unlimited sanitization. No daily cap.</p>
                <Link href="/pricing" className="btn-primary btn-full" style={{ marginTop: 'auto' }}>Choose monthly</Link>
              </div>
              <div className="pricing-card">
                <div className="pricing-badge">Yearly</div>
                <div className="pricing-price">$89<span className="pricing-per">/yr</span></div>
                <p className="pricing-desc">Unlimited sanitization. Best value.</p>
                <Link href="/pricing" className="btn-secondary" style={{ marginTop: 'auto' }}>Choose yearly</Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </>
  )
}
