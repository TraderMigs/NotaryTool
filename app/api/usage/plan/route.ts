import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Server error.' }, { status: 500 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const { data: planRow } = await supabase
      .from('user_plans')
      .select('plan, status, stripe_subscription_id')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ planRow: planRow ?? null })
  } catch (err) {
    console.error('Usage plan error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
