'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function PublicHeader() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="site-logo" onClick={() => setOpen(false)}>
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M14 2.5L3.5 7.8V14C3.5 19.6 8.2 24.7 14 26.5C19.8 24.7 24.5 19.6 24.5 14V7.8L14 2.5Z"
                  stroke="url(#sg)" strokeWidth="1.4" fill="none"
                />
                <circle cx="14" cy="13" r="3" fill="url(#sg)" opacity="0.85" />
                <path
                  d="M14 16.8C11.2 16.8 9 18.5 9 18.5L14 24.5L19 18.5C19 18.5 16.8 16.8 14 16.8Z"
                  fill="url(#sg)" opacity="0.55"
                />
                <defs>
                  <linearGradient id="sg" x1="3.5" y1="2.5" x2="24.5" y2="26.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00D4FF" />
                    <stop offset="1" stopColor="#0070FF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="logo-text-wrap">
              <span className="logo-name">Specterfy</span>
              <span className="logo-tag">Privacy Pre-Processor</span>
            </div>
          </Link>

          <nav className="header-nav">
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="/sign-in" className="nav-link">Log in</Link>
            <Link href="/signup" className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
              Start free
            </Link>
          </nav>

          <button
            className="mobile-toggle"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {open && (
        <nav className="mobile-nav-drawer">
          <Link href="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/sign-in" onClick={() => setOpen(false)}>Log in</Link>
          <Link
            href="/signup"
            className="btn-primary"
            style={{ textAlign: 'center', marginTop: '4px' }}
            onClick={() => setOpen(false)}
          >
            Start free
          </Link>
        </nav>
      )}
    </>
  )
}
