# Supabase Migration Plan — Foody Music

Migrate from DatabasePad (`*.databasepad.com`) to a Supabase project you own at `*.supabase.co`.

**Status:** Preparation only. Production code still uses hardcoded credentials in `src/lib/supabase.ts` and `lib/supabase-config.ts` until the cutover phase.

---

## Phase 1 — Environment variables (planned, not yet wired)

### Variables to add

| Variable | Where used | Purpose |
|----------|------------|---------|
| `VITE_SUPABASE_URL` | Browser client (`src/lib/supabase.ts`) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Browser client | Public anon key |
| `SUPABASE_URL` | Server (`api/cookbook-pdf.ts`, `lib/supabase-config.ts`) | Same URL for API routes |
| `SUPABASE_ANON_KEY` | Server | Same anon key for JWT verification |

Add these to:

- `.env.local` (local dev)
- Vercel project settings (production + preview)

### Files to update at cutover (do not change yet)

| File | Change |
|------|--------|
| `src/lib/supabase.ts` | Read `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; throw if missing |
| `lib/supabase-config.ts` | Read `process.env.SUPABASE_URL` / `SUPABASE_ANON_KEY` with fallback to `VITE_*` for dev |
| `vite.config.ts` | Optionally mirror OpenAI pattern: load Supabase env in dev middleware |
| `.env.example` | Already updated with placeholders |

### Security notes

- Use the **anon** key only in client and server PDF route (with user JWT).
- Do **not** commit service-role keys.
- Remove hardcoded DatabasePad URL/key from git after cutover.

---

## Phase 2 — Database tables currently used

All tables live in the `public` schema. The app also depends on Supabase Auth’s built-in `auth.users` table (not app-managed).

### 1. `fm_profiles` (legacy — no migration file in repo)

**Used by:** `src/context/AppContext.tsx`

| Column | Type (inferred) | Usage |
|--------|-----------------|-------|
| `id` | `uuid` PK, FK → `auth.users(id)` | User id |
| `name` | `text` | Display name |
| `premium` | `boolean` | Premium flag |
| `saved_recipes` | `text[]` | Seed recipe ids (`"r1"`, etc.) |
| `clipped_coupons` | `text[]` | Coupon ids |
| `followed_artists` | `text[]` | Artist ids |
| `dietary` | `text[]` | Dietary preferences |
| `grocery` | `jsonb` | Shopping list `{ [item: string]: boolean }` |
| `updated_at` | `timestamptz` | Last profile sync |

**Operations:** `select`, `upsert`, `update` (RLS must allow owner-only access).

**Note:** Code comments reference a profile-creation trigger; if absent, the app upserts manually on first login.

### 2. `fm_cookbooks`

**Used by:** `src/services/cookbook.ts`, `api/cookbook-pdf.ts`

Cookbook metadata: title, subtitle, author, description, cover image URL, dedication, privacy, timestamps.

### 3. `fm_cookbook_sections`

**Used by:** `src/services/cookbook.ts`, `api/cookbook-pdf.ts`

Section dividers per cookbook (Breakfast, Lunch, custom, etc.) with `sort_order`.

### 4. `fm_cookbook_recipes`

**Used by:** `src/services/cookbook.ts`, `api/cookbook-pdf.ts`

Saved recipe snapshots (`recipe_snapshot` jsonb), personal notes, section assignment, sort order.

### Not stored in Supabase

- AI Concierge recipes (runtime only)
- Recipe/cookbook images (URLs or base64/blob — not Storage buckets)
- Seed catalog (`src/data/seed.ts`)
- Famous.ai CRM signup data (`Profile.tsx` → external API)

---

## Phase 3 — Authentication features used

All auth flows use **email + password** only. No OAuth, magic links, or phone auth via Supabase.

| Feature | API | File(s) | Notes |
|---------|-----|---------|-------|
| Sign up | `auth.signUp({ email, password, options: { data: { name } } })` | `AppContext.tsx`, `Profile.tsx` | Supports email-confirmation flow |
| Sign in | `auth.signInWithPassword({ email, password })` | `AppContext.tsx`, `Profile.tsx` | |
| Sign out | `auth.signOut()` | `AppContext.tsx` | |
| Session bootstrap | `auth.getSession()` | `AppContext.tsx` | On app load |
| Auth state listener | `auth.onAuthStateChange()` | `AppContext.tsx` | Login/logout/profile reload |
| Read user metadata | `user.user_metadata.name` | `AppContext.tsx` | Fallback display name |
| Access token for PDF | `auth.getSession()` → `access_token` | `AddToCookbookButton.tsx` | Sent as `Authorization: Bearer` |
| Server JWT verify | `auth.getUser(token)` | `api/cookbook-pdf.ts` | Validates export requests |

### Supabase Auth settings to configure on new project

- Enable **Email** provider
- Decide **email confirmation** on/off (app handles both: immediate session vs “check your email”)
- No third-party OAuth providers required for feature parity

### External auth-related integration (not Supabase)

- `Profile.tsx` posts signup to **Famous.ai CRM** — keep or replace separately; not part of Supabase migration

---

## Phase 4 — Storage buckets

**None.** The codebase does not call `supabase.storage`, upload files, or reference bucket names.

Images are handled as:

- External URLs in cookbook `cover_image` and recipe snapshots
- AI-generated images via OpenAI (`/api/recipe-image`) stored in memory/blob URLs
- Static assets in `/public`

No Storage buckets need to be created on the new Supabase project for feature parity.

---

## Phase 5 — SQL migrations to run (fresh Supabase project)

Run in order in the Supabase SQL Editor (or via Supabase CLI).

### Migration A — `000_fm_profiles.sql` (must be authored — missing from repo)

This table existed on DatabasePad but was never checked into git. Create before cookbooks:

```sql
-- 000_fm_profiles.sql (inferred from AppContext.tsx — verify before running)

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

-- Optional: auto-create profile on signup (app also upserts manually)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.fm_profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Migration B — `001_cookbooks.sql` (exists in repo)

**Path:** `supabase/migrations/001_cookbooks.sql`

Creates:

- `fm_cookbooks`
- `fm_cookbook_sections`
- `fm_cookbook_recipes`
- Indexes and RLS policies (owner write, public read for public cookbooks)

---

## Phase 6 — Cutover checklist (future)

1. Create Supabase project at supabase.com
2. Run Migration A then Migration B
3. Configure Auth (email provider, confirmation preference)
4. Add env vars locally and on Vercel
5. Wire `src/lib/supabase.ts` and `lib/supabase-config.ts` to env vars
6. Deploy and smoke-test: sign up, profile sync, cookbook CRUD, PDF export
7. (Optional) Export users/data from DatabasePad if migration of existing users is needed
8. Remove hardcoded DatabasePad credentials from git history consideration

---

## Phase 7 — Feature impact matrix

| Feature | Supabase dependency | Migration risk |
|---------|--------------------|----------------|
| AI Concierge | None | None |
| Hey Foody | None | None |
| Recipe images | None (OpenAI) | None |
| Shopping list | `fm_profiles.grocery` | Low |
| Saved recipes / coupons / artists | `fm_profiles` arrays | Low |
| Profile / sign-in | Auth + `fm_profiles` | Medium |
| My Cookbooks | 3 cookbook tables | Medium |
| PDF export | Auth JWT + cookbook tables | Medium |
| Famous.ai CRM signup | External | Out of scope |

**No features need to be removed** if migrations and env cutover are completed.
