import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import {
  isOwnerEmail,
  getUserPlan,
  isPaidPlan,
  getTodayCount,
  FREE_DAILY_LIMIT,
} from '@/lib/planUtils'

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

    const owner = isOwnerEmail(user.email)
    if (owner) {
      return NextResponse.json({ owner: true, paid: true, limitHit: false, todayCount: 0, limit: FREE_DAILY_LIMIT })
    }

    const planRow = await getUserPlan(user.id)
    const paid = isPaidPlan(planRow?.plan ?? null, planRow?.status ?? null)

    if (paid) {
      return NextResponse.json({ owner: false, paid: true, limitHit: false, todayCount: 0, limit: FREE_DAILY_LIMIT })
    }

    const todayCount = await getTodayCount(user.id)
    const limitHit = todayCount >= FREE_DAILY_LIMIT

    return NextResponse.json({ owner: false, paid: false, limitHit, todayCount, limit: FREE_DAILY_LIMIT })
  } catch (err) {
    console.error('Usage status error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
