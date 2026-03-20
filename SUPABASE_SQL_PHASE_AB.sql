-- ============================================================
-- SPECTERFY — Supabase SQL Additions (Phase A/B)
-- Run in: https://supabase.com/dashboard/project/ikhvtktvsvtfmzyrypto/editor
-- This is IN ADDITION to the previous SUPABASE_SQL_RUN_THIS.sql
-- ============================================================

-- RPC function: safely upsert + increment daily count
CREATE OR REPLACE FUNCTION public.increment_daily_count(
  p_user_id uuid,
  p_date    date
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.daily_sanitize_counts (user_id, date, count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET count = daily_sanitize_counts.count + 1;
END;
$$;

-- Admin view: all users with plan info (used by /admin page)
-- Service role only — RLS blocks normal users
CREATE OR REPLACE VIEW public.admin_user_summary AS
SELECT
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  p.plan,
  p.status,
  p.stripe_customer_id,
  p.stripe_subscription_id,
  p.updated_at AS plan_updated_at,
  COALESCE(
    (SELECT SUM(c.count)
     FROM public.daily_sanitize_counts c
     WHERE c.user_id = u.id),
    0
  ) AS total_sanitizes
FROM auth.users u
LEFT JOIN public.user_plans p ON p.user_id = u.id;

-- Verify
SELECT 'increment_daily_count function created' AS result;
SELECT 'admin_user_summary view created' AS result;
