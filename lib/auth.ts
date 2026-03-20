'use client'

import { supabase } from './supabase'

export type AuthError = { message: string }

// ── Sign up ──────────────────────────────────────────────────────
export async function signUp(email: string, password: string, businessName?: string) {
  if (!supabase) return { error: { message: 'Supabase not configured.' } }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      data: {
        business_name: businessName?.trim() || '',
      },
    },
  })

  return { data, error }
}

// ── Sign in ──────────────────────────────────────────────────────
export async function signIn(email: string, password: string) {
  if (!supabase) return { error: { message: 'Supabase not configured.' } }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

// ── Sign out ─────────────────────────────────────────────────────
export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
  window.location.href = '/'
}

// ── Forgot password ──────────────────────────────────────────────
export async function sendPasswordReset(email: string) {
  if (!supabase) return { error: { message: 'Supabase not configured.' } }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/recover`,
  })

  return { error }
}

// ── Update password (after reset link click) ─────────────────────
export async function updatePassword(newPassword: string) {
  if (!supabase) return { error: { message: 'Supabase not configured.' } }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return { error }
}

// ── Update business name ─────────────────────────────────────────
export async function updateBusinessName(businessName: string) {
  if (!supabase) return { error: { message: 'Supabase not configured.' } }

  const { error } = await supabase.auth.updateUser({
    data: { business_name: businessName.trim() },
  })
  return { error }
}

// ── Get current session ──────────────────────────────────────────
export async function getSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ── Get current user ─────────────────────────────────────────────
export async function getUser() {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user
}
