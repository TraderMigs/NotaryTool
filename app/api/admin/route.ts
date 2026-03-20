import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

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

async function verifyOwner(token: string) {
  const anon = getAnonClient()
  if (!anon) return null
  const { data: { user }, error } = await anon.auth.getUser(token)
  if (error || !user || user.email !== OWNER_EMAIL) return null
  return user
}

async function writeAuditLog(db: ReturnType<typeof getServiceClient>, action: string, targetUserId?: string, targetEmail?: string, details?: string) {
  if (!db) return
  try {
    await db.from('admin_audit_log').insert({
      action,
      target_user_id: targetUserId ?? null,
      target_email: targetEmail ?? null,
      details: details ?? null,
    })
  } catch { /* non-blocking */ }
}

// ── GET: Load all users + sanitize_log totals ─────────────────
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

    const owner = await verifyOwner(token)
    if (!owner) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

    const db = getServiceClient()
    if (!db) return NextResponse.json({ error: 'Server config error.' }, { status: 500 })

    // user_plans
    const { data: plans, error: plansError } = await db
      .from('user_plans')
      .select('user_id, plan, status, suspended, stripe_customer_id, stripe_subscription_id, updated_at')
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

    // daily_sanitize_counts (for run count)
    const { data: counts } = await db
      .from('daily_sanitize_counts')
      .select('user_id, count')

    const countMap: Record<string, number> = {}
    for (const row of counts ?? []) {
      countMap[row.user_id] = (countMap[row.user_id] ?? 0) + (row.count ?? 0)
    }

    // sanitize_log: total pages + value per user
    const { data: logRows, error: logError } = await db
      .from('sanitize_log')
      .select('user_id, page_count, value_cents')
    if (logError) console.error('sanitize_log error:', logError.message)

    const pageMap: Record<string, number> = {}
    const valueMap: Record<string, number> = {}
    let totalPagesAllUsers = 0
    let totalValueAllUsers = 0

    for (const row of logRows ?? []) {
      pageMap[row.user_id] = (pageMap[row.user_id] ?? 0) + (row.page_count ?? 0)
      valueMap[row.user_id] = (valueMap[row.user_id] ?? 0) + (row.value_cents ?? 0)
      totalPagesAllUsers += row.page_count ?? 0
      totalValueAllUsers += row.value_cents ?? 0
    }

    // app_settings
    const { data: settings } = await db
      .from('app_settings')
      .select('key, value')

    const settingsMap: Record<string, string> = {}
    for (const s of settings ?? []) settingsMap[s.key] = s.value

    const users = (plans ?? []).map((p: any) => ({
      id: p.user_id,
      email: emailMap[p.user_id]?.email ?? '—',
      created_at: emailMap[p.user_id]?.created_at ?? p.updated_at,
      last_sign_in_at: emailMap[p.user_id]?.last_sign_in_at ?? null,
      plan: p.plan,
      status: p.status,
      suspended: p.suspended ?? false,
      stripe_customer_id: p.stripe_customer_id,
      stripe_subscription_id: p.stripe_subscription_id,
      total_sanitizes: countMap[p.user_id] ?? 0,
      total_pages: pageMap[p.user_id] ?? 0,
      total_value_cents: valueMap[p.user_id] ?? 0,
    }))

    return NextResponse.json({
      users,
      totals: {
        total_pages: totalPagesAllUsers,
        total_value_cents: totalValueAllUsers,
      },
      settings: settingsMap,
    })
  } catch (err) {
    console.error('Admin GET error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ── POST: All admin actions ───────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

    const owner = await verifyOwner(token)
    if (!owner) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

    const db = getServiceClient()
    if (!db) return NextResponse.json({ error: 'Server config error.' }, { status: 500 })

    const body = await request.json()
    const { action, userId, plan, email, message, key, value } = body

    switch (action) {

      // ── Override plan ────────────────────────────────────────
      case 'override_plan': {
        if (!userId || !plan) return NextResponse.json({ error: 'Missing params.' }, { status: 400 })
        const { error } = await db.from('user_plans').upsert({
          user_id: userId, plan,
          status: plan === 'free' ? 'cancelled' : 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        await writeAuditLog(db, 'override_plan', userId, email, `Plan set to ${plan}`)
        return NextResponse.json({ success: true })
      }

      // ── Force password reset ─────────────────────────────────
      case 'force_password_reset': {
        if (!email) return NextResponse.json({ error: 'Missing email.' }, { status: 400 })
        const { error } = await db.auth.admin.generateLink({
          type: 'recovery',
          email,
        })
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        await writeAuditLog(db, 'force_password_reset', userId, email)
        return NextResponse.json({ success: true })
      }

      // ── Delete account ───────────────────────────────────────
      case 'delete_account': {
        if (!userId) return NextResponse.json({ error: 'Missing userId.' }, { status: 400 })
        // Delete from user_plans, sanitize_log, daily_sanitize_counts first
        await db.from('sanitize_log').delete().eq('user_id', userId)
        await db.from('daily_sanitize_counts').delete().eq('user_id', userId)
        await db.from('user_plans').delete().eq('user_id', userId)
        // Delete auth user
        const { error } = await db.auth.admin.deleteUser(userId)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        await writeAuditLog(db, 'delete_account', userId, email, 'Account permanently deleted')
        return NextResponse.json({ success: true })
      }

      // ── Suspend account ──────────────────────────────────────
      case 'suspend_account': {
        if (!userId) return NextResponse.json({ error: 'Missing userId.' }, { status: 400 })
        const { error } = await db.from('user_plans')
          .update({ suspended: true, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        await writeAuditLog(db, 'suspend_account', userId, email)
        return NextResponse.json({ success: true })
      }

      // ── Unsuspend account ────────────────────────────────────
      case 'unsuspend_account': {
        if (!userId) return NextResponse.json({ error: 'Missing userId.' }, { status: 400 })
        const { error } = await db.from('user_plans')
          .update({ suspended: false, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        await writeAuditLog(db, 'unsuspend_account', userId, email)
        return NextResponse.json({ success: true })
      }

      // ── Download user data ───────────────────────────────────
      case 'download_user_data': {
        if (!userId) return NextResponse.json({ error: 'Missing userId.' }, { status: 400 })
        const { data: logs } = await db
          .from('sanitize_log')
          .select('page_count, value_cents, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        const { data: planRow } = await db
          .from('user_plans')
          .select('plan, status, created_at')
          .eq('user_id', userId)
          .single()
        const exportData = {
          user_id: userId,
          email,
          plan: planRow?.plan ?? 'free',
          status: planRow?.status ?? 'active',
          member_since: planRow?.created_at,
          sanitize_runs: logs?.length ?? 0,
          total_pages: logs?.reduce((s: number, r: any) => s + r.page_count, 0) ?? 0,
          total_value_dollars: ((logs?.reduce((s: number, r: any) => s + r.value_cents, 0) ?? 0) / 100).toFixed(2),
          runs: logs ?? [],
        }
        await writeAuditLog(db, 'download_user_data', userId, email)
        return NextResponse.json({ success: true, data: exportData })
      }

      // ── Broadcast email ──────────────────────────────────────
      case 'broadcast_email': {
        if (!message) return NextResponse.json({ error: 'Missing message.' }, { status: 400 })
        const resendKey = process.env.RESEND_API_KEY
        if (!resendKey) return NextResponse.json({ error: 'Resend not configured.' }, { status: 500 })
        const resend = new Resend(resendKey)

        const { data: emailRows } = await db.from('user_emails').select('email')
        const emails = (emailRows ?? []).map((r: any) => r.email).filter(Boolean)

        let sent = 0
        for (const to of emails) {
          try {
            await resend.emails.send({
              from: 'Specterfy <no-reply@specterfy.com>',
              to,
              subject: body.subject ?? 'A message from Specterfy',
              html: `<div style="font-family:sans-serif;background:#050C15;color:#fff;padding:40px;max-width:560px;margin:0 auto;border-radius:12px;">
                <img src="https://specterfy.com/specterfy-logo.png" alt="Specterfy" style="height:40px;margin-bottom:32px;" />
                <div style="font-size:15px;color:rgba(255,255,255,0.7);line-height:1.75;">${message}</div>
                <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:32px;">Specterfy — Privacy Pre-Processor</p>
              </div>`,
            })
            sent++
          } catch { /* continue */ }
        }
        await writeAuditLog(db, 'broadcast_email', undefined, undefined, `Sent to ${sent} users. Subject: ${body.subject}`)
        return NextResponse.json({ success: true, sent })
      }

      // ── Set maintenance mode ─────────────────────────────────
      case 'set_maintenance': {
        const modeValue = body.enabled ? 'true' : 'false'
        await db.from('app_settings').upsert(
          { key: 'maintenance_mode', value: modeValue, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
        if (body.message) {
          await db.from('app_settings').upsert(
            { key: 'maintenance_message', value: body.message, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          )
        }
        await writeAuditLog(db, 'set_maintenance', undefined, undefined, `Maintenance: ${modeValue}`)
        return NextResponse.json({ success: true })
      }

      // ── Update app setting ───────────────────────────────────
      case 'update_setting': {
        if (!key || value === undefined) return NextResponse.json({ error: 'Missing key/value.' }, { status: 400 })
        await db.from('app_settings').upsert(
          { key, value: String(value), updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
        await writeAuditLog(db, 'update_setting', undefined, undefined, `${key} = ${value}`)
        return NextResponse.json({ success: true })
      }

      // ── Get audit log ────────────────────────────────────────
      case 'get_audit_log': {
        const { data: logs } = await db
          .from('admin_audit_log')
          .select('*')
          .order('performed_at', { ascending: false })
          .limit(100)
        return NextResponse.json({ logs: logs ?? [] })
      }

      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
    }
  } catch (err) {
    console.error('Admin POST error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
