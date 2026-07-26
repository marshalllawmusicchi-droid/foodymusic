-- Foody Music user profiles
-- Run before 001_cookbooks.sql on a fresh Supabase project.

create table if not exists public.fm_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  premium boolean not null default false,
  saved_recipes text[] not null default '{}',
  clipped_coupons text[] not null default '{}',
  followed_artists text[] not null default '{}',
  dietary text[] not null default '{}',
  grocery jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.fm_profiles enable row level security;

create policy "Users manage own profile"
  on public.fm_profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.fm_profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
