'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PublicHeader from '../../components/PublicHeader'
import { signIn } from '@/lib/auth'

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

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await signIn(email, password)

    if (authError) {
      setError(authError.message ?? 'Sign in failed. Check your email and password.')
      setLoading(false)
      return
    }

    router.push('/sanitize')
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
              <p className="auth-left-sub">Secure access to your Specterfy workspace.</p>
            </div>
            <div className="auth-left-footer">
              <p>
                Specterfy is a privacy pre-processor for document sanitization.
                Not a notary journal or legal compliance platform.
                You remain responsible for all output review.
              </p>
            </div>
          </div>

          <div className="auth-right">
            <div>
              <div className="auth-form-title">Welcome back</div>
              <div className="auth-form-sub">Enter your credentials to continue.</div>
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
                  disabled={loading}
                />
              </div>

              <div className="field-wrap">
                <label className="field-label" htmlFor="password">Password</label>
                <div className="pw-wrap">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    className="field-input field-input-pw"
                    placeholder="Your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
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

              <button
                type="submit"
                className="btn-primary btn-full"
                style={{ marginTop: '4px', opacity: loading ? 0.6 : 1 }}
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Continue'}
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
