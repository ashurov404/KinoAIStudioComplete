-- V8 full platform layer. Only studio_* tables are touched.
create table if not exists public.studio_render_frames(
 studio_frame_id uuid primary key default gen_random_uuid(), studio_job_id uuid, studio_project_id uuid not null, studio_owner_id uuid not null,
 studio_frame_number integer not null, studio_width integer not null, studio_height integer not null, studio_asset_url text, studio_status text not null default 'ready', studio_created_at timestamptz default now()
);
create table if not exists public.studio_voice_tracks(
 studio_voice_id uuid primary key default gen_random_uuid(), studio_project_id uuid not null, studio_owner_id uuid not null,
 studio_character_id uuid, studio_text text, studio_voice_config jsonb default '{}'::jsonb, studio_audio_url text, studio_lipsync jsonb default '{}'::jsonb, studio_created_at timestamptz default now()
);
create table if not exists public.studio_library_items(
 studio_library_id uuid primary key default gen_random_uuid(), studio_project_id uuid, studio_owner_id uuid not null,
 studio_title text not null, studio_kind text not null, studio_public boolean default false, studio_video_url text, studio_thumbnail_url text, studio_payload jsonb default '{}'::jsonb, studio_created_at timestamptz default now()
);
create table if not exists public.studio_rule_versions(
 studio_rule_version_id uuid primary key default gen_random_uuid(), studio_owner_id uuid not null, studio_rules jsonb not null, studio_created_at timestamptz default now()
);
create table if not exists public.studio_job_events(
 studio_event_id uuid primary key default gen_random_uuid(), studio_job_id uuid, studio_owner_id uuid not null, studio_status text not null, studio_message text, studio_created_at timestamptz default now()
);
alter table public.studio_render_frames enable row level security; alter table public.studio_voice_tracks enable row level security; alter table public.studio_library_items enable row level security; alter table public.studio_rule_versions enable row level security; alter table public.studio_job_events enable row level security;
do $$ begin
 if not exists(select 1 from pg_policies where policyname='render_frames_owner' and tablename='studio_render_frames') then create policy render_frames_owner on public.studio_render_frames for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin()); end if;
 if not exists(select 1 from pg_policies where policyname='voice_tracks_owner' and tablename='studio_voice_tracks') then create policy voice_tracks_owner on public.studio_voice_tracks for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin()); end if;
 if not exists(select 1 from pg_policies where policyname='library_items_owner' and tablename='studio_library_items') then create policy library_items_owner on public.studio_library_items for all using(studio_owner_id=auth.uid() or studio_public=true or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin()); end if;
 if not exists(select 1 from pg_policies where policyname='rule_versions_admin' and tablename='studio_rule_versions') then create policy rule_versions_admin on public.studio_rule_versions for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin()); end if;
 if not exists(select 1 from pg_policies where policyname='job_events_owner' and tablename='studio_job_events') then create policy job_events_owner on public.studio_job_events for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin()); end if;
end $$;
create unique index if not exists studio_public_movies_project_unique on public.studio_public_movies(studio_project_id) where studio_project_id is not null;
create unique index if not exists studio_library_project_unique on public.studio_library_items(studio_project_id) where studio_project_id is not null;

-- V8.1 admin-controlled declarative rules.
-- These rules are data/configuration only. They cannot execute source code.
create table if not exists public.studio_rules(
 studio_rule_id uuid primary key default gen_random_uuid(),
 studio_owner_id uuid not null references auth.users(id) on delete cascade,
 studio_text text not null,
 studio_target text not null default 'all',
 studio_action text not null default 'require',
 studio_active boolean not null default true,
 studio_created_at timestamptz default now(),
 studio_updated_at timestamptz default now()
);
alter table public.studio_rules add column if not exists studio_owner_id uuid references auth.users(id) on delete cascade;
alter table public.studio_rules add column if not exists studio_text text;
alter table public.studio_rules add column if not exists studio_target text not null default 'all';
alter table public.studio_rules add column if not exists studio_action text not null default 'require';
alter table public.studio_rules add column if not exists studio_active boolean not null default true;
update public.studio_rules set studio_text=coalesce(studio_text,studio_rule_text) where studio_text is null;
alter table public.studio_rules enable row level security;
do $$ begin
 if not exists(select 1 from pg_policies where policyname='studio_rules_owner_admin' and tablename='studio_rules') then
  create policy studio_rules_owner_admin on public.studio_rules for all
  using(studio_owner_id=auth.uid() or public.studio_is_admin())
  with check(studio_owner_id=auth.uid() or public.studio_is_admin());
 end if;
end $$;

create table if not exists public.studio_admin_change_requests(
 studio_change_id uuid primary key default gen_random_uuid(),
 studio_owner_id uuid references auth.users(id) on delete set null,
 studio_request text not null,
 studio_plan jsonb not null default '{}'::jsonb,
 studio_status text not null default 'pending',
 studio_created_at timestamptz default now(),
 studio_approved_at timestamptz
);
alter table public.studio_admin_change_requests enable row level security;
do $$ begin
 if not exists(select 1 from pg_policies where policyname='admin_changes_admin_only' and tablename='studio_admin_change_requests') then
  create policy admin_changes_admin_only on public.studio_admin_change_requests for all
  using(public.studio_is_admin())
  with check(public.studio_is_admin());
 end if;
end $$;
