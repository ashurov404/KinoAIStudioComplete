create extension if not exists pgcrypto;

create table if not exists public.studio_admins(
 studio_admin_id uuid primary key default gen_random_uuid(),
 admin_email text unique not null,
 admin_active boolean not null default true,
 created_at timestamptz not null default now()
);
insert into public.studio_admins(admin_email) values('ashurovabdulqodir10@gmail.com') on conflict(admin_email) do update set admin_active=true;

create table if not exists public.studio_profiles(
 studio_profile_id uuid primary key references auth.users(id) on delete cascade,
 studio_email text, studio_full_name text, studio_avatar_url text,
 studio_role text not null default 'user', studio_created_at timestamptz default now(), studio_updated_at timestamptz default now()
);
create table if not exists public.studio_settings(
 studio_settings_id uuid primary key default gen_random_uuid(), studio_profile_id uuid unique references public.studio_profiles(studio_profile_id) on delete cascade,
 studio_language text default 'uz', studio_theme text default 'light', studio_ratio text default '9:16', studio_quality text default 'cinematic', studio_created_at timestamptz default now(), studio_updated_at timestamptz default now()
);
create table if not exists public.studio_projects(
 studio_project_id uuid primary key, studio_owner_id uuid not null references auth.users(id) on delete cascade,
 studio_name text not null, studio_description text default '', studio_status text default 'draft', studio_ratio text default 'Photorealistic Cinematic',
 studio_duration_seconds numeric default 0, studio_cover_url text, studio_public boolean default true,
 studio_owner_name text, studio_owner_email text, studio_created_at timestamptz default now(), studio_updated_at timestamptz default now()
);
create table if not exists public.studio_project_versions(
 studio_version_id uuid primary key default gen_random_uuid(), studio_project_id uuid references public.studio_projects(studio_project_id) on delete cascade,
 studio_version_number integer not null default 1, studio_payload jsonb default '{}'::jsonb, studio_created_at timestamptz default now()
);
create table if not exists public.studio_scripts(
 studio_script_id uuid primary key default gen_random_uuid(), studio_project_id uuid references public.studio_projects(studio_project_id) on delete cascade,
 studio_owner_id uuid references auth.users(id) on delete cascade, studio_title text, studio_content text default '', studio_status text default 'draft', studio_created_at timestamptz default now(), studio_updated_at timestamptz default now()
);
create table if not exists public.studio_script_versions(
 studio_script_version_id uuid primary key default gen_random_uuid(), studio_script_id uuid references public.studio_scripts(studio_script_id) on delete cascade,
 studio_version_number integer default 1, studio_content text default '', studio_ai_model text, studio_created_at timestamptz default now()
);
create table if not exists public.studio_characters(
 studio_character_id uuid primary key default gen_random_uuid(), studio_project_id uuid references public.studio_projects(studio_project_id) on delete cascade,
 studio_owner_id uuid references auth.users(id) on delete cascade, studio_name text not null, studio_role text, studio_profile jsonb default '{}'::jsonb, studio_continuity jsonb default '{}'::jsonb, studio_created_at timestamptz default now(), studio_updated_at timestamptz default now()
);
create table if not exists public.studio_scenes(
 studio_scene_id uuid primary key default gen_random_uuid(), studio_project_id uuid references public.studio_projects(studio_project_id) on delete cascade,
 studio_owner_id uuid references auth.users(id) on delete cascade, studio_title text, studio_graph jsonb default '{}'::jsonb, studio_created_at timestamptz default now()
);
create table if not exists public.studio_shots(
 studio_shot_id uuid primary key default gen_random_uuid(), studio_project_id uuid references public.studio_projects(studio_project_id) on delete cascade,
 studio_scene_id uuid references public.studio_scenes(studio_scene_id) on delete set null, studio_owner_id uuid references auth.users(id) on delete cascade,
 studio_title text, studio_duration_seconds numeric default 5, studio_camera jsonb default '{}'::jsonb, studio_lighting jsonb default '{}'::jsonb, studio_environment jsonb default '{}'::jsonb, studio_motion jsonb default '{}'::jsonb, studio_created_at timestamptz default now()
);
create table if not exists public.studio_jobs(
 studio_job_id uuid primary key default gen_random_uuid(), studio_project_id uuid references public.studio_projects(studio_project_id) on delete cascade,
 studio_owner_id uuid references auth.users(id) on delete cascade, studio_type text, studio_status text default 'queued', studio_error_code text,
 studio_progress numeric default 0, studio_payload jsonb default '{}'::jsonb, studio_result jsonb default '{}'::jsonb, studio_created_at timestamptz default now(), studio_updated_at timestamptz default now()
);
create table if not exists public.studio_movies(
 studio_movie_id uuid primary key default gen_random_uuid(), studio_project_id uuid references public.studio_projects(studio_project_id) on delete cascade,
 studio_owner_id uuid references auth.users(id) on delete cascade, studio_title text not null, studio_description text default '', studio_video_url text, studio_cover_url text,
 studio_public boolean default true, studio_creator_name text, studio_creator_email text, studio_status text default 'processing', studio_created_at timestamptz default now()
);
create table if not exists public.studio_assets(
 studio_asset_id uuid primary key default gen_random_uuid(), studio_project_id uuid references public.studio_projects(studio_project_id) on delete cascade,
 studio_owner_id uuid references auth.users(id) on delete cascade, studio_kind text, studio_storage_path text, studio_metadata jsonb default '{}'::jsonb, studio_created_at timestamptz default now()
);
create table if not exists public.studio_chat_messages(
 studio_message_id uuid primary key default gen_random_uuid(), studio_owner_id uuid references auth.users(id) on delete cascade, studio_project_id uuid references public.studio_projects(studio_project_id) on delete cascade,
 studio_role text, studio_content text, studio_created_at timestamptz default now()
);
create table if not exists public.studio_notifications(
 studio_notification_id uuid primary key default gen_random_uuid(), studio_owner_id uuid references auth.users(id) on delete cascade, studio_title text, studio_body text, studio_read boolean default false, studio_created_at timestamptz default now()
);
create table if not exists public.studio_collaborations(
 studio_collaboration_id uuid primary key default gen_random_uuid(), studio_project_id uuid references public.studio_projects(studio_project_id) on delete cascade, studio_user_id uuid references auth.users(id) on delete cascade, studio_role text default 'editor', studio_created_at timestamptz default now(), unique(studio_project_id,studio_user_id)
);
create table if not exists public.studio_partners(
 studio_partner_id uuid primary key default gen_random_uuid(), studio_name text not null, studio_contact text, studio_status text default 'active', studio_created_at timestamptz default now()
);
create table if not exists public.studio_ads(
 studio_ad_id uuid primary key default gen_random_uuid(), studio_partner_id uuid references public.studio_partners(studio_partner_id) on delete set null, studio_project_id uuid references public.studio_projects(studio_project_id) on delete set null, studio_title text, studio_payload jsonb default '{}'::jsonb, studio_status text default 'draft', studio_created_at timestamptz default now()
);
create table if not exists public.studio_payments(
 studio_payment_id uuid primary key default gen_random_uuid(), studio_owner_id uuid references auth.users(id) on delete cascade, studio_amount numeric default 0, studio_currency text default 'UZS', studio_status text default 'pending', studio_provider text, studio_created_at timestamptz default now()
);
create table if not exists public.studio_referrals(
 studio_referral_id uuid primary key default gen_random_uuid(), studio_referrer_id uuid references auth.users(id) on delete cascade, studio_referred_id uuid references auth.users(id) on delete cascade, studio_created_at timestamptz default now(), unique(studio_referrer_id,studio_referred_id)
);
create table if not exists public.studio_telegram_bots(
 studio_bot_id uuid primary key default gen_random_uuid(), studio_owner_id uuid references auth.users(id) on delete cascade, studio_bot_name text, studio_bot_username text, studio_status text default 'disconnected', studio_api_base_url text, studio_created_at timestamptz default now()
);
create table if not exists public.studio_api_clients(
 studio_api_client_id uuid primary key default gen_random_uuid(), studio_owner_id uuid references auth.users(id) on delete cascade, studio_name text, studio_role text default 'bot', studio_key_hash text, studio_active boolean default true, studio_created_at timestamptz default now()
);
create table if not exists public.studio_audit_logs(
 studio_audit_id uuid primary key default gen_random_uuid(), studio_actor_id uuid references auth.users(id) on delete set null, studio_action text, studio_target text, studio_payload jsonb default '{}'::jsonb, studio_created_at timestamptz default now()
);

