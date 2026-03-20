// Server-side only — plan + usage utilities
// Used by: sanitize API, dashboard, admin

import { createServerClient } from './supabase'

export const OWNER_EMAIL = 'infiniappsofficial@gmail.com'
export const FREE_DAILY_LIMIT = 5

export function isOwnerEmail(email: string | null | undefined) {
  return (email ?? '').toLowerCase() === OWNER_EMAIL.toLowerCase()
}

// Get user's plan row — returns null if not found (treat as free)
export async function getUserPlan(userId: string) {
  const supabase = createServerClient()
  if (!supabase) return null
  const { data } = await supabase
    .from('user_plans')
    .select('plan, status')
    .eq('user_id', userId)
    .single()
  return data
}

// Check if user is on an active paid plan
export function isPaidPlan(plan: string | null, status: string | null) {
  return (plan === 'monthly' || plan === 'yearly') && status === 'active'
}

// Get today's sanitize count for a user
export async function getTodayCount(userId: string): Promise<number> {
  const supabase = createServerClient()
  if (!supabase) return 0
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('daily_sanitize_counts')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  return data?.count ?? 0
}

// Increment today's sanitize count
export async function incrementTodayCount(userId: string) {
  const supabase = createServerClient()
  if (!supabase) return
  const today = new Date().toISOString().split('T')[0]
  // Upsert: insert if not exists, increment if exists
  await supabase.rpc('increment_daily_count', {
    p_user_id: userId,
    p_date: today,
  })
}
