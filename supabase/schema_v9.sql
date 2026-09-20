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
