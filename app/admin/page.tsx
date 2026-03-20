'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PublicHeader from '@/components/PublicHeader'

const OWNER_EMAIL = 'infiniappsofficial@gmail.com'
const MONTHLY_PRICE = 9.97
const YEARLY_PRICE = 89

type UserRow = {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  plan: string | null
  status: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  total_sanitizes: number
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserRow[]>([])
  const [search, setSearch] = useState('')
  const [overrideMsg, setOverrideMsg] = useState('')

  useEffect(() => {
    if (!supabase) { router.push('/sign-in'); return }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push('/sign-in'); return }
      if (data.session.user.email !== OWNER_EMAIL) { router.push('/'); return }
      await loadUsers()
      setLoading(false)
    })
  }, [router])

  async function loadUsers() {
    if (!supabase) return
    // Uses service role implicitly via client — RLS allows owner to read admin_user_summary
    // Fallback: direct join if view not available
    const { data, error } = await supabase
      .from('admin_user_summary')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      setUsers(data as UserRow[])
    } else {
      // Fallback: read user_plans and join manually
      const { data: plans } = await supabase
        .from('user_plans')
        .select('user_id, plan, status, stripe_customer_id, stripe_subscription_id, updated_at')
      setUsers(plans?.map((p: any) => ({
        id: p.user_id, email: '—', created_at: p.updated_at,
        last_sign_in_at: null, plan: p.plan, status: p.status,
        stripe_customer_id: p.stripe_customer_id,
        stripe_subscription_id: p.stripe_subscription_id,
        total_sanitizes: 0,
      })) ?? [])
    }
  }

  async function overridePlan(userId: string, plan: string) {
    if (!supabase) return
    setOverrideMsg('')
    const { error } = await supabase.from('user_plans').upsert({
      user_id: userId,
      plan,
      status: plan === 'free' ? 'cancelled' : 'active',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    if (error) {
      setOverrideMsg(`Error: ${error.message}`)
    } else {
      setOverrideMsg(`Plan updated to ${plan}`)
      await loadUsers()
    }
    setTimeout(() => setOverrideMsg(''), 3000)
  }

  function exportCSV() {
    const header = ['Email', 'Plan', 'Status', 'Total Sanitizes', 'Created', 'Last Sign In']
    const rows = users.map(u => [
      u.email,
      u.plan ?? 'free',
      u.status ?? 'active',
      u.total_sanitizes,
      new Date(u.created_at).toLocaleDateString(),
      u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : '—',
    ])
    const csv = [header, ...rows].map(r => r.map(String).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `specterfy-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const filtered = users.filter(u =>
    (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.plan ?? '').includes(search.toLowerCase())
  )

  const totalUsers = users.length
  const paidMonthly = users.filter(u => u.plan === 'monthly' && u.status === 'active').length
  const paidYearly = users.filter(u => u.plan === 'yearly' && u.status === 'active').length
  const freeUsers = users.filter(u => !u.plan || u.plan === 'free').length
  const mrr = (paidMonthly * MONTHLY_PRICE) + (paidYearly * (YEARLY_PRICE / 12))
  const arr = (paidMonthly * MONTHLY_PRICE * 12) + (paidYearly * YEARLY_PRICE)

  if (loading) return (
    <>
      <PublicHeader />
      <main className="page-wrap">
        <div className="container" style={{ paddingTop: '80px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading admin…</p>
        </div>
      </main>
    </>
  )

  return (
    <>
      <PublicHeader />
      <main className="page-wrap">
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '100px' }}>

          <div className="back-nav">
            <Link href="/" className="btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              Home
            </Link>
            <span className="back-nav-divider" />
            <Link href="/sanitize" className="btn-ghost">Sanitize tool</Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <span className="label" style={{ marginBottom: '10px' }}>Admin</span>
              <h1 style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--text-primary)' }}>
                Control panel
              </h1>
            </div>
            <button type="button" className="btn-secondary" onClick={exportCSV} style={{ fontSize: '13px', padding: '9px 16px' }}>
              Export CSV
            </button>
          </div>

          {/* Revenue summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
            {[
              { label: 'Total users', value: totalUsers },
              { label: 'Free', value: freeUsers },
              { label: 'Monthly paid', value: paidMonthly },
              { label: 'Yearly paid', value: paidYearly },
              { label: 'MRR', value: `$${mrr.toFixed(2)}` },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-card)', padding: '20px 18px' }}>
                <div style={{ fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: 'var(--cyan)', marginBottom: '8px' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--dm-sans, sans-serif)', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              ARR estimate: <strong style={{ color: 'var(--text-primary)' }}>${arr.toFixed(2)}</strong>
            </span>
            {overrideMsg && (
              <span style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 500 }}>{overrideMsg}</span>
            )}
          </div>

          {/* Search */}
          <div style={{ marginBottom: '16px' }}>
            <input
              className="field-input"
              placeholder="Search by email or plan…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: '340px' }}
            />
          </div>

          {/* User table */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.7fr 1fr', gap: '0', borderBottom: '1px solid var(--border)', padding: '10px 16px' }}>
              {['Email', 'Plan', 'Status', 'Sanitizes', 'Override'].map(h => (
                <div key={h} style={{ fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: 'var(--text-faint)' }}>{h}</div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                {search ? 'No users match that search.' : 'No users yet.'}
              </div>
            ) : (
              filtered.map((u, i) => (
                <div key={u.id} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.7fr 1fr', gap: '0',
                  padding: '12px 16px', alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', wordBreak: 'break-all', paddingRight: '12px' }}>
                    {u.email || '—'}
                  </div>
                  <div>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
                      textTransform: 'uppercase' as const, borderRadius: '4px', padding: '2px 7px',
                      background: u.plan === 'monthly' || u.plan === 'yearly'
                        ? 'var(--cyan-glow)' : 'rgba(255,255,255,0.05)',
                      border: u.plan === 'monthly' || u.plan === 'yearly'
                        ? '1px solid var(--border-cyan)' : '1px solid var(--border)',
                      color: u.plan === 'monthly' || u.plan === 'yearly'
                        ? 'var(--cyan)' : 'var(--text-muted)',
                    }}>
                      {u.plan ?? 'free'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: u.status === 'past_due' ? 'rgba(255,200,80,0.8)' : 'var(--text-muted)' }}>
                    {u.status ?? 'active'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {u.total_sanitizes}
                  </div>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {['free', 'monthly', 'yearly'].map(plan => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => overridePlan(u.id, plan)}
                        disabled={u.plan === plan || (!u.plan && plan === 'free')}
                        style={{
                          fontFamily: 'var(--dm-sans, sans-serif)',
                          fontSize: '10px', fontWeight: 600,
                          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer',
                          background: 'none',
                          border: '1px solid var(--border)',
                          color: 'var(--text-muted)',
                          opacity: (u.plan === plan || (!u.plan && plan === 'free')) ? 0.35 : 1,
                          textTransform: 'capitalize' as const,
                        }}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '12px' }}>
            This panel is only accessible to infiniappsofficial@gmail.com. Override changes user_plans table directly.
          </p>

        </div>
      </main>
    </>
  )
}
