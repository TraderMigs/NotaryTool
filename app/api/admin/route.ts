import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const OWNER_EMAIL = 'infiniappsofficial@gmail.com'

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

    // Use anon client to verify the user token
    const anon = getAnonClient()
    if (!anon) return NextResponse.json({ error: 'Server config error.' }, { status: 500 })

    const { data: { user }, error: authError } = await anon.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    if (user.email !== OWNER_EMAIL) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

    // Use service client for all data queries
    const db = getServiceClient()
    if (!db) return NextResponse.json({ error: 'Server config error.' }, { status: 500 })

    // user_plans
    const { data: plans, error: plansError } = await db
      .from('user_plans')
      .select('user_id, plan, status, stripe_customer_id, stripe_subscription_id, updated_at')
      .order('updated_at', { ascending: false })

    if (plansError) {
      console.error('user_plans error:', plansError.message)
      return NextResponse.json({ error: 'Failed to load plans.' }, { status: 500 })
    }

    // user_emails view
    const { data: emailRows, error: emailError } = await db
      .from('user_emails')
      .select('id, email, created_at, last_sign_in_at')

    if (emailError) console.error('user_emails error:', emailError.message)

    const emailMap: Record<string, { email: string; created_at: string; last_sign_in_at: string | null }> = {}
    for (const row of emailRows ?? []) {
      if (row.id) emailMap[row.id] = {
        email: row.email ?? '—',
        created_at: row.created_at,
        last_sign_in_at: row.last_sign_in_at ?? null,
      }
    }

    // daily_sanitize_counts
    const { data: counts, error: countsError } = await db
      .from('daily_sanitize_counts')
      .select('user_id, count')

    if (countsError) console.error('counts error:', countsError.message)

    const countMap: Record<string, number> = {}
    for (const row of counts ?? []) {
      countMap[row.user_id] = (countMap[row.user_id] ?? 0) + (row.count ?? 0)
    }

    const users = (plans ?? []).map((p: any) => ({
      id: p.user_id,
      email: emailMap[p.user_id]?.email ?? '—',
      created_at: emailMap[p.user_id]?.created_at ?? p.updated_at,
      last_sign_in_at: emailMap[p.user_id]?.last_sign_in_at ?? null,
      plan: p.plan,
      status: p.status,
      stripe_customer_id: p.stripe_customer_id,
      stripe_subscription_id: p.stripe_subscription_id,
      total_sanitizes: countMap[p.user_id] ?? 0,
    }))

    return NextResponse.json({ users })
  } catch (err) {
    console.error('Admin GET error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

    const anon = getAnonClient()
    if (!anon) return NextResponse.json({ error: 'Server config error.' }, { status: 500 })

    const { data: { user }, error: authError } = await anon.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    if (user.email !== OWNER_EMAIL) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

    const db = getServiceClient()
    if (!db) return NextResponse.json({ error: 'Server config error.' }, { status: 500 })

    const { userId, plan } = await request.json() as { userId: string; plan: string }
    if (!userId || !plan) return NextResponse.json({ error: 'Missing parameters.' }, { status: 400 })

    const { error } = await db.from('user_plans').upsert({
      user_id: userId,
      plan,
      status: plan === 'free' ? 'cancelled' : 'active',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin POST error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
