# Supabase migrations

Run these SQL files **in order** in the Supabase SQL Editor for a new project:

1. `migrations/000_fm_profiles.sql` — user profiles, grocery list, saved content
2. `migrations/001_cookbooks.sql` — My Cookbooks tables and RLS

See [docs/SUPABASE_MIGRATION_PLAN.md](../docs/SUPABASE_MIGRATION_PLAN.md) for the full cutover plan and environment setup.

Environment template: [.env.supabase.example](../.env.supabase.example)
