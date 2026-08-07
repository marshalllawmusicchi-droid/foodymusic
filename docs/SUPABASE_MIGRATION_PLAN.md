# Supabase Migration Plan — Foody Music

Migrate from DatabasePad (`*.databasepad.com`) to a Supabase project you own at `*.supabase.co`.

**Status:** Wired to environment variables. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` and Vercel.

---

## Phase 1 — Environment variables (planned, not yet wired)

### Variables to add

| Variable | Where used | Purpose |
|----------|------------|---------|
| `VITE_SUPABASE_URL` | Browser client (`src/lib/supabase.ts`) and server (`lib/supabase-config.ts`) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Browser client and server | Public anon key |

Add these to:

- `.env.local` (local dev) — use [.env.supabase.example](../.env.supabase.example) as a template
- Vercel project settings (production + preview)

### Files updated for env-based configuration

| File | Change |
|------|--------|
| `src/lib/supabase.ts` | Reads `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| `lib/supabase-config.ts` | Reads `process.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| `vite.config.ts` | Loads Supabase env for local API middleware |

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

### Migration A — `000_fm_profiles.sql`

**Path:** `supabase/migrations/000_fm_profiles.sql`

Creates `fm_profiles` with owner-only RLS and an `auth.users` trigger to auto-create profiles on signup (the app also upserts manually as a fallback).

### Migration B — `001_cookbooks.sql`

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
