import { supabase } from "@/lib/supabase";
import {
  DEFAULT_COOKBOOK_SECTIONS,
  type Cookbook,
  type CookbookInput,
  type CookbookPrivacy,
  type CookbookRecipe,
  type CookbookRecipeSnapshot,
  type CookbookSection,
  type CookbookWithContents,
} from "@/types/cookbook";

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

const mapCookbook = (row: CookbookRow): Cookbook => ({
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
});

const mapSection = (row: SectionRow): CookbookSection => ({
  id: row.id,
  cookbookId: row.cookbook_id,
  title: row.title,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
});

const mapRecipe = (row: RecipeRow): CookbookRecipe => ({
  id: row.id,
  cookbookId: row.cookbook_id,
  sectionId: row.section_id,
  sortOrder: row.sort_order,
  recipeSnapshot: row.recipe_snapshot,
  personalNotes: row.personal_notes ?? "",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const cookbookPayload = (input: CookbookInput, userId: string) => ({
  user_id: userId,
  title: input.title.trim(),
  subtitle: input.subtitle?.trim() ?? "",
  author_name: input.authorName?.trim() ?? "",
  description: input.description?.trim() ?? "",
  cover_image: input.coverImage?.trim() ?? "",
  dedication: input.dedication?.trim() ?? "",
  privacy: input.privacy ?? "private",
  updated_at: new Date().toISOString(),
});

export const listCookbooks = async (userId: string): Promise<Cookbook[]> => {
  const { data, error } = await supabase
    .from("fm_cookbooks")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as CookbookRow[]).map(mapCookbook);
};

export const getCookbook = async (cookbookId: string): Promise<CookbookWithContents | null> => {
  const { data: cookbookData, error: cookbookError } = await supabase
    .from("fm_cookbooks")
    .select("*")
    .eq("id", cookbookId)
    .maybeSingle();

  if (cookbookError) throw new Error(cookbookError.message);
  if (!cookbookData) return null;

  const [{ data: sections, error: sectionsError }, { data: recipes, error: recipesError }] =
    await Promise.all([
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

  if (sectionsError) throw new Error(sectionsError.message);
  if (recipesError) throw new Error(recipesError.message);

  return {
    ...mapCookbook(cookbookData as CookbookRow),
    sections: ((sections ?? []) as SectionRow[]).map(mapSection),
    recipes: ((recipes ?? []) as RecipeRow[]).map(mapRecipe),
  };
};

export const createCookbook = async (userId: string, input: CookbookInput): Promise<CookbookWithContents> => {
  const { data, error } = await supabase
    .from("fm_cookbooks")
    .insert(cookbookPayload(input, userId))
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const cookbook = mapCookbook(data as CookbookRow);
  const sectionRows = DEFAULT_COOKBOOK_SECTIONS.map((title, index) => ({
    cookbook_id: cookbook.id,
    title,
    sort_order: index,
  }));

  const { data: sections, error: sectionError } = await supabase
    .from("fm_cookbook_sections")
    .insert(sectionRows)
    .select("*");

  if (sectionError) throw new Error(sectionError.message);

  return {
    ...cookbook,
    sections: ((sections ?? []) as SectionRow[]).map(mapSection),
    recipes: [],
  };
};

export const updateCookbook = async (
  cookbookId: string,
  userId: string,
  input: CookbookInput,
): Promise<Cookbook> => {
  const { data, error } = await supabase
    .from("fm_cookbooks")
    .update(cookbookPayload(input, userId))
    .eq("id", cookbookId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapCookbook(data as CookbookRow);
};

export const deleteCookbook = async (cookbookId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from("fm_cookbooks")
    .delete()
    .eq("id", cookbookId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
};

export const addCookbookSection = async (
  cookbookId: string,
  title: string,
  sortOrder: number,
): Promise<CookbookSection> => {
  const { data, error } = await supabase
    .from("fm_cookbook_sections")
    .insert({ cookbook_id: cookbookId, title: title.trim(), sort_order: sortOrder })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapSection(data as SectionRow);
};

export const deleteCookbookSection = async (sectionId: string): Promise<void> => {
  const { error } = await supabase.from("fm_cookbook_sections").delete().eq("id", sectionId);
  if (error) throw new Error(error.message);
};

export const addRecipeToCookbook = async (args: {
  cookbookId: string;
  sectionId: string | null;
  snapshot: CookbookRecipeSnapshot;
  personalNotes?: string;
  sortOrder: number;
}): Promise<CookbookRecipe> => {
  const { data, error } = await supabase
    .from("fm_cookbook_recipes")
    .insert({
      cookbook_id: args.cookbookId,
      section_id: args.sectionId,
      sort_order: args.sortOrder,
      recipe_snapshot: args.snapshot,
      personal_notes: args.personalNotes?.trim() ?? "",
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await supabase
    .from("fm_cookbooks")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", args.cookbookId);

  return mapRecipe(data as RecipeRow);
};

export const updateCookbookRecipe = async (
  recipeId: string,
  updates: { sectionId?: string | null; personalNotes?: string; sortOrder?: number },
): Promise<CookbookRecipe> => {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.sectionId !== undefined) payload.section_id = updates.sectionId;
  if (updates.personalNotes !== undefined) payload.personal_notes = updates.personalNotes;
  if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

  const { data, error } = await supabase
    .from("fm_cookbook_recipes")
    .update(payload)
    .eq("id", recipeId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRecipe(data as RecipeRow);
};

export const deleteCookbookRecipe = async (recipeId: string): Promise<void> => {
  const { error } = await supabase.from("fm_cookbook_recipes").delete().eq("id", recipeId);
  if (error) throw new Error(error.message);
};

export const reorderCookbookRecipes = async (
  orderedRecipeIds: string[],
): Promise<void> => {
  const updates = orderedRecipeIds.map((id, index) =>
    supabase
      .from("fm_cookbook_recipes")
      .update({ sort_order: index, updated_at: new Date().toISOString() })
      .eq("id", id),
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw new Error(failed.error.message);
};

export const exportCookbookPdf = async (cookbookId: string, accessToken: string): Promise<Blob> => {
  const response = await fetch("/api/cookbook-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ cookbookId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(typeof data?.error === "string" ? data.error : "Unable to export cookbook PDF.");
  }

  return response.blob();
};
