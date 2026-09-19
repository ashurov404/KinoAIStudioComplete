-- Kino AI Studio V7 persistence/security layer. Does not modify Kino Yasa bot tables.
-- Run after schema_v5.sql and schema_v6.sql.
create extension if not exists pgcrypto;


-- Bind locations to projects for full cross-device scene continuity.
alter table public.studio_locations add column if not exists studio_project_id uuid references public.studio_projects(studio_project_id) on delete cascade;
create index if not exists studio_locations_project_idx on public.studio_locations(studio_project_id,studio_created_at desc);

create index if not exists studio_project_versions_project_idx on public.studio_project_versions(studio_project_id,studio_created_at desc);
create index if not exists studio_characters_project_idx on public.studio_characters(studio_project_id,studio_updated_at desc);
create index if not exists studio_shots_project_idx on public.studio_shots(studio_project_id,studio_created_at desc);
create index if not exists studio_jobs_owner_idx on public.studio_jobs(studio_owner_id,studio_created_at desc);

alter table public.studio_chat_messages enable row level security;
alter table public.studio_notifications enable row level security;
alter table public.studio_collaborations enable row level security;
alter table public.studio_partners enable row level security;
alter table public.studio_ads enable row level security;
alter table public.studio_payments enable row level security;
alter table public.studio_referrals enable row level security;
alter table public.studio_telegram_bots enable row level security;
alter table public.studio_api_clients enable row level security;
alter table public.studio_audit_logs enable row level security;
alter table public.studio_assets enable row level security;

do $$ begin
 if not exists(select 1 from pg_policies where policyname='studio_chat_owner' and tablename='studio_chat_messages') then create policy studio_chat_owner on public.studio_chat_messages for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin()); end if;
 if not exists(select 1 from pg_policies where policyname='studio_notifications_owner' and tablename='studio_notifications') then create policy studio_notifications_owner on public.studio_notifications for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin()); end if;
 if not exists(select 1 from pg_policies where policyname='studio_collab_member' and tablename='studio_collaborations') then create policy studio_collab_member on public.studio_collaborations for all using(studio_user_id=auth.uid() or public.studio_is_admin() or exists(select 1 from public.studio_projects p where p.studio_project_id=studio_collaborations.studio_project_id and p.studio_owner_id=auth.uid())) with check(studio_user_id=auth.uid() or public.studio_is_admin() or exists(select 1 from public.studio_projects p where p.studio_project_id=studio_collaborations.studio_project_id and p.studio_owner_id=auth.uid())); end if;
 if not exists(select 1 from pg_policies where policyname='studio_partners_admin' and tablename='studio_partners') then create policy studio_partners_admin on public.studio_partners for all using(public.studio_is_admin()) with check(public.studio_is_admin()); end if;
 if not exists(select 1 from pg_policies where policyname='studio_ads_admin' and tablename='studio_ads') then create policy studio_ads_admin on public.studio_ads for all using(public.studio_is_admin()) with check(public.studio_is_admin()); end if;
 if not exists(select 1 from pg_policies where policyname='studio_payments_owner' and tablename='studio_payments') then create policy studio_payments_owner on public.studio_payments for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin()); end if;
 if not exists(select 1 from pg_policies where policyname='studio_referrals_member' and tablename='studio_referrals') then create policy studio_referrals_member on public.studio_referrals for select using(studio_referrer_id=auth.uid() or studio_referred_id=auth.uid() or public.studio_is_admin()); end if;
 if not exists(select 1 from pg_policies where policyname='studio_bots_owner' and tablename='studio_telegram_bots') then create policy studio_bots_owner on public.studio_telegram_bots for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin()); end if;
 if not exists(select 1 from pg_policies where policyname='studio_api_clients_owner' and tablename='studio_api_clients') then create policy studio_api_clients_owner on public.studio_api_clients for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin()); end if;
 if not exists(select 1 from pg_policies where policyname='studio_audit_admin' and tablename='studio_audit_logs') then create policy studio_audit_admin on public.studio_audit_logs for select using(studio_actor_id=auth.uid() or public.studio_is_admin()); end if;
 if not exists(select 1 from pg_policies where policyname='studio_assets_owner' and tablename='studio_assets') then create policy studio_assets_owner on public.studio_assets for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin()); end if;
end $$;
