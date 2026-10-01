-- Kino AI Studio V6 migration layer. Existing kino-bot tables are not modified.
create table if not exists public.studio_rules (
  studio_rule_id uuid primary key default gen_random_uuid(),
  studio_rule_text text not null,
  studio_rule_active boolean not null default true,
  studio_created_at timestamptz not null default now(),
  studio_updated_at timestamptz not null default now()
);
create table if not exists public.studio_api_configs (
  studio_config_id uuid primary key default gen_random_uuid(),
  studio_owner_id uuid references auth.users(id) on delete cascade,
  studio_provider text not null,
  studio_endpoint text,
  studio_public_key text,
  studio_enabled boolean not null default false,
  studio_created_at timestamptz not null default now(),
  studio_updated_at timestamptz not null default now()
);
create table if not exists public.studio_locations (
  studio_location_id uuid primary key default gen_random_uuid(),
  studio_owner_id uuid references auth.users(id) on delete cascade,
  studio_name text not null,
  studio_type text not null default 'custom',
  studio_description text default '',
  studio_payload jsonb not null default '{}'::jsonb,
  studio_public boolean not null default false,
  studio_created_at timestamptz not null default now(),
  studio_updated_at timestamptz not null default now()
);
create table if not exists public.studio_public_movies (
  studio_movie_id uuid primary key default gen_random_uuid(),
  studio_owner_id uuid references auth.users(id) on delete cascade not null,
  studio_project_id uuid references public.studio_projects(studio_project_id) on delete set null,
  studio_title text not null,
  studio_creator_name text,
  studio_video_url text,
  studio_cover_url text,
  studio_description text default '',
  studio_public boolean not null default true,
  studio_created_at timestamptz not null default now()
);
alter table public.studio_rules enable row level security;
alter table public.studio_locations enable row level security;
alter table public.studio_public_movies enable row level security;
do $$ begin if not exists (select 1 from pg_policies where policyname='studio_rules_read' and tablename='studio_rules') then create policy studio_rules_read on public.studio_rules for select using (studio_rule_active=true); end if; end $$;
do $$ begin if not exists (select 1 from pg_policies where policyname='studio_locations_owner' and tablename='studio_locations') then create policy studio_locations_owner on public.studio_locations for all using (studio_owner_id=auth.uid()) with check (studio_owner_id=auth.uid()); end if; end $$;
do $$ begin if not exists (select 1 from pg_policies where policyname='studio_movies_public_read' and tablename='studio_public_movies') then create policy studio_movies_public_read on public.studio_public_movies for select using (studio_public=true or studio_owner_id=auth.uid()); end if; end $$;
do $$ begin if not exists (select 1 from pg_policies where policyname='studio_movies_owner_write' and tablename='studio_public_movies') then create policy studio_movies_owner_write on public.studio_public_movies for all using (studio_owner_id=auth.uid()) with check (studio_owner_id=auth.uid()); end if; end $$;
