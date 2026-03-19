'use client'

import Link from 'next/link'
import { useState } from 'react'
import PublicHeader from '../../components/PublicHeader'

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

export default function RecoverPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [done, setDone] = useState(false)

  const mismatch = confirm.length > 0 && password !== confirm

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mismatch) return
    setDone(true)
  }

  return (
    <>
      <PublicHeader />
      <div className="auth-page">
        <div className="auth-split">
          <div className="auth-left">
            <div className="auth-left-content">
              <div className="auth-left-label"><span className="label">Account recovery</span></div>
              <h1 className="auth-left-headline">Set a new password</h1>
              <p className="auth-left-sub">Choose a strong password for your Specterfy account.</p>
            </div>
            <div className="auth-left-footer">
              <p>After resetting, you will be redirected to sign in with your new credentials.</p>
            </div>
          </div>

          <div className="auth-right">
            {!done ? (
              <>
                <div>
                  <div className="auth-form-title">New password</div>
                  <div className="auth-form-sub">Must be at least 8 characters.</div>
                </div>
                <form onSubmit={handleSubmit} className="auth-fields">
                  <div className="field-wrap">
                    <label className="field-label" htmlFor="new-pw">New password</label>
                    <div className="pw-wrap">
                      <input
                        id="new-pw"
                        type={showPw ? 'text' : 'password'}
                        className="field-input field-input-pw"
                        placeholder="New password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        minLength={8}
                        required
                      />
                      <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                  <div className="field-wrap">
                    <label className="field-label" htmlFor="confirm-pw">Confirm password</label>
                    <div className="pw-wrap">
                      <input
                        id="confirm-pw"
                        type={showPw ? 'text' : 'password'}
                        className="field-input field-input-pw"
                        placeholder="Confirm password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        minLength={8}
                        required
                      />
                      <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {mismatch && <span style={{ fontSize: '12px', color: '#FF7070', marginTop: '2px' }}>Passwords do not match.</span>}
                  </div>
                  <button type="submit" className="btn-primary btn-full" style={{ marginTop: '4px' }} disabled={mismatch}>
                    Update password
                  </button>
                </form>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ background: 'var(--cyan-glow)', border: '1px solid var(--border-cyan)', borderRadius: '10px', padding: '20px' }}>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--cyan)', marginBottom: '6px' }}>Password updated</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Your password has been changed. Sign in with your new credentials.</p>
                </div>
                <Link href="/sign-in" className="btn-primary btn-full">Sign in</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
