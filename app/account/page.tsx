'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PublicHeader from '../../components/PublicHeader'
import PublicFooter from '../../components/PublicFooter'
import { getUser, getSession, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const OWNER_EMAIL = 'infiniappsofficial@gmail.com'
const MONTHLY_PRICE = 9.97
const YEARLY_PRICE = 89

type PlanRow = {
  plan: 'free' | 'monthly' | 'yearly'
  status: 'active' | 'past_due' | 'cancelled' | null
  stripe_subscription_id: string | null
}

type AdminUser = {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  plan: string | null
  status: string | null
  total_sanitizes: number
}

// ── Admin Tab ────────────────────────────────────────────────

function AdminTab() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => { loadUsers() }, [])

  async function getToken() {
    const { data } = await supabase!.auth.getSession()
    return data.session?.access_token ?? ''
  }

  async function loadUsers() {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const json = await res.json()
      if (json.users) setUsers(json.users as AdminUser[])
    } catch (err) {
      console.error('Failed to load admin users:', err)
    }
    setLoading(false)
  }

  async function overridePlan(userId: string, plan: string) {
    try {
      const token = await getToken()
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId, plan }),
      })
      const json = await res.json()
      if (json.error) { setMsg(`Error: ${json.error}`); return }
      setMsg(`Plan set to ${plan}`)
      setTimeout(() => setMsg(''), 2500)
      await loadUsers()
    } catch {
      setMsg('Override failed.')
      setTimeout(() => setMsg(''), 2500)
    }
  }

  function exportCSV() {
    const header = ['Email', 'Plan', 'Status', 'Total Sanitizes', 'Created']
    const rows = users.map(u => [
      u.email, u.plan ?? 'free', u.status ?? 'active', u.total_sanitizes,
      new Date(u.created_at).toLocaleDateString(),
    ])
    const csv = [header, ...rows].map(r => r.map(String).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `specterfy-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filtered = users.filter(u =>
    (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.plan ?? '').includes(search.toLowerCase())
  )

  const paidMonthly = users.filter(u => u.plan === 'monthly' && u.status === 'active').length
  const paidYearly = users.filter(u => u.plan === 'yearly' && u.status === 'active').length
  const mrr = (paidMonthly * MONTHLY_PRICE) + (paidYearly * (YEARLY_PRICE / 12))
  const totalFilesProcessed = users.reduce((s, u) => s + (u.total_sanitizes ?? 0), 0)
  const totalRevenue = (paidMonthly * MONTHLY_PRICE) + (paidYearly * YEARLY_PRICE)

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading users…</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '1px', background: 'var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {[
          { label: 'Total users', value: users.length },
          { label: 'Free', value: users.filter(u => !u.plan || u.plan === 'free').length },
          { label: 'Monthly paid', value: paidMonthly },
          { label: 'Yearly paid', value: paidYearly },
          { label: 'Files processed', value: totalFilesProcessed },
          { label: 'MRR', value: `$${mrr.toFixed(2)}` },
          { label: 'Total revenue', value: `$${totalRevenue.toFixed(2)}` },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', padding: '18px 16px' }}>
            <div style={{ fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: 'var(--cyan)', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="field-input"
          placeholder="Search by email or plan…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '280px', flex: 1 }}
        />
        <button type="button" className="btn-secondary" onClick={exportCSV} style={{ fontSize: '13px', padding: '9px 16px' }}>
          Export CSV
        </button>
        {msg && <span style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 500 }}>{msg}</span>}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.7fr 1.2fr', gap: '0', borderBottom: '1px solid var(--border)', padding: '10px 16px', minWidth: '600px' }}>
          {['Email', 'Plan', 'Status', 'Uses', 'Override'].map(h => (
            <div key={h} style={{ fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: 'var(--text-faint)' }}>{h}</div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            {search ? 'No users match.' : 'No users yet.'}
          </div>
        ) : filtered.map((u, i) => (
          <div key={u.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.7fr 1.2fr', gap: '0',
            padding: '11px 16px', alignItems: 'center',
            borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
            minWidth: '600px',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', wordBreak: 'break-all', paddingRight: '10px' }}>{u.email || '—'}</div>
            <div>
              <span style={{
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                borderRadius: '4px', padding: '2px 7px',
                background: (u.plan === 'monthly' || u.plan === 'yearly') ? 'var(--cyan-glow)' : 'rgba(255,255,255,0.05)',
                border: (u.plan === 'monthly' || u.plan === 'yearly') ? '1px solid var(--border-cyan)' : '1px solid var(--border)',
                color: (u.plan === 'monthly' || u.plan === 'yearly') ? 'var(--cyan)' : 'var(--text-muted)',
              }}>{u.plan ?? 'free'}</span>
            </div>
            <div style={{ fontSize: '12px', color: u.status === 'past_due' ? 'rgba(255,200,80,0.8)' : 'var(--text-muted)' }}>{u.status ?? 'active'}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{u.total_sanitizes}</div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {['free', 'monthly', 'yearly'].map(plan => (
                <button key={plan} type="button"
                  onClick={() => overridePlan(u.id, plan)}
                  disabled={u.plan === plan || (!u.plan && plan === 'free')}
                  style={{
                    fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '10px', fontWeight: 600,
                    padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', background: 'none',
                    border: '1px solid var(--border)', color: 'var(--text-muted)', textTransform: 'capitalize' as const,
                    opacity: (u.plan === plan || (!u.plan && plan === 'free')) ? 0.35 : 1,
                  }}
                >{plan}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
        Override changes user_plans table directly. All actions are permanent.
      </p>
    </div>
  )
}

// ── Main Account Page ────────────────────────────────────────

function AccountInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const planParam = searchParams.get('plan')
  const defaultTab = searchParams.get('tab') ?? 'account'

  const [activeTab, setActiveTab] = useState(defaultTab)
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
      const ownerCheck = user.email === OWNER_EMAIL
      setIsOwner(ownerCheck)
      if (supabase) {
        const { data } = await supabase.from('user_plans').select('plan, status, stripe_subscription_id').eq('user_id', user.id).single()
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      })
      const { url, error } = await res.json()
      if (error) { alert(error); setUpgrading(null); return }
      window.location.href = url
    } catch { alert('Failed to start checkout. Please try again.'); setUpgrading(null) }
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

  if (loading) return (
    <div className="container" style={{ paddingTop: '80px' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading account…</p>
    </div>
  )

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '100px' }}>

      <div className="back-nav">
        <Link href="/" className="btn-ghost">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          Home
        </Link>
        <span className="back-nav-divider" />
        <Link href="/sanitize" className="btn-ghost">Sanitize tool</Link>
        <span className="back-nav-divider" />
        <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
      </div>

      {paymentSuccess && (
        <div style={{ background: 'var(--cyan-glow)', border: '1px solid var(--border-cyan)', borderRadius: '10px', padding: '16px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)', flexShrink: 0 }} />
          <p style={{ fontSize: '14px', color: 'var(--cyan-dim)', margin: 0 }}>
            Payment confirmed. Your <strong style={{ color: 'var(--cyan)' }}>{planParam}</strong> plan is now active. Unlimited sanitization is unlocked.
          </p>
        </div>
      )}

      <span className="label" style={{ marginBottom: '12px' }}>Account</span>
      <h1 style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--text-primary)', marginBottom: '32px' }}>
        Your workspace
      </h1>

      <div className="account-tabs">
        <button type="button" className={`account-tab ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
          Account
        </button>
        <button type="button" className={`account-tab ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTab('billing')}>
          Billing
        </button>
        {isOwner && (
          <button type="button" className={`account-tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
            Admin
          </button>
        )}
      </div>

      {activeTab === 'account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '620px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: 'var(--text-faint)', marginBottom: '6px' }}>Email</div>
              <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500 }}>{email}</div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: 'var(--text-faint)', marginBottom: '6px' }}>Current plan</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500 }}>{planLabel[effectivePlan]}</span>
                {isPaid && <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, background: 'var(--cyan-glow)', border: '1px solid var(--border-cyan)', color: 'var(--cyan)', borderRadius: '4px', padding: '2px 7px' }}>Active</span>}
                {planRow?.status === 'past_due' && <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.2)', color: 'rgba(255,200,80,0.8)', borderRadius: '4px', padding: '2px 7px' }}>Past due</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/sanitize" className="btn-primary">Open tool</Link>
            <button type="button" onClick={signOut} className="btn-secondary">Sign out</button>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '620px' }}>
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
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>Unlimited. $7.42/mo equivalent.</p>
                  <button type="button" className="btn-secondary btn-full" style={{ fontSize: '13px', padding: '9px 16px', opacity: upgrading ? 0.6 : 1 }} onClick={() => handleUpgrade('yearly')} disabled={!!upgrading}>
                    {upgrading === 'yearly' ? 'Redirecting…' : 'Choose yearly'}
                  </button>
                </div>
              </div>
            </div>
          )}

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

          {isOwner && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-cyan)', borderRadius: '12px', padding: '20px 24px' }}>
              <div style={{ fontSize: '14px', color: 'var(--cyan)', fontWeight: 600 }}>Owner — Lifetime access</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>No billing required. Unlimited access permanently.</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'admin' && isOwner && <AdminTab />}

    </div>
  )
}

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
