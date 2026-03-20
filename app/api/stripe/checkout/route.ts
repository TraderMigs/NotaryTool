import { NextRequest, NextResponse } from 'next/server'
import { stripe, getStripePrices, isOwner } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json() as { plan: 'monthly' | 'yearly' }

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 })
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Server error.' }, { status: 500 })
    }

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user?.email) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    if (isOwner(user.email)) {
      return NextResponse.json({ error: 'Owner account has lifetime access.' }, { status: 400 })
    }

    const prices = getStripePrices()
    const priceId = prices[plan]
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured.' }, { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://specterfy.com'

    const stripeClient = stripe()
    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          user_email: user.email,
          plan,
        },
      },
      success_url: `${siteUrl}/account?payment=success&plan=${plan}`,
      cancel_url: `${siteUrl}/pricing?cancelled=1`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 })
  }
}
