import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/resend'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/sanitize'

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`)
  }

  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.redirect(`${origin}/sign-in?error=server_error`)
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`)
  }

  // Send welcome email on first sign-in (new user)
  // We check by looking at created_at vs last_sign_in_at
  const user = data.session.user
  const createdAt = new Date(user.created_at).getTime()
  const signedInAt = new Date(user.last_sign_in_at ?? '').getTime()
  const isNewUser = Math.abs(createdAt - signedInAt) < 30000 // within 30 seconds

  if (isNewUser && user.email) {
    try {
      await sendWelcomeEmail(user.email)
    } catch {
      // Don't block auth flow if email fails
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
