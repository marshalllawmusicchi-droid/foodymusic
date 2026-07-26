import { describe, expect, it } from "vitest";
import { snapshotFromConcierge } from "./cookbookRecipe";
import type { ConciergeRecommendation } from "./concierge";

const sampleRecipe: ConciergeRecommendation = {
  title: "Citrus Salmon Bowl",
  description: "Bright, fast weeknight bowl.",
  ingredients: [{ name: "salmon", qty: "1 lb" }],
  steps: ["Season salmon", "Roast and serve"],
  estimatedCost: 18,
  costPerServing: 4.5,
  servings: 4,
  time: 25,
  prepTime: 10,
  cookTime: 15,
  totalTime: 25,
  difficulty: "Easy",
  nutrition: {
    calories: 420,
    protein: "32g",
    carbs: "18g",
    fat: "22g",
    summary: "Protein-forward bowl.",
  },
  playlist: { title: "Coastal Kitchen", mood: "Fresh", description: "Light cooking vibes." },
  recipeId: "ai-1",
  playlistId: "pl-1",
  couponIds: [],
  toolIds: [],
  artistId: "a1",
  vibe: "Fresh",
  budgetLabel: "Budget friendly",
  matchFound: true,
  recipeTitle: "Citrus Salmon Bowl",
  recipeCuisine: "Pacific",
  image: "https://example.com/salmon.jpg",
  grocerySavings: 4,
  musicVibe: "Fresh",
  source: "openai",
};

describe("snapshotFromConcierge", () => {
  it("preserves generated recipe fields for cookbook storage", () => {
    const snapshot = snapshotFromConcierge(sampleRecipe, "https://example.com/generated.jpg");

    expect(snapshot).toEqual({
      title: "Citrus Salmon Bowl",
      description: "Bright, fast weeknight bowl.",
      image: "https://example.com/generated.jpg",
      ingredients: [{ name: "salmon", qty: "1 lb" }],
      steps: ["Season salmon", "Roast and serve"],
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      cuisine: "Pacific",
      source: "openai",
    });
  });
});
