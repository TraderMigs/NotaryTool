'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PublicHeader from '../../components/PublicHeader'
import PublicFooter from '../../components/PublicFooter'
import { getUser, getSession, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

type PlanRow = {
  plan: 'free' | 'monthly' | 'yearly'
  status: 'active' | 'past_due' | 'cancelled' | null
  stripe_subscription_id: string | null
}

// Inner component uses useSearchParams — must be inside Suspense
function AccountInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const planParam = searchParams.get('plan')

  const [email, setEmail] = useState('')
  const [planRow, setPlanRow] = useState<PlanRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<'monthly' | 'yearly' | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    async function load() {
      const user = await getUser()
      if (!user) { router.push('/sign-in'); return }

      setEmail(user.email ?? '')
      setIsOwner(user.email === 'infiniappsofficial@gmail.com')

      if (supabase) {
        const { data } = await supabase
          .from('user_plans')
          .select('plan, status, stripe_subscription_id')
          .eq('user_id', user.id)
          .single()
        setPlanRow(data ?? null)
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handleUpgrade(plan: 'monthly' | 'yearly') {
    setUpgrading(plan)
    try {
      const session = await getSession()
      const token = session?.access_token
      if (!token) { router.push('/sign-in'); return }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      })

      const { url, error } = await res.json()
      if (error) { alert(error); setUpgrading(null); return }
      window.location.href = url
    } catch {
      alert('Failed to start checkout. Please try again.')
      setUpgrading(null)
    }
  }

  const effectivePlan = isOwner ? 'lifetime' : (planRow?.plan ?? 'free')
  const isActive = isOwner || planRow?.status === 'active'
  const isPaid = isActive && effectivePlan !== 'free'

  const planLabel: Record<string, string> = {
    free: 'Free — 5 sanitizes/day',
    monthly: 'Monthly — $9.97/mo unlimited',
    yearly: 'Yearly — $89/yr unlimited',
    lifetime: 'Lifetime — Unlimited (Owner)',
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '80px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading account…</p>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '100px' }}>

      {/* Back nav */}
      <div className="back-nav">
        <Link href="/" className="btn-ghost">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Home
        </Link>
        <span className="back-nav-divider" />
        <Link href="/sanitize" className="btn-ghost">Sanitize tool</Link>
        <span className="back-nav-divider" />
        <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
      </div>

      {/* Payment success banner */}
      {paymentSuccess && (
        <div style={{ background: 'var(--cyan-glow)', border: '1px solid var(--border-cyan)', borderRadius: '10px', padding: '16px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)', flexShrink: 0 }} />
          <p style={{ fontSize: '14px', color: 'var(--cyan-dim)', margin: 0 }}>
            Payment confirmed. Your <strong style={{ color: 'var(--cyan)' }}>{planParam}</strong> plan is now active. Unlimited sanitization is unlocked.
          </p>
        </div>
      )}

      <span className="label" style={{ marginBottom: '12px' }}>Account</span>
      <h1 style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--text-primary)', marginBottom: '40px' }}>
        Your workspace
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '680px' }}>

        {/* Account info */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: 'var(--text-faint)', marginBottom: '6px' }}>Email</div>
            <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500 }}>{email}</div>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: 'var(--text-faint)', marginBottom: '6px' }}>Current plan</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500 }}>{planLabel[effectivePlan]}</span>
              {isPaid && (
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, background: 'var(--cyan-glow)', border: '1px solid var(--border-cyan)', color: 'var(--cyan)', borderRadius: '4px', padding: '2px 7px' }}>Active</span>
              )}
              {planRow?.status === 'past_due' && (
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.2)', color: 'rgba(255,200,80,0.8)', borderRadius: '4px', padding: '2px 7px' }}>Past due</span>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade section */}
        {!isPaid && !isOwner && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: 'var(--cyan)', marginBottom: '14px' }}>Upgrade to unlimited</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(0,200,240,0.05)', border: '1px solid var(--border-cyan)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--cyan)', marginBottom: '8px' }}>Monthly</div>
                <div style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>$9.97<span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>Unlimited sanitization. Cancel anytime.</p>
                <button type="button" className="btn-primary btn-full" style={{ fontSize: '13px', padding: '9px 16px', opacity: upgrading ? 0.6 : 1 }} onClick={() => handleUpgrade('monthly')} disabled={!!upgrading}>
                  {upgrading === 'monthly' ? 'Redirecting…' : 'Choose monthly'}
                </button>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: '8px' }}>Yearly</div>
                <div style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>$89<span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 400 }}>/yr</span></div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>Unlimited. Equiv. $7.42/mo. Best value.</p>
                <button type="button" className="btn-secondary btn-full" style={{ fontSize: '13px', padding: '9px 16px', opacity: upgrading ? 0.6 : 1 }} onClick={() => handleUpgrade('yearly')} disabled={!!upgrading}>
                  {upgrading === 'yearly' ? 'Redirecting…' : 'Choose yearly'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Billing portal for paid users */}
        {isPaid && !isOwner && planRow?.stripe_subscription_id && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Manage billing</div>
              <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '3px' }}>Cancel or update your subscription via Stripe.</div>
            </div>
            <a href="https://billing.stripe.com/p/login/aFafZjeAjbwVgnN9wCafS00" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: '13px', padding: '9px 16px' }}>
              Billing portal →
            </a>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <Link href="/sanitize" className="btn-primary">Open tool</Link>
          <button type="button" onClick={signOut} className="btn-secondary">Sign out</button>
        </div>

      </div>
    </div>
  )
}

// Outer page wraps inner in Suspense — required for useSearchParams in Next.js 14
export default function AccountPage() {
  return (
    <>
      <PublicHeader />
      <main className="page-wrap">
        <Suspense fallback={
          <div className="container" style={{ paddingTop: '80px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
          </div>
        }>
          <AccountInner />
        </Suspense>
      </main>
      <PublicFooter />
    </>
  )
}
