import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Admin data endpoint — uses service role to read admin_user_summary view
// Only callable by the owner session (verified by checking user email)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

    const supabase = createServerClient()
    if (!supabase) return NextResponse.json({ error: 'Server error.' }, { status: 500 })

    // Verify the requesting user is the owner
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    if (user.email !== 'infiniappsofficial@gmail.com') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    // Service role can read auth.users via the view
    const { data, error } = await supabase
      .from('admin_user_summary')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Admin query error:', error)
      // Fallback: just return user_plans if view fails
      const { data: plans, error: plansError } = await supabase
        .from('user_plans')
        .select('user_id, plan, status, updated_at')
      if (plansError) return NextResponse.json({ error: 'Failed to load users.' }, { status: 500 })
      return NextResponse.json({ users: plans?.map((p: any) => ({
        id: p.user_id, email: '—', created_at: p.updated_at,
        last_sign_in_at: null, plan: p.plan, status: p.status, total_sanitizes: 0,
      })) ?? [] })
    }

    return NextResponse.json({ users: data ?? [] })
  } catch (err) {
    console.error('Admin route error:', err)
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
    console.error('Admin override error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
