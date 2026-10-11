-- Foody Music — 3-day (72-hour) trial usage tracking
-- Run after 002_cookbook_grants.sql (or after 001 if grants are not applied yet).
-- Does not modify earlier migrations.

-- ---------------------------------------------------------------------------
-- Profile columns: trial window, subscription status, usage counters
-- ---------------------------------------------------------------------------

alter table public.fm_profiles
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists subscription_status text not null default 'trial',
  add column if not exists usage_day date not null default ((timezone('utc', now()))::date),
  add column if not exists concierge_uses_today integer not null default 0,
  add column if not exists concierge_uses_total integer not null default 0,
  add column if not exists image_uses_today integer not null default 0,
  add column if not exists image_uses_total integer not null default 0,
  add column if not exists hey_foody_uses_today integer not null default 0,
  add column if not exists hey_foody_uses_total integer not null default 0,
  add column if not exists pdf_exports_total integer not null default 0;

alter table public.fm_profiles
  drop constraint if exists fm_profiles_subscription_status_check;

alter table public.fm_profiles
  add constraint fm_profiles_subscription_status_check
  check (subscription_status in ('trial', 'premium', 'expired'));

alter table public.fm_profiles
  drop constraint if exists fm_profiles_concierge_uses_today_nonneg;

alter table public.fm_profiles
  add constraint fm_profiles_concierge_uses_today_nonneg
  check (concierge_uses_today >= 0);

alter table public.fm_profiles
  drop constraint if exists fm_profiles_concierge_uses_total_nonneg;

alter table public.fm_profiles
  add constraint fm_profiles_concierge_uses_total_nonneg
  check (concierge_uses_total >= 0);

alter table public.fm_profiles
  drop constraint if exists fm_profiles_image_uses_today_nonneg;

alter table public.fm_profiles
  add constraint fm_profiles_image_uses_today_nonneg
  check (image_uses_today >= 0);

alter table public.fm_profiles
  drop constraint if exists fm_profiles_image_uses_total_nonneg;

alter table public.fm_profiles
  add constraint fm_profiles_image_uses_total_nonneg
  check (image_uses_total >= 0);

alter table public.fm_profiles
  drop constraint if exists fm_profiles_hey_foody_uses_today_nonneg;

alter table public.fm_profiles
  add constraint fm_profiles_hey_foody_uses_today_nonneg
  check (hey_foody_uses_today >= 0);

alter table public.fm_profiles
  drop constraint if exists fm_profiles_hey_foody_uses_total_nonneg;

alter table public.fm_profiles
  add constraint fm_profiles_hey_foody_uses_total_nonneg
  check (hey_foody_uses_total >= 0);

alter table public.fm_profiles
  drop constraint if exists fm_profiles_pdf_exports_total_nonneg;

alter table public.fm_profiles
  add constraint fm_profiles_pdf_exports_total_nonneg
  check (pdf_exports_total >= 0);

-- Existing accounts: no retroactive trial. Preserve current premium entitlement.
-- (New signups after this migration receive trial_started_at from handle_new_user.)
update public.fm_profiles
set subscription_status = case
  when premium is true then 'premium'
  else 'expired'
end
where trial_started_at is null;