create or replace function public.studio_is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.studio_admins a join auth.users u on lower(u.email)=lower(a.admin_email) where u.id=auth.uid() and a.admin_active=true);
$$;
revoke all on function public.studio_is_admin() from public;
grant execute on function public.studio_is_admin() to authenticated;

create or replace function public.studio_handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.studio_profiles(studio_profile_id,studio_email,studio_full_name,studio_role)
 values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',split_part(coalesce(new.email,''),'@',1)),case when lower(new.email)= 'ashurovabdulqodir10@gmail.com' then 'admin' else 'user' end)
 on conflict(studio_profile_id) do update set studio_email=excluded.studio_email,studio_role=excluded.studio_role,studio_updated_at=now();
 insert into public.studio_settings(studio_profile_id) values(new.id) on conflict(studio_profile_id) do nothing;
 return new;
end; $$;
drop trigger if exists studio_on_auth_user_created on auth.users;
create trigger studio_on_auth_user_created after insert on auth.users for each row execute procedure public.studio_handle_new_user();

alter table public.studio_profiles enable row level security;
alter table public.studio_settings enable row level security;
alter table public.studio_projects enable row level security;
alter table public.studio_project_versions enable row level security;
alter table public.studio_scripts enable row level security;
alter table public.studio_script_versions enable row level security;
alter table public.studio_characters enable row level security;
alter table public.studio_scenes enable row level security;
alter table public.studio_shots enable row level security;
alter table public.studio_jobs enable row level security;
alter table public.studio_movies enable row level security;

