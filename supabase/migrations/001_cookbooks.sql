-- Foody Music Cookbook Builder
-- Run this migration in your Supabase SQL editor before using My Cookbooks.

create extension if not exists "pgcrypto";

create table if not exists public.fm_cookbooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  subtitle text,
  author_name text,
  description text,
  cover_image text,
  dedication text,
  privacy text not null default 'private' check (privacy in ('private', 'public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fm_cookbook_sections (
  id uuid primary key default gen_random_uuid(),
  cookbook_id uuid not null references public.fm_cookbooks (id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.fm_cookbook_recipes (
  id uuid primary key default gen_random_uuid(),
  cookbook_id uuid not null references public.fm_cookbooks (id) on delete cascade,
  section_id uuid references public.fm_cookbook_sections (id) on delete set null,
  sort_order integer not null default 0,
  recipe_snapshot jsonb not null,
  personal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fm_cookbooks_user_id_idx on public.fm_cookbooks (user_id);
create index if not exists fm_cookbook_sections_cookbook_id_idx on public.fm_cookbook_sections (cookbook_id);
create index if not exists fm_cookbook_recipes_cookbook_id_idx on public.fm_cookbook_recipes (cookbook_id);
create index if not exists fm_cookbook_recipes_section_id_idx on public.fm_cookbook_recipes (section_id);

alter table public.fm_cookbooks enable row level security;
alter table public.fm_cookbook_sections enable row level security;
alter table public.fm_cookbook_recipes enable row level security;

create policy "Users manage own cookbooks"
  on public.fm_cookbooks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own cookbook sections"
  on public.fm_cookbook_sections
  for all
  using (
    exists (
      select 1 from public.fm_cookbooks c
      where c.id = fm_cookbook_sections.cookbook_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.fm_cookbooks c
      where c.id = fm_cookbook_sections.cookbook_id and c.user_id = auth.uid()
    )
  );

create policy "Users manage own cookbook recipes"
  on public.fm_cookbook_recipes
  for all
  using (
    exists (
      select 1 from public.fm_cookbooks c
      where c.id = fm_cookbook_recipes.cookbook_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.fm_cookbooks c
      where c.id = fm_cookbook_recipes.cookbook_id and c.user_id = auth.uid()
    )
  );

create policy "Public cookbooks are readable"
  on public.fm_cookbooks
  for select
  using (privacy = 'public' or auth.uid() = user_id);

create policy "Public cookbook sections are readable"
  on public.fm_cookbook_sections
  for select
  using (
    exists (
      select 1 from public.fm_cookbooks c
      where c.id = fm_cookbook_sections.cookbook_id
        and (c.privacy = 'public' or c.user_id = auth.uid())
    )
  );

create policy "Public cookbook recipes are readable"
  on public.fm_cookbook_recipes
  for select
  using (
    exists (
      select 1 from public.fm_cookbooks c
      where c.id = fm_cookbook_recipes.cookbook_id
        and (c.privacy = 'public' or c.user_id = auth.uid())
    )
  );
