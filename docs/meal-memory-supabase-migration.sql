-- ============================================================
-- TextCalio — Meal Memory migration
-- Apply this SQL in the Supabase SQL editor (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to run multiple times: every CREATE uses IF NOT EXISTS.
--
-- This migration introduces two tables:
--   1. saved_meals               — per-user saved meal shortcuts
--   2. meal_memory_suggestions   — pending/answered "want to save this?" prompts
--
-- Note on security: this project uses the Supabase service role key
-- in API routes (lib/supabase.js), which bypasses RLS. RLS is therefore
-- not strictly required. Existing tables (users, food_logs, etc.) do not
-- enable RLS in this codebase. If you later enable RLS on this project,
-- add policies here that match the existing pattern.
-- ============================================================

-- ── saved_meals ──────────────────────────────────────────────
create table if not exists public.saved_meals (
  id                    uuid primary key default gen_random_uuid(),
  user_phone            text not null,
  meal_name             text not null,
  normalized_name       text not null,
  canonical_description text not null,
  calories              integer not null,
  protein_g             numeric default 0,
  carbs_g               numeric default 0,
  fat_g                 numeric default 0,
  source                text default 'manual',  -- 'manual' | 'suggested'
  usage_count           integer default 0,
  last_used_at          timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- One saved meal per user per normalized name
create unique index if not exists saved_meals_user_normalized_name_uniq
  on public.saved_meals (user_phone, normalized_name);

create index if not exists saved_meals_user_phone_idx
  on public.saved_meals (user_phone);

-- ── meal_memory_suggestions ──────────────────────────────────
-- Tracks "I noticed you logged this a few times — want me to save it?"
-- prompts so we don't ask twice for the same meal.
create table if not exists public.meal_memory_suggestions (
  id                          uuid primary key default gen_random_uuid(),
  user_phone                  text not null,
  suggested_name              text not null,
  normalized_suggested_name   text not null,
  canonical_description       text not null,
  calories                    integer not null,
  protein_g                   numeric default 0,
  carbs_g                     numeric default 0,
  fat_g                       numeric default 0,
  -- food_logs.id is uuid in this project (see api/delete-log.js):
  source_log_ids              uuid[] default '{}',
  status                      text default 'pending',
  -- Allowed statuses: 'pending', 'accepted', 'rejected', 'ignored'
  asked_at                    timestamptz,
  responded_at                timestamptz,
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);

create index if not exists meal_memory_suggestions_user_phone_idx
  on public.meal_memory_suggestions (user_phone);

create index if not exists meal_memory_suggestions_status_idx
  on public.meal_memory_suggestions (status);

create index if not exists meal_memory_suggestions_user_normalized_idx
  on public.meal_memory_suggestions (user_phone, normalized_suggested_name);

-- ============================================================
-- Done. After running this:
--   • Manual save commands (`save this as ...`) will work immediately
--   • `my meals`, `delete meal …`, `rename meal …` will work immediately
--   • Auto-suggestions will start firing once a user has 3+ similar logs
--   • The dashboard's Meal Memory section will load
-- ============================================================
