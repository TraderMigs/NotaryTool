'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function PublicHeader() {
  const [open, setOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    if (!supabase) return
    // Check initial session
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session)
    })
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="site-logo" onClick={() => setOpen(false)}>
            <Image
              src="/specterfy-logo.png"
              alt="Specterfy"
              height={30}
              width={106}
              className="logo-img"
              priority
            />
          </Link>

          <nav className="header-nav">
            <Link href="/pricing" className="nav-link">Pricing</Link>
            {loggedIn ? (
              <>
                <Link href="/account" className="nav-link">Account</Link>
                <Link
                  href="/sanitize"
                  className="btn-primary"
                  style={{ padding: '9px 18px', fontSize: '13px', marginLeft: '6px' }}
                >
                  Open tool
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="nav-link">Log in</Link>
                <Link
                  href="/signup"
                  className="btn-primary"
                  style={{ padding: '9px 18px', fontSize: '13px', marginLeft: '6px' }}
                >
                  Start free
                </Link>
              </>
            )}
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
          {loggedIn ? (
            <>
              <Link href="/account" onClick={() => setOpen(false)}>Account</Link>
              <Link
                href="/sanitize"
                className="btn-primary btn-full"
                onClick={() => setOpen(false)}
                style={{ padding: '12px 18px', marginTop: '4px' }}
              >
                Open tool
              </Link>
            </>
          ) : (
            <>
              <Link href="/sign-in" onClick={() => setOpen(false)}>Log in</Link>
              <Link
                href="/signup"
                className="btn-primary btn-full"
                onClick={() => setOpen(false)}
                style={{ padding: '12px 18px', marginTop: '4px' }}
              >
                Start free
              </Link>
            </>
          )}
        </nav>
      )}
    </>
  )
}
