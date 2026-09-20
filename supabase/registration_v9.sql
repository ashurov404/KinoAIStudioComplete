
-- KINO AI STUDIO V9 REGISTRATION
-- Supabase SQL Editor'da bir marta ishga tushiriladi.

create table if not exists public.studio_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text not null,
  email text not null,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.studio_profiles enable row level security;

create policy "studio_profiles_select_own"
on public.studio_profiles
for select
to authenticated
using (auth.uid() = id);

create policy "studio_profiles_insert_own"
on public.studio_profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "studio_profiles_update_own"
on public.studio_profiles
for update
to authenticated
using (auth.uid() = id);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_upload_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_select_public"
on storage.objects
for select
to public
using (bucket_id = 'avatars');
