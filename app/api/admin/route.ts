import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

    const supabase = createServerClient()
    if (!supabase) return NextResponse.json({ error: 'Server error.' }, { status: 500 })

    // Verify owner
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    if (user.email !== 'infiniappsofficial@gmail.com') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    // Get all plan rows
    const { data: plans, error: plansError } = await supabase
      .from('user_plans')
      .select('user_id, plan, status, stripe_customer_id, stripe_subscription_id, updated_at')
      .order('updated_at', { ascending: false })

    if (plansError) {
      return NextResponse.json({ error: 'Failed to load plans.' }, { status: 500 })
    }

    // Get emails from the public view (readable via PostgREST)
    const { data: emailRows } = await supabase
      .from('user_emails')
      .select('id, email, created_at, last_sign_in_at')

    const emailMap: Record<string, { email: string; created_at: string; last_sign_in_at: string | null }> = {}
    for (const row of emailRows ?? []) {
      if (row.id) emailMap[row.id] = {
        email: row.email ?? '—',
        created_at: row.created_at,
        last_sign_in_at: row.last_sign_in_at ?? null,
      }
    }

    // Get sanitize counts per user (sum across all days)
    const { data: counts } = await supabase
      .from('daily_sanitize_counts')
      .select('user_id, count')

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
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

    const supabase = createServerClient()
    if (!supabase) return NextResponse.json({ error: 'Server error.' }, { status: 500 })

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    if (user.email !== 'infiniappsofficial@gmail.com') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    const { userId, plan } = await request.json() as { userId: string; plan: string }
    if (!userId || !plan) return NextResponse.json({ error: 'Missing parameters.' }, { status: 400 })

    const { error } = await supabase.from('user_plans').upsert({
      user_id: userId,
      plan,
      status: plan === 'free' ? 'cancelled' : 'active',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin POST error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
