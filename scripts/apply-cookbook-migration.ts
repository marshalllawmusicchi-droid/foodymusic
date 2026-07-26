/**
 * One-shot migration runner for cookbook tables.
 * Uses configured Supabase credentials from lib/supabase-config.ts
 *
 * Run: npx tsx scripts/apply-cookbook-migration.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../lib/supabase-config.js";

const migrationSql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/001_cookbooks.sql"),
  "utf8",
);

const TABLES = ["fm_cookbooks", "fm_cookbook_sections", "fm_cookbook_recipes"] as const;

async function tableExists(supabase: ReturnType<typeof createClient>, table: string) {
  const { error } = await supabase.from(table).select("*", { head: true, count: "exact" });
  if (!error) return true;
  const message = error.message.toLowerCase();
  return !message.includes("does not exist") && !message.includes("could not find") && !message.includes("404");
}

async function verifyTables(supabase: ReturnType<typeof createClient>) {
  const results: Record<string, boolean> = {};
  for (const table of TABLES) {
    results[table] = await tableExists(supabase, table);
  }
  return results;
}

async function tryExecSqlRpc(supabase: ReturnType<typeof createClient>) {
  const candidates = ["exec_sql", "run_sql", "execute_sql", "_exec_sql"];
  for (const fn of candidates) {
    const { error } = await supabase.rpc(fn, { sql: migrationSql, query: migrationSql });
    if (!error) return { ok: true as const, fn };
    if (!/could not find the function|404|not found/i.test(error.message)) {
      return { ok: false as const, fn, error: error.message };
    }
  }
  return { ok: false as const, fn: null, error: "No SQL RPC function available." };
}

async function testCookbookFlow(supabase: ReturnType<typeof createClient>) {
  const email = `cookbook-test-${Date.now()}@foodymusic.test`;
  const password = `TestPass!${Date.now().toString().slice(-6)}`;

  const signUp = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: "Cookbook Migration Test" } },
  });
  if (signUp.error) throw new Error(`Sign up failed: ${signUp.error.message}`);

  const session = signUp.data.session;
  if (!session?.user) {
    throw new Error("Sign up succeeded but no session was returned (email confirmation may be required).");
  }

  const authed = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${session.access_token}` } },
  });

  const userId = session.user.id;
  const { data: cookbook, error: cookbookError } = await authed
    .from("fm_cookbooks")
    .insert({
      user_id: userId,
      title: "Migration Test Cookbook",
      subtitle: "Automated verification",
      author_name: "Foody Music",
      description: "Created by apply-cookbook-migration.ts",
      privacy: "private",
    })
    .select("*")
    .single();
  if (cookbookError) throw new Error(`Cookbook insert failed: ${cookbookError.message}`);

  const { data: sections, error: sectionError } = await authed
    .from("fm_cookbook_sections")
    .insert([
      { cookbook_id: cookbook.id, title: "Breakfast", sort_order: 0 },
      { cookbook_id: cookbook.id, title: "Dinner", sort_order: 1 },
    ])
    .select("*");
  if (sectionError) throw new Error(`Section insert failed: ${sectionError.message}`);

  const { data: recipe, error: recipeError } = await authed
    .from("fm_cookbook_recipes")
    .insert({
      cookbook_id: cookbook.id,
      section_id: sections?.[0]?.id ?? null,
      sort_order: 0,
      recipe_snapshot: {
        title: "Test Recipe",
        description: "Verification recipe",
        image: "",
        ingredients: [{ name: "eggs", qty: "2" }],
        steps: ["Cook and serve"],
        prepTime: 5,
        cookTime: 10,
        servings: 2,
        cuisine: "Test",
      },
      personal_notes: "Migration verification note",
    })
    .select("*")
    .single();
  if (recipeError) throw new Error(`Recipe insert failed: ${recipeError.message}`);

  const { data: loaded, error: loadError } = await authed
    .from("fm_cookbooks")
    .select("id,title")
    .eq("id", cookbook.id)
    .single();
  if (loadError) throw new Error(`Cookbook reload failed: ${loadError.message}`);

  await authed.from("fm_cookbooks").delete().eq("id", cookbook.id);

  return {
    userId,
    cookbookId: loaded.id,
    cookbookTitle: loaded.title,
    sectionCount: sections?.length ?? 0,
    recipeTitle: recipe.recipe_snapshot?.title ?? "Test Recipe",
  };
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("Supabase URL:", SUPABASE_URL);

  const before = await verifyTables(supabase);
  console.log("Tables before migration:", before);

  const allExist = TABLES.every((table) => before[table]);
  if (!allExist) {
    const rpcAttempt = await tryExecSqlRpc(supabase);
    if (!rpcAttempt.ok) {
      console.error("\nUnable to apply migration automatically with the configured anon key.");
      console.error(rpcAttempt.error);
      console.error(
        "\nThe anon key cannot run DDL. Apply supabase/migrations/001_cookbooks.sql manually in the DatabasePad/Supabase SQL editor, then re-run this script to verify.",
      );
      process.exit(1);
    }
    console.log(`Migration applied via RPC function: ${rpcAttempt.fn}`);
  } else {
    console.log("All cookbook tables already exist; skipping DDL apply.");
  }

  const after = await verifyTables(supabase);
  console.log("Tables after migration:", after);

  if (!TABLES.every((table) => after[table])) {
    console.error("Migration verification failed: one or more tables are still missing.");
    process.exit(1);
  }

  const testResult = await testCookbookFlow(supabase);
  console.log("\nCookbook create/save test passed:");
  console.log(JSON.stringify(testResult, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