-- ---------------------------------------------------------------------------
-- New-user trial initialization (72 hours from signup)
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  started_at timestamptz := now();
begin
  insert into public.fm_profiles (
    id,
    name,
    trial_started_at,
    trial_ends_at,
    subscription_status,
    usage_day,
    concierge_uses_today,
    concierge_uses_total,
    image_uses_today,
    image_uses_total,
    hey_foody_uses_today,
    hey_foody_uses_total,
    pdf_exports_total
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    started_at,
    started_at + interval '72 hours',
    'trial',
    (timezone('utc', started_at))::date,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Block client writes to trial, subscription, usage, and premium fields
-- ---------------------------------------------------------------------------

create or replace function public.protect_fm_profiles_trial_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') = 'service_role'
     or current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if new.trial_started_at is distinct from old.trial_started_at
     or new.trial_ends_at is distinct from old.trial_ends_at
     or new.subscription_status is distinct from old.subscription_status
     or new.usage_day is distinct from old.usage_day
     or new.concierge_uses_today is distinct from old.concierge_uses_today
     or new.concierge_uses_total is distinct from old.concierge_uses_total
     or new.image_uses_today is distinct from old.image_uses_today
     or new.image_uses_total is distinct from old.image_uses_total
     or new.hey_foody_uses_today is distinct from old.hey_foody_uses_today
     or new.hey_foody_uses_total is distinct from old.hey_foody_uses_total
     or new.pdf_exports_total is distinct from old.pdf_exports_total
     or new.premium is distinct from old.premium then
    raise exception 'Trial, subscription, and usage fields are read-only';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_fm_profiles_trial_fields on public.fm_profiles;

create trigger protect_fm_profiles_trial_fields
  before update on public.fm_profiles
  for each row
  execute function public.protect_fm_profiles_trial_fields();

-- ---------------------------------------------------------------------------
-- Atomic trial usage check + increment (server-side only)
-- Features: concierge, image, hey_foody, pdf
-- Trial caps:
--   concierge  — 3/day, 9 total
--   image      — 1/day, 3 total
--   hey_foody  — 5/day, 15 total
--   pdf        — 1 total (no daily cap)
-- Premium: allowed (paid limits TBD; counters not incremented here)
-- Expired: blocked
-- ---------------------------------------------------------------------------

create or replace function public.increment_usage_if_allowed(
  p_user_id uuid,
  p_feature text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  profile public.fm_profiles%rowtype;
  today date := (timezone('utc', now()))::date;
  daily_cap integer;
  total_cap integer;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role'
     and current_user not in ('postgres', 'supabase_admin') then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'forbidden',
      'status', null,
      'feature', p_feature
    );
  end if;

  if p_feature not in ('concierge', 'image', 'hey_foody', 'pdf') then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'invalid_feature',
      'status', null,
      'feature', p_feature
    );
  end if;

  select *
  into profile
  from public.fm_profiles
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'profile_not_found',
      'status', null,
      'feature', p_feature
    );
  end if;

  if profile.subscription_status = 'trial'
     and profile.trial_ends_at is not null
     and now() >= profile.trial_ends_at then
    update public.fm_profiles
    set subscription_status = 'expired',
        updated_at = now()
    where id = p_user_id;

    profile.subscription_status := 'expired';
  end if;

  if profile.subscription_status = 'expired' then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'trial_expired',
      'status', 'expired',
      'feature', p_feature
    );
  end if;

  if profile.subscription_status = 'premium' then
    return jsonb_build_object(
      'allowed', true,
      'reason', 'premium',
      'status', 'premium',
      'feature', p_feature
    );
  end if;

  if profile.subscription_status <> 'trial' then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'invalid_status',
      'status', profile.subscription_status,
      'feature', p_feature
    );
  end if;

  if profile.usage_day is distinct from today then
    update public.fm_profiles
    set usage_day = today,
        concierge_uses_today = 0,
        image_uses_today = 0,
        hey_foody_uses_today = 0,
        updated_at = now()
    where id = p_user_id;

    profile.usage_day := today;
    profile.concierge_uses_today := 0;
    profile.image_uses_today := 0;
    profile.hey_foody_uses_today := 0;
  end if;

  case p_feature
    when 'concierge' then
      daily_cap := 3;
      total_cap := 9;

      if profile.concierge_uses_today >= daily_cap
         or profile.concierge_uses_total >= total_cap then
        return jsonb_build_object(
          'allowed', false,
          'reason', 'trial_cap_reached',
          'status', 'trial',
          'feature', p_feature
        );
      end if;

      update public.fm_profiles
      set concierge_uses_today = concierge_uses_today + 1,
          concierge_uses_total = concierge_uses_total + 1,
          updated_at = now()
      where id = p_user_id;

    when 'image' then
      daily_cap := 1;
      total_cap := 3;

      if profile.image_uses_today >= daily_cap
         or profile.image_uses_total >= total_cap then
        return jsonb_build_object(
          'allowed', false,
          'reason', 'trial_cap_reached',
          'status', 'trial',
          'feature', p_feature
        );
      end if;

      update public.fm_profiles
      set image_uses_today = image_uses_today + 1,
          image_uses_total = image_uses_total + 1,
          updated_at = now()
      where id = p_user_id;

    when 'hey_foody' then
      daily_cap := 5;
      total_cap := 15;

      if profile.hey_foody_uses_today >= daily_cap
         or profile.hey_foody_uses_total >= total_cap then
        return jsonb_build_object(
          'allowed', false,
          'reason', 'trial_cap_reached',
          'status', 'trial',
          'feature', p_feature
        );
      end if;

      update public.fm_profiles
      set hey_foody_uses_today = hey_foody_uses_today + 1,
          hey_foody_uses_total = hey_foody_uses_total + 1,
          updated_at = now()
      where id = p_user_id;

    when 'pdf' then
      total_cap := 1;

      if profile.pdf_exports_total >= total_cap then
        return jsonb_build_object(
          'allowed', false,
          'reason', 'trial_cap_reached',
          'status', 'trial',
          'feature', p_feature
        );
      end if;

      update public.fm_profiles
      set pdf_exports_total = pdf_exports_total + 1,
          updated_at = now()
      where id = p_user_id;
  end case;

  return jsonb_build_object(
    'allowed', true,
    'reason', 'ok',
    'status', 'trial',
    'feature', p_feature
  );
end;
$$;

revoke all on function public.increment_usage_if_allowed(uuid, text) from public;
revoke all on function public.increment_usage_if_allowed(uuid, text) from anon;
revoke all on function public.increment_usage_if_allowed(uuid, text) from authenticated;

grant execute on function public.increment_usage_if_allowed(uuid, text) to service_role;
