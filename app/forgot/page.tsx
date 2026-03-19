'use client'

import Link from 'next/link'
import { useState } from 'react'
import PublicHeader from '../../components/PublicHeader'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Auth wiring in Phase 3
    setSent(true)
  }

  return (
    <>
      <PublicHeader />
      <div className="auth-page">
        <div className="auth-split">

          <div className="auth-left">
            <div className="auth-left-content">
              <div className="auth-left-label">
                <span className="label">Account recovery</span>
              </div>
              <h1 className="auth-left-headline">Reset your password</h1>
              <p className="auth-left-sub">
                Enter the email tied to your account. A reset link will be sent if it exists.
              </p>
            </div>
            <div className="auth-left-footer">
              <p>
                For security, reset links expire after 60 minutes.
                Check your spam folder if the email does not arrive.
              </p>
            </div>
          </div>

          <div className="auth-right">
            {!sent ? (
              <>
                <div>
                  <div className="auth-form-title">Forgot password</div>
                  <div className="auth-form-sub" style={{ marginTop: '4px' }}>
                    We will send a reset link to your email.
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-fields">
                  <div className="field-wrap">
                    <label className="field-label" htmlFor="forgot-email">Email</label>
                    <input
                      id="forgot-email"
                      type="email"
                      className="field-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary btn-full" style={{ marginTop: '4px' }}>
                    Send reset link
                  </button>
                </form>

                <div className="auth-meta">
                  <Link href="/sign-in" className="auth-link">Back to sign in</Link>
                  <Link href="/signup" className="auth-link auth-link-cyan">Create account</Link>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  background: 'var(--cyan-glow)',
                  border: '1px solid var(--border-cyan)',
                  borderRadius: '10px',
                  padding: '20px 22px',
                }}>
                  <p style={{
                    fontFamily: 'var(--syne, sans-serif)', fontWeight: 700,
                    fontSize: '14px', color: 'var(--cyan)', marginBottom: '6px',
                  }}>
                    Reset link sent
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
                    If an account exists for <strong style={{ color: 'var(--text-secondary)' }}>{email}</strong>,
                    a reset link has been sent. Check your inbox and spam folder.
                  </p>
                </div>
                <Link href="/sign-in" className="btn-secondary btn-full">
                  Back to sign in
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