-- User-owned data policies
create policy studio_profiles_self on public.studio_profiles for all using(studio_profile_id=auth.uid() or public.studio_is_admin()) with check(studio_profile_id=auth.uid() or public.studio_is_admin());
create policy studio_settings_self on public.studio_settings for all using(studio_profile_id=auth.uid() or public.studio_is_admin()) with check(studio_profile_id=auth.uid() or public.studio_is_admin());
create policy studio_projects_owner on public.studio_projects for all using(studio_owner_id=auth.uid() or studio_public=true or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin());
create policy studio_versions_owner on public.studio_project_versions for all using(exists(select 1 from public.studio_projects p where p.studio_project_id=studio_project_versions.studio_project_id and (p.studio_owner_id=auth.uid() or public.studio_is_admin()))) with check(exists(select 1 from public.studio_projects p where p.studio_project_id=studio_project_versions.studio_project_id and (p.studio_owner_id=auth.uid() or public.studio_is_admin())));
create policy studio_scripts_owner on public.studio_scripts for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin());
create policy studio_script_versions_owner on public.studio_script_versions for all using(exists(select 1 from public.studio_scripts s where s.studio_script_id=studio_script_versions.studio_script_id and (s.studio_owner_id=auth.uid() or public.studio_is_admin()))) with check(exists(select 1 from public.studio_scripts s where s.studio_script_id=studio_script_versions.studio_script_id and (s.studio_owner_id=auth.uid() or public.studio_is_admin())));
create policy studio_characters_owner on public.studio_characters for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin());
create policy studio_scenes_owner on public.studio_scenes for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin());
create policy studio_shots_owner on public.studio_shots for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin());
create policy studio_jobs_owner on public.studio_jobs for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin());
create policy studio_movies_visible on public.studio_movies for select using(studio_public=true or studio_owner_id=auth.uid() or public.studio_is_admin());
create policy studio_movies_owner_write on public.studio_movies for all using(studio_owner_id=auth.uid() or public.studio_is_admin()) with check(studio_owner_id=auth.uid() or public.studio_is_admin());

-- Public creator/movie discovery: only public rows are readable; write remains owner/admin.
create index if not exists studio_projects_public_idx on public.studio_projects(studio_public,studio_created_at desc);
create index if not exists studio_movies_public_idx on public.studio_movies(studio_public,studio_created_at desc);
