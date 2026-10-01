-- Kino AI Studio V9: advertising payment review + admin rule requests.
-- Existing bot tables are intentionally untouched.
create table if not exists public.studio_ad_payment_requests (
  id uuid primary key default gen_random_uuid(),
  studio_user_id uuid,
  user_email text not null,
  kind text not null default 'advertising',
  amount_text text,
  receipt_path text,
  receipt_name text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

create table if not exists public.studio_admin_rule_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by text not null,
  request_text text not null,
  target text,
  proposed_action text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

alter table public.studio_ad_payment_requests enable row level security;
alter table public.studio_admin_rule_requests enable row level security;

-- Users may create/read their own payment requests. Admin access should be enforced by a backend/admin role in production.
drop policy if exists studio_ad_payment_insert on public.studio_ad_payment_requests;
create policy studio_ad_payment_insert on public.studio_ad_payment_requests for insert with check (true);
drop policy if exists studio_ad_payment_select_own on public.studio_ad_payment_requests;
create policy studio_ad_payment_select_own on public.studio_ad_payment_requests for select using (studio_user_id = auth.uid());


-- V9.1: real account/profile/chat/context persistence.
create table if not exists public.studio_profiles (
  studio_user_id uuid primary key references auth.users(id) on delete cascade,
  studio_full_name text not null,
  studio_email text,
  studio_avatar_data text,
  studio_created_at timestamptz not null default now(),
  studio_updated_at timestamptz not null default now()
);
create table if not exists public.studio_project_context (
  studio_project_id uuid primary key,
  studio_user_id uuid not null references auth.users(id) on delete cascade,
  studio_script text default '',
  studio_context jsonb not null default '{}'::jsonb,
  studio_updated_at timestamptz not null default now()
);
create table if not exists public.studio_api_keys (
  studio_key_id uuid primary key default gen_random_uuid(),
  studio_user_id uuid not null references auth.users(id) on delete cascade,
  studio_key text not null unique,
  studio_label text not null default 'Default API key',
  studio_created_at timestamptz not null default now(),
  studio_revoked_at timestamptz
);
alter table public.studio_profiles enable row level security;
alter table public.studio_project_context enable row level security;
alter table public.studio_api_keys enable row level security;
drop policy if exists studio_profiles_owner on public.studio_profiles;
create policy studio_profiles_owner on public.studio_profiles for all using(studio_user_id=auth.uid()) with check(studio_user_id=auth.uid());
drop policy if exists studio_context_owner on public.studio_project_context;
create policy studio_context_owner on public.studio_project_context for all using(studio_user_id=auth.uid()) with check(studio_user_id=auth.uid());
drop policy if exists studio_api_keys_owner on public.studio_api_keys;
create policy studio_api_keys_owner on public.studio_api_keys for all using(studio_user_id=auth.uid()) with check(studio_user_id=auth.uid());

do $$ begin
 if not exists(select 1 from pg_policies where policyname='studio_ad_payment_admin' and tablename='studio_ad_payment_requests') then
  create policy studio_ad_payment_admin on public.studio_ad_payment_requests for all
  using(public.studio_is_admin()) with check(public.studio_is_admin());
 end if;
end $$;
