export type CookbookPrivacy = "private" | "public";

export type CookbookRecipeSnapshot = {
  title: string;
  description: string;
  image: string;
  ingredients: Array<{ name: string; qty: string }>;
  steps: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  cuisine: string;
  source?: string;
};

export type Cookbook = {
  id: string;
  userId: string;
  title: string;
  subtitle: string;
  authorName: string;
  description: string;
  coverImage: string;
  dedication: string;
  privacy: CookbookPrivacy;
  createdAt: string;
  updatedAt: string;
};

export type CookbookSection = {
  id: string;
  cookbookId: string;
  title: string;
  sortOrder: number;
  createdAt: string;
};

export type CookbookRecipe = {
  id: string;
  cookbookId: string;
  sectionId: string | null;
  sortOrder: number;
  recipeSnapshot: CookbookRecipeSnapshot;
  personalNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type CookbookWithContents = Cookbook & {
  sections: CookbookSection[];
  recipes: CookbookRecipe[];
};

export type CookbookInput = {
  title: string;
  subtitle?: string;
  authorName?: string;
  description?: string;
  coverImage?: string;
  dedication?: string;
  privacy?: CookbookPrivacy;
};

export const DEFAULT_COOKBOOK_SECTIONS = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Desserts",
  "Family Favorites",
] as const;
