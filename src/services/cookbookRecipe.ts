import { supabase } from "@/lib/supabase";
import type { ConciergeRecommendation } from "./concierge";
import type { CookbookRecipeSnapshot } from "../types/cookbook";

const RECIPE_IMAGES_BUCKET = "recipe-images";

const extensionForMime = (mimeType: string): string => {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "png";
};

export const persistRecipeImageForSnapshot = async (
  imageUrl: string,
  userId: string,
): Promise<string> => {
  if (!imageUrl.startsWith("blob:")) {
    return imageUrl;
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error("Unable to read temporary recipe image for upload.");
  }

  const blob = await response.blob();
  const contentType = blob.type || "image/png";
  const objectPath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extensionForMime(contentType)}`;

  const { error: uploadError } = await supabase.storage
    .from(RECIPE_IMAGES_BUCKET)
    .upload(objectPath, blob, { contentType, upsert: false });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(RECIPE_IMAGES_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
};

export const snapshotFromConcierge = (
  recipe: ConciergeRecommendation,
  imageOverride?: string,
): CookbookRecipeSnapshot => ({
  title: recipe.title,
  description: recipe.description,
  image: imageOverride || recipe.image,
  ingredients: recipe.ingredients.map((item) => ({ name: item.name, qty: item.qty })),
  steps: [...recipe.steps],
  prepTime: recipe.prepTime,
  cookTime: recipe.cookTime,
  servings: recipe.servings,
  cuisine: recipe.recipeCuisine,
  source: recipe.source,
});
