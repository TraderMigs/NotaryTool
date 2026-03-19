'use client'

import Link from 'next/link'
import { useState } from 'react'
import PublicHeader from '../../components/PublicHeader'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Auth wiring — Phase 3
  }

  return (
    <>
      <PublicHeader />
      <div className="auth-page">
        <div className="auth-split">

          <div className="auth-left">
            <div className="auth-left-content">
              <div className="auth-left-label">
                <span className="label">Account access</span>
              </div>
              <h1 className="auth-left-headline">Sign in</h1>
              <p className="auth-left-sub">
                Secure access to your Specterfy workspace.
              </p>
            </div>
            <div className="auth-left-footer">
              <p>
                Specterfy is a privacy pre-processor for document sanitization.
                It is not a notary journal or legal compliance platform.
                You remain responsible for all output review.
              </p>
            </div>
          </div>

          <div className="auth-right">
            <div>
              <div className="auth-form-title">Welcome back</div>
              <div className="auth-form-sub">Enter your credentials to continue.</div>
            </div>

            <form onSubmit={handleSubmit} className="auth-fields">
              <div className="field-wrap">
                <label className="field-label" htmlFor="email">Email</label>
                <input
                  id="email"
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
                <label className="field-label" htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    className="field-input"
                    placeholder="Your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    style={{ paddingRight: '52px' }}
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary btn-full" style={{ marginTop: '4px' }}>
                Continue
              </button>
            </form>

            <div className="auth-meta">
              <Link href="/forgot" className="auth-link">Forgot password?</Link>
              <Link href="/signup" className="auth-link auth-link-cyan">Create account</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
