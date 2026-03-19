'use client'

import Link from 'next/link'
import { useState } from 'react'
import PublicHeader from '../../components/PublicHeader'

export default function RecoverPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [done, setDone] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) return
    // Auth wiring in Phase 3
    setDone(true)
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
              <h1 className="auth-left-headline">Set a new password</h1>
              <p className="auth-left-sub">
                Choose a strong password for your Specterfy account.
              </p>
            </div>
            <div className="auth-left-footer">
              <p>
                After resetting, you will be redirected to sign in with your new credentials.
              </p>
            </div>
          </div>

          <div className="auth-right">
            {!done ? (
              <>
                <div>
                  <div className="auth-form-title">New password</div>
                  <div className="auth-form-sub" style={{ marginTop: '4px' }}>
                    Must be at least 8 characters.
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-fields">
                  <div className="field-wrap">
                    <label className="field-label" htmlFor="new-password">New password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="new-password"
                        type={showPw ? 'text' : 'password'}
                        className="field-input"
                        placeholder="New password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        minLength={8}
                        required
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

                  <div className="field-wrap">
                    <label className="field-label" htmlFor="confirm-password">Confirm password</label>
                    <input
                      id="confirm-password"
                      type={showPw ? 'text' : 'password'}
                      className="field-input"
                      placeholder="Confirm password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      minLength={8}
                      required
                    />
                    {confirm.length > 0 && password !== confirm && (
                      <span style={{ fontSize: '12px', color: '#FF6B6B', marginTop: '4px' }}>
                        Passwords do not match.
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn-primary btn-full"
                    style={{ marginTop: '4px' }}
                    disabled={password !== confirm && confirm.length > 0}
                  >
                    Update password
                  </button>
                </form>
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
                    Password updated
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
                    Your password has been changed. You can now sign in with your new credentials.
                  </p>
                </div>
                <Link href="/sign-in" className="btn-primary btn-full">
                  Sign in
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
