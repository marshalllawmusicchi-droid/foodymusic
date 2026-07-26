import { createClient } from "@supabase/supabase-js";
import { renderCookbookPdf } from "../lib/cookbook-pdf.js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../lib/supabase-config.js";
import type {
  CookbookPrivacy,
  CookbookRecipeSnapshot,
  CookbookWithContents,
} from "../src/types/cookbook";

type CookbookRow = {
  id: string;
  user_id: string;
  title: string;
  subtitle: string | null;
  author_name: string | null;
  description: string | null;
  cover_image: string | null;
  dedication: string | null;
  privacy: CookbookPrivacy;
  created_at: string;
  updated_at: string;
};

type SectionRow = {
  id: string;
  cookbook_id: string;
  title: string;
  sort_order: number;
  created_at: string;
};

type RecipeRow = {
  id: string;
  cookbook_id: string;
  section_id: string | null;
  sort_order: number;
  recipe_snapshot: CookbookRecipeSnapshot;
  personal_notes: string | null;
  created_at: string;
  updated_at: string;
};

const sanitizeFilename = (value: string) =>
  value.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80) || "cookbook";

const loadCookbookForExport = async (
  supabase: ReturnType<typeof createClient>,
  cookbookId: string,
): Promise<CookbookWithContents | null> => {
  const { data: cookbookData, error: cookbookError } = await supabase
    .from("fm_cookbooks")
    .select("*")
    .eq("id", cookbookId)
    .maybeSingle();

  if (cookbookError) throw new Error(cookbookError.message);
  if (!cookbookData) return null;

  const row = cookbookData as CookbookRow;
  const [{ data: sections }, { data: recipes }] = await Promise.all([
    supabase
      .from("fm_cookbook_sections")
      .select("*")
      .eq("cookbook_id", cookbookId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("fm_cookbook_recipes")
      .select("*")
      .eq("cookbook_id", cookbookId)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    subtitle: row.subtitle ?? "",
    authorName: row.author_name ?? "",
    description: row.description ?? "",
    coverImage: row.cover_image ?? "",
    dedication: row.dedication ?? "",
    privacy: row.privacy,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sections: ((sections ?? []) as SectionRow[]).map((section) => ({
      id: section.id,
      cookbookId: section.cookbook_id,
      title: section.title,
      sortOrder: section.sort_order,
      createdAt: section.created_at,
    })),
    recipes: ((recipes ?? []) as RecipeRow[]).map((recipe) => ({
      id: recipe.id,
      cookbookId: recipe.cookbook_id,
      sectionId: recipe.section_id,
      sortOrder: recipe.sort_order,
      recipeSnapshot: recipe.recipe_snapshot,
      personalNotes: recipe.personal_notes ?? "",
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
    })),
  };
};

export default async function handler(req: { method?: string; body?: { cookbookId?: string }; headers?: Record<string, string | string[] | undefined> }, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const authHeader = req.headers?.authorization ?? req.headers?.Authorization;
  const token =
    typeof authHeader === "string" ? authHeader.replace(/^Bearer\s+/i, "").trim() : "";

  if (!token) {
    res.status(401).json({ error: "Sign in to export your cookbook." });
    return;
  }

  const cookbookId = req.body?.cookbookId;
  if (!cookbookId || typeof cookbookId !== "string") {
    res.status(400).json({ error: "cookbookId is required." });
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    res.status(401).json({ error: "Invalid or expired session." });
    return;
  }

  try {
    const cookbook = await loadCookbookForExport(supabase, cookbookId);
    if (!cookbook) {
      res.status(404).json({ error: "Cookbook not found." });
      return;
    }

    if (cookbook.userId !== userData.user.id) {
      res.status(403).json({ error: "You can only export your own cookbooks." });
      return;
    }

    const pdfBuffer = await renderCookbookPdf(cookbook);
    const filename = `${sanitizeFilename(cookbook.title)}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200);
    res.end(pdfBuffer);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to generate PDF.",
    });
  }
}
