import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { Resend } from 'resend'

// Vercel Cron: runs daily at 10am UTC via vercel.json
// Sends Day 1, Day 3, Day 7 onboarding emails
// Secured with CRON_SECRET

function getDaysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function buildEmail(day: number) {
  const subjects: Record<number, string> = {
    1: 'Get started with Specterfy',
    3: 'Quick tips for cleaner PDFs',
    7: 'Unlimited sanitization — $9.97/mo',
  }
  const bodies: Record<number, string> = {
    1: `
      <h1 style="font-size:22px;font-weight:700;margin-bottom:12px;">Here's how it works</h1>
      <ol style="color:rgba(255,255,255,0.6);font-size:15px;line-height:2;padding-left:20px;margin-bottom:24px;">
        <li>Upload your PDF at <strong style="color:#fff;">specterfy.com/sanitize</strong></li>
        <li>Draw blackout boxes over any sensitive fields</li>
        <li>Click Generate — download your clean copy</li>
      </ol>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin-bottom:24px;">
        You have <strong style="color:#00C8F0;">5 free sanitizes per day</strong> on your current plan.
      </p>
      <a href="https://specterfy.com/sanitize" style="display:inline-block;background:#00C8F0;color:#020C14;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">Open sanitize tool</a>
    `,
    3: `
      <h1 style="font-size:22px;font-weight:700;margin-bottom:16px;">Three quick tips</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin-bottom:10px;"><strong style="color:#fff;">1. Draw larger boxes.</strong> Overlapping a field slightly ensures the redaction is clean in the output.</p>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin-bottom:10px;"><strong style="color:#fff;">2. Review before moving on.</strong> Always open the Review page after generating and verify the output before using it downstream.</p>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin-bottom:24px;"><strong style="color:#fff;">3. You remain responsible.</strong> Specterfy is a pre-processing utility. Always verify outputs meet your obligations before downstream use.</p>
      <a href="https://specterfy.com/sanitize" style="display:inline-block;background:#00C8F0;color:#020C14;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">Open sanitize tool</a>
    `,
    7: `
      <h1 style="font-size:22px;font-weight:700;margin-bottom:12px;">Unlimited sanitization — $9.97/mo</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin-bottom:16px;">If 5 free sanitizes/day isn't enough for your workflow, unlimited access starts at <strong style="color:#00C8F0;">$9.97/month</strong> or <strong style="color:#00C8F0;">$89/year</strong>.</p>
      <ul style="color:rgba(255,255,255,0.6);font-size:15px;line-height:2;padding-left:20px;margin-bottom:24px;">
        <li>No daily cap</li>
        <li>Cancel anytime</li>
        <li>Yearly plan saves over 25%</li>
      </ul>
      <a href="https://specterfy.com/account?tab=billing" style="display:inline-block;background:#00C8F0;color:#020C14;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">Upgrade now</a>
    `,
  }
  return {
    subject: subjects[day],
    html: `<div style="font-family:sans-serif;background:#050C15;color:#fff;padding:40px;max-width:560px;margin:0 auto;border-radius:12px;">
      <img src="https://specterfy.com/specterfy-logo.png" alt="Specterfy" style="height:40px;margin-bottom:32px;" />
      ${bodies[day]}
      <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:32px;line-height:1.6;">
        You're receiving this because you created a Specterfy account.
        Specterfy is a privacy pre-processing utility — not a legal compliance platform.
      </p>
    </div>`,
  }
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET ?? ''}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const supabase = createServerClient()
  if (!supabase) return NextResponse.json({ error: 'Server error.' }, { status: 500 })

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return NextResponse.json({ error: 'Resend not configured.' }, { status: 500 })
  const resend = new Resend(resendKey)

  const { data: users, error } = await supabase
    .from('admin_user_summary')
    .select('id, email, created_at')

  if (error || !users?.length) return NextResponse.json({ sent: 0 })

  let sent = 0

  for (const user of users) {
    if (!user.email || !user.id) continue
    const daysSince = getDaysSince(user.created_at)

    for (const dripDay of [1, 3, 7]) {
      if (daysSince !== dripDay) continue

      // Already sent?
      const { data: alreadySent } = await supabase
        .from('email_drip_log')
        .select('id')
        .eq('user_id', user.id)
        .eq('drip_day', dripDay)
        .single()
      if (alreadySent) continue

      // Day 7 — skip paid users
      if (dripDay === 7) {
        const { data: plan } = await supabase.from('user_plans').select('plan,status').eq('user_id', user.id).single()
        const isPaid = (plan?.plan === 'monthly' || plan?.plan === 'yearly') && plan?.status === 'active'
        if (isPaid) {
          await supabase.from('email_drip_log').insert({ user_id: user.id, drip_day: dripDay })
          continue
        }
      }

      const { subject, html } = buildEmail(dripDay)
      try {
        await resend.emails.send({ from: 'Specterfy <no-reply@specterfy.com>', to: user.email, subject, html })
        await supabase.from('email_drip_log').insert({ user_id: user.id, drip_day: dripDay })
        sent++
      } catch {
        console.error(`Failed drip Day ${dripDay} to ${user.email}`)
      }
    }
  }

  return NextResponse.json({ sent })
}
