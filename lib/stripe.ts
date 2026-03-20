import Stripe from 'stripe'

// Server-side only — never import this in client components
// Lazy: instantiated inside getStripe() so build-time missing env var does not throw
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set.')
  return new Stripe(key, { apiVersion: '2023-10-16' })
}

// Export getter for use in API routes
export { getStripe as stripe }

// Price IDs — set in Stripe dashboard, stored as Vercel env vars
export function getStripePrices() {
  return {
    monthly: process.env.STRIPE_PRICE_MONTHLY ?? '',  // $9.97/mo unlimited
    yearly:  process.env.STRIPE_PRICE_YEARLY  ?? '',  // $89/yr unlimited
  }
}

export type PlanType = 'free' | 'monthly' | 'yearly'

// Owner email — always has lifetime paid access, never charged
export const OWNER_EMAIL = 'infiniappsofficial@gmail.com'

export function isOwner(email: string) {
  return email.toLowerCase() === OWNER_EMAIL.toLowerCase()
}
