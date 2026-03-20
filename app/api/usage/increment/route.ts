import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import {
  isOwnerEmail,
  getUserPlan,
  isPaidPlan,
  getTodayCount,
  incrementTodayCount,
  FREE_DAILY_LIMIT,
} from '@/lib/planUtils'

export async function POST(request: NextRequest) {
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

    // Owner: always allow, no counting
    if (isOwnerEmail(user.email)) {
      return NextResponse.json({ allowed: true, unlimited: true })
    }

    // Check plan
    const planRow = await getUserPlan(user.id)
    const paid = isPaidPlan(planRow?.plan ?? null, planRow?.status ?? null)

    // Paid: always allow, no counting
    if (paid) {
      await incrementTodayCount(user.id)
      return NextResponse.json({ allowed: true, unlimited: true })
    }

    // Free: check daily limit
    const todayCount = await getTodayCount(user.id)
    if (todayCount >= FREE_DAILY_LIMIT) {
      return NextResponse.json({
        allowed: false,
        limitHit: true,
        count: todayCount,
        limit: FREE_DAILY_LIMIT,
      })
    }

    // Under limit: increment and allow
    await incrementTodayCount(user.id)
    return NextResponse.json({
      allowed: true,
      count: todayCount + 1,
      limit: FREE_DAILY_LIMIT,
      remaining: FREE_DAILY_LIMIT - (todayCount + 1),
    })
  } catch (err) {
    console.error('Usage increment error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
