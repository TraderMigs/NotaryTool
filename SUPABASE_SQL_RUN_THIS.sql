-- ============================================================
-- SPECTERFY — Supabase SQL Setup
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── user_plans table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_plans (
  id                      uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                    text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'monthly', 'yearly')),
  status                  text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled')),
  stripe_customer_id      text,
  stripe_subscription_id  text,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS user_plans_user_id_idx ON public.user_plans(user_id);
CREATE INDEX IF NOT EXISTS user_plans_stripe_sub_idx ON public.user_plans(stripe_subscription_id);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Users can read their own plan
CREATE POLICY "user_plans_select_own"
  ON public.user_plans FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role (webhook) can insert/update/delete
CREATE POLICY "user_plans_service_all"
  ON public.user_plans FOR ALL
  USING (auth.role() = 'service_role');

-- ── Auto-create free plan row on user signup ─────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_plans (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── daily_sanitize_counts table (usage tracking) ─────────────
CREATE TABLE IF NOT EXISTS public.daily_sanitize_counts (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       date NOT NULL DEFAULT CURRENT_DATE,
  count      integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_sanitize_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_counts_select_own"
  ON public.daily_sanitize_counts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "daily_counts_service_all"
  ON public.daily_sanitize_counts FOR ALL
  USING (auth.role() = 'service_role');

-- ── Confirm everything created ────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_plans', 'daily_sanitize_counts');
