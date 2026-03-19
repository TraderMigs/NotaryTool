'use client'

import Link from 'next/link'
import { useState } from 'react'
import PublicHeader from '../../components/PublicHeader'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [agreed, setAgreed] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Auth wiring in Phase 3
  }

  return (
    <>
      <PublicHeader />
      <div className="auth-page">
        <div className="auth-split">

          <div className="auth-left">
            <div className="auth-left-content">
              <div className="auth-left-label">
                <span className="label">New account</span>
              </div>
              <h1 className="auth-left-headline">Create your workspace</h1>
              <p className="auth-left-sub">
                Free to start. 5 sanitizes per day. No card required.
              </p>

              <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: 'var(--cyan-glow)', border: '1px solid var(--border-cyan)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '9px', color: 'var(--cyan)' }}>✓</span>
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>5 free sanitizes per day</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: 'var(--cyan-glow)', border: '1px solid var(--border-cyan)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '9px', color: 'var(--cyan)' }}>✓</span>
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No credit card required</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: 'var(--cyan-glow)', border: '1px solid var(--border-cyan)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '9px', color: 'var(--cyan)' }}>✓</span>
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Upgrade anytime</span>
                </div>
              </div>
            </div>
            <div className="auth-left-footer">
              <p>
                Specterfy is a privacy pre-processor. It is not a legal compliance platform.
                You remain responsible for all output review and downstream handling.
              </p>
            </div>
          </div>

          <div className="auth-right">
            <div>
              <div className="auth-form-title">Get started</div>
              <div className="auth-form-sub" style={{ marginTop: '4px' }}>Create your free Specterfy account.</div>
            </div>

            <form onSubmit={handleSubmit} className="auth-fields">
              <div className="field-wrap">
                <label className="field-label" htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  className="field-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="field-wrap">
                <label className="field-label" htmlFor="signup-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-password"
                    type={showPw ? 'text' : 'password'}
                    className="field-input"
                    placeholder="Create a password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{
                      position: 'absolute', right: '13px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-faint)', fontSize: '12px',
                      fontFamily: 'var(--syne, sans-serif)', fontWeight: 600,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {showPw ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: 'var(--cyan)', flexShrink: 0 }}
                  required
                />
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  I agree to the{' '}
                  <Link href="/terms" className="auth-link-cyan" style={{ fontSize: '12.5px' }}>Terms</Link>
                  ,{' '}
                  <Link href="/privacy" className="auth-link-cyan" style={{ fontSize: '12.5px' }}>Privacy Policy</Link>
                  , and{' '}
                  <Link href="/disclaimer" className="auth-link-cyan" style={{ fontSize: '12.5px' }}>Disclaimer</Link>.
                </span>
              </label>

              <button type="submit" className="btn-primary btn-full" style={{ marginTop: '4px' }}>
                Create account
              </button>
            </form>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link href="/sign-in" className="auth-link auth-link-cyan">Sign in</Link>
              </span>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
