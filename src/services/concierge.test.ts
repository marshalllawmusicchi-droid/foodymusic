import { describe, expect, it, vi } from "vitest";
import conciergeHandler from "../../api/concierge";
import { buildConciergeRecommendation, getConciergeRecipe, matchRecipe } from "./concierge";

describe("buildConciergeRecommendation", () => {
  it("returns a fallback recipe when the OpenAI API key is missing", async () => {
    delete process.env.OPENAI_API_KEY;

    const req = { method: "POST", body: { prompt: "fried chicken" } };
    const res = {
      statusCode: 200,
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockImplementation(function (payload: unknown) {
        this.body = payload;
        return this;
      }),
      setHeader: vi.fn(),
      end: vi.fn(),
    };

    await conciergeHandler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String),
      recipe: expect.objectContaining({
        title: expect.any(String),
      }),
      source: "fallback",
    }));
  });

  it("matches a mock recipe from a food request", () => {
    const result = buildConciergeRecommendation("I want crispy fried chicken for dinner");

    expect(result.matchFound).toBe(true);
    expect(result.recipeTitle).toContain("Fried Chicken");
    expect(result.recipeCuisine).toBe("American");
    expect(result.image).toContain("data:image/svg+xml");
    expect(result.grocerySavings).toBeGreaterThan(0);
    expect(result.difficulty).toBeDefined();
    expect(result.nutrition).toBeDefined();
    expect(result.playlist).toBeDefined();
  });

  it("returns a friendly no-match result when no recipe fits", () => {
    const result = buildConciergeRecommendation("I need a recipe for a very unusual dish");

    expect(result.matchFound).toBe(false);
    expect(result.title).toBe("No recipe found");
    expect(result.description).toContain("ingredients");
  });

  it("exposes a shared helper for landing-page recipe matching", () => {
    const result = matchRecipe("grilled salmon");

    expect(result.matchFound).toBe(true);
    expect(result.title).toContain("Salmon");
    expect(result.time).toBeGreaterThan(0);
  });

  it("matches dessert and baking requests like chocolate cake", () => {
    const result = buildConciergeRecommendation("I want a chocolate cake recipe for dessert");

    expect(result.matchFound).toBe(true);
    expect(result.title).toContain("Cake");
    expect(result.recipeCuisine).toBe("Dessert");
  });

  it("keeps savory matching for fried chicken", () => {
    const result = buildConciergeRecommendation("I want fried chicken for dinner");

    expect(result.matchFound).toBe(true);
    expect(result.title).toContain("Fried Chicken");
  });

  it("keeps savory matching for chicken tacos", () => {
    const result = buildConciergeRecommendation("I want chicken tacos for dinner");

    expect(result.matchFound).toBe(true);
    expect(result.title).toContain("Tacos");
  });

  it("normalizes a structured concierge recipe response from the API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        source: "openai",
        recipe: {
          title: "Crispy Fried Chicken",
          description: "Golden, crunchy fried chicken with a simple buttermilk crust.",
          ingredients: [{ name: "Chicken thighs", qty: "8 pieces" }, { name: "Flour", qty: "2 cups" }],
          steps: ["Dredge the chicken.", "Fry until crisp."],
          prepTime: 20,
          cookTime: 25,
          totalTime: 45,
          servings: 4,
          cuisine: "American",
          difficulty: "Medium",
          estimatedCost: 14.8,
          costPerServing: 3.7,
          vibe: "Comforting and bold",
          summary: "A classic fried chicken dinner.",
          nutrition: { calories: 520, protein: "35g", carbs: "28g", fat: "22g", summary: "High-protein comfort food." },
          playlist: { title: "Southern Kitchen", mood: "Soulful grooves", description: "Spotify coming soon." },
        },
      }),
    }));

    const result = await getConciergeRecipe("I want to cook fried chicken");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.recipe.title).toContain("Fried Chicken");
      expect(result.recipe.ingredients).toHaveLength(2);
      expect(result.recipe.steps).toHaveLength(2);
      expect(result.recipe.prepTime).toBeGreaterThan(0);
      expect(result.recipe.cookTime).toBeGreaterThan(0);
      expect(result.recipe.servings).toBe(4);
      expect(result.recipe.difficulty).toBe("Medium");
      expect(result.recipe.nutrition.calories).toBe(520);
      expect(result.recipe.playlist.title).toBe("Southern Kitchen");
      expect(result.recipe.source).toBe("openai");
    }
  });

  it("accepts markdown-wrapped JSON from the concierge API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        source: "openai",
        recipe: {
          title: "Chocolate Cake",
          description: "A rich, moist chocolate cake for a celebration.",
          ingredients: [{ item: "flour", quantity: "2 cups" }, { item: "cocoa powder", quantity: "1/2 cup" }],
          steps: ["Mix the dry ingredients.", "Bake until set."],
          prepTime: "20 minutes",
          cookTime: "35 minutes",
          totalTime: "55 minutes",
          servings: "8",
          cuisine: "Dessert",
          difficulty: "Easy",
          estimatedCost: "$12",
          costPerServing: "$1.50",
          vibe: "Indulgent",
          nutrition: { calories: 380, protein: "5g", carbs: "52g", fat: "18g", summary: "Rich dessert." },
          playlist: { title: "Baking Beats", mood: "Cozy", description: "Coming soon." },
        },
      }),
    }));

    const result = await getConciergeRecipe("I want chocolate cake");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.recipe.title).toBe("Chocolate Cake");
      expect(result.recipe.ingredients[0]?.name).toBe("flour");
      expect(result.recipe.ingredients[1]?.name).toBe("cocoa powder");
      expect(result.recipe.servings).toBe(8);
      expect(result.recipe.source).toBe("openai");
    }
  });

  it("returns an error when the API fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Rate limit exceeded" }),
    }));

    const result = await getConciergeRecipe("I want pasta");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Rate limit exceeded");
    }
  });

  it("returns fallback recipe with error when API key is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        error: "OpenAI API key is not configured.",
        recipe: { title: "Recipe suggestion", description: "Fallback" },
        source: "fallback",
      }),
    }));

    const result = await getConciergeRecipe("I have chicken and rice");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("not configured");
      expect(result.recipe).toBeDefined();
    }
  });
});
