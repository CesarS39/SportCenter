-- Lock down direct client access to all application tables.
--
-- This project previously ran with Supabase RLS disabled, meaning any client
-- holding the anon/authenticated key could read and write every table
-- directly (courts, reservations, user_profiles, sport_types).
--
-- From now on, all data access must go through the Next.js server (API
-- routes / server actions), which connects to Postgres using the `postgres`
-- role (BYPASSRLS) via Prisma. The `anon` and `authenticated` roles used by
-- the Supabase client SDK are stripped of table privileges and RLS is
-- enabled with zero policies, which is a default-deny for those roles.
-- Supabase Auth (auth.users) is untouched by this migration.

-- 1. Enable RLS on every application table.
alter table public.sport_types   enable row level security;
alter table public.courts        enable row level security;
alter table public.user_profiles enable row level security;
alter table public.reservations  enable row level security;

-- FORCE so even the table owner is subject to RLS (defense in depth; the
-- `postgres` role still bypasses RLS entirely because of its BYPASSRLS
-- attribute, independent of FORCE ROW LEVEL SECURITY).
alter table public.sport_types   force row level security;
alter table public.courts        force row level security;
alter table public.user_profiles force row level security;
alter table public.reservations  force row level security;

-- 2. Revoke all table-level privileges from the client-facing roles.
-- No policies are created for `anon` / `authenticated`, so this is a
-- belt-and-suspenders default-deny: even if a future migration grants
-- privileges back, RLS with no policies still blocks all access.
revoke all on public.sport_types   from anon, authenticated;
revoke all on public.courts        from anon, authenticated;
revoke all on public.user_profiles from anon, authenticated;
revoke all on public.reservations  from anon, authenticated;

-- 3. Revoke usage on sequences too (defensive; this schema uses cuid()
-- defaults, not serial sequences, but keeps future serial columns safe).
revoke all on all sequences in schema public from anon, authenticated;
