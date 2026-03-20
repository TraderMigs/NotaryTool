'use client'

import Link from 'next/link'
import { useState } from 'react'
import PublicHeader from '../../components/PublicHeader'
import { signUp } from '@/lib/auth'

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) { setError('You must agree to the Terms, Privacy Policy, and Disclaimer.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setError('')
    setLoading(true)

    const { error: authError } = await signUp(email, password)

    if (authError) {
      setError(authError.message ?? 'Sign up failed. Please try again.')
      setLoading(false)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <>
        <PublicHeader />
        <div className="auth-page">
          <div className="auth-split" style={{ maxWidth: '520px', gridTemplateColumns: '1fr' }}>
            <div style={{ padding: '52px 44px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span className="label">Check your email</span>
              <h1 style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--text-primary)' }}>
                Confirm your account
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                We sent a confirmation link to <strong style={{ color: 'var(--text-secondary)' }}>{email}</strong>.
                Click the link in that email to activate your account, then sign in.
              </p>
              <div style={{ background: 'var(--cyan-glow)', border: '1px solid var(--border-cyan)', borderRadius: '8px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.65' }}>
                  Check your spam folder if it doesn't arrive within a minute.
                </p>
              </div>
              <Link href="/sign-in" className="btn-primary btn-full" style={{ marginTop: '4px' }}>
                Go to sign in
              </Link>
            </div>
          </div>
        </div>
      </>
    )
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
              <p className="auth-left-sub">Free to start. 5 sanitizes per day. No card required.</p>

              <div className="auth-left-perks">
                {['5 free sanitizes per day', 'No credit card required', 'Upgrade anytime'].map(p => (
                  <div key={p} className="auth-left-perk">
                    <span className="auth-perk-dot">✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="auth-left-footer">
              <p>
                Specterfy is a privacy pre-processor. Not a legal compliance platform.
                You remain responsible for all output review and downstream handling.
              </p>
            </div>
          </div>

          <div className="auth-right">
            <div>
              <div className="auth-form-title">Get started</div>
              <div className="auth-form-sub">Create your free Specterfy account.</div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(255,80,80,0.08)',
                border: '1px solid rgba(255,80,80,0.2)',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '13px',
                color: '#FF8080',
                lineHeight: '1.5',
              }}>
                {error}
              </div>
            )}

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
                  disabled={loading}
                />
              </div>

              <div className="field-wrap">
                <label className="field-label" htmlFor="signup-password">Password</label>
                <div className="pw-wrap">
                  <input
                    id="signup-password"
                    type={showPw ? 'text' : 'password'}
                    className="field-input field-input-pw"
                    placeholder="Create a password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: 'var(--cyan)', flexShrink: 0 }}
                  disabled={loading}
                />
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  I agree to the{' '}
                  <Link href="/terms" className="auth-link-cyan" style={{ fontSize: '12.5px' }}>Terms</Link>,{' '}
                  <Link href="/privacy" className="auth-link-cyan" style={{ fontSize: '12.5px' }}>Privacy Policy</Link>,
                  and{' '}
                  <Link href="/disclaimer" className="auth-link-cyan" style={{ fontSize: '12.5px' }}>Disclaimer</Link>.
                </span>
              </label>

              <button
                type="submit"
                className="btn-primary btn-full"
                style={{ marginTop: '4px', opacity: loading ? 0.6 : 1 }}
                disabled={loading}
              >
                {loading ? 'Creating account…' : 'Create account'}
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
