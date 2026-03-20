import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Admin data endpoint — service role only
// Reads user_plans directly (view joins auth.users which can have RLS issues)

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

    // Query user_plans (service role bypasses RLS)
    const { data: plans, error: plansError } = await supabase
      .from('user_plans')
      .select('user_id, plan, status, stripe_customer_id, stripe_subscription_id, updated_at')
      .order('updated_at', { ascending: false })

    if (plansError) {
      console.error('user_plans error:', plansError)
      return NextResponse.json({ error: 'Failed to load plans.' }, { status: 500 })
    }

    // Get sanitize counts per user
    const { data: counts } = await supabase
      .from('daily_sanitize_counts')
      .select('user_id, count')

    // Aggregate sanitize counts per user
    const countMap: Record<string, number> = {}
    for (const row of counts ?? []) {
      countMap[row.user_id] = (countMap[row.user_id] ?? 0) + (row.count ?? 0)
    }

    // Try to get emails from auth.users via the view (may fail — handled gracefully)
    let emailMap: Record<string, string> = {}
    const { data: viewData } = await supabase
      .from('admin_user_summary')
      .select('id, email')
    if (viewData) {
      for (const row of viewData) {
        if (row.id && row.email) emailMap[row.id] = row.email
      }
    }

    const users = (plans ?? []).map((p: any) => ({
      id: p.user_id,
      email: emailMap[p.user_id] ?? '—',
      created_at: p.updated_at,
      last_sign_in_at: null,
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
