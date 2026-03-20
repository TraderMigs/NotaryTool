import Stripe from 'stripe'

// Server-side only — never import this in client components
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-04-10',
})

// Price IDs — set in Stripe dashboard, stored as Vercel env vars
export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY ?? '',  // $9.97/mo unlimited
  yearly:  process.env.STRIPE_PRICE_YEARLY  ?? '',  // $89/yr unlimited
} as const

export type PlanType = 'free' | 'monthly' | 'yearly'

// Owner email — always has lifetime paid access, never charged
export const OWNER_EMAIL = 'infiniappsofficial@gmail.com'

export function isOwner(email: string) {
  return email.toLowerCase() === OWNER_EMAIL.toLowerCase()
}
