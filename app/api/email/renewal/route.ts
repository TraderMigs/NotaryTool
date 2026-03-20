import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { Resend } from 'resend'

// This route sends renewal reminders to yearly subscribers
// Call via cron job or Vercel Cron: 0 9 * * * POST /api/email/renewal
// Secured with CRON_SECRET env var

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET ?? ''}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const supabase = createServerClient()
  if (!supabase) return NextResponse.json({ error: 'Server error.' }, { status: 500 })

  // Get all active yearly subscribers
  const { data: yearlyUsers, error } = await supabase
    .from('user_plans')
    .select('user_id, updated_at')
    .eq('plan', 'yearly')
    .eq('status', 'active')

  if (error || !yearlyUsers?.length) {
    return NextResponse.json({ sent: 0 })
  }

  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ error: 'Resend not configured.' }, { status: 500 })
  const resend = new Resend(key)

  let sent = 0
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  for (const row of yearlyUsers) {
    // Check if renewal is ~30 days away (plan started ~335 days ago)
    const planStart = new Date(row.updated_at)
    const renewalDate = new Date(planStart)
    renewalDate.setFullYear(renewalDate.getFullYear() + 1)

    const daysUntilRenewal = Math.round(
      (renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    if (daysUntilRenewal > 28 && daysUntilRenewal <= 32) {
      // Get user email
      const { data: userData } = await supabase
        .from('admin_user_summary')
        .select('email')
        .eq('id', row.user_id)
        .single()

      if (userData?.email) {
        await resend.emails.send({
          from: 'Specterfy <no-reply@specterfy.com>',
          to: userData.email,
          subject: 'Your Specterfy yearly plan renews in 30 days',
          html: `
            <div style="font-family: sans-serif; background: #050C15; color: #fff; padding: 40px; max-width: 560px; margin: 0 auto; border-radius: 12px;">
              <img src="https://specterfy.com/specterfy-logo.png" alt="Specterfy" style="height: 40px; margin-bottom: 32px;" />
              <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 12px;">Your plan renews in 30 days</h1>
              <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.7; margin-bottom: 16px;">
                Your Specterfy yearly plan ($89/yr) will automatically renew on
                <strong style="color: #fff;">${renewalDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.
              </p>
              <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
                If you'd like to cancel before then, you can do so anytime from your billing portal.
              </p>
              <a href="https://billing.stripe.com/p/login/aFafZjeAjbwVgnN9wCafS00"
                 style="display: inline-block; background: #00C8F0; color: #020C14; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
                Manage billing
              </a>
              <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 32px; line-height: 1.6;">
                No action needed to continue your subscription. Specterfy is a privacy pre-processing utility — not a legal compliance platform.
              </p>
            </div>
          `,
        })
        sent++
      }
    }
  }

  return NextResponse.json({ sent })
}
