import type { ConciergeRecommendation } from "./concierge";
import type { CookbookRecipeSnapshot } from "../types/cookbook";

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
