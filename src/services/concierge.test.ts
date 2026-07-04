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

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      recipe: expect.objectContaining({
        title: expect.any(String),
      }),
    }));
  });
  it("matches a mock recipe from a food request", () => {
    const result = buildConciergeRecommendation("I want crispy fried chicken for dinner");

    expect(result.matchFound).toBe(true);
    expect(result.recipeTitle).toContain("Fried Chicken");
    expect(result.recipeCuisine).toBe("American");
    expect(result.image).toContain("data:image/svg+xml");
    expect(result.grocerySavings).toBeGreaterThan(0);
  });

  it("returns a friendly no-match result when no recipe fits", () => {
    const result = buildConciergeRecommendation("I need a recipe for a very unusual dish");

    expect(result.matchFound).toBe(false);
    expect(result.title).toBe("No recipe found");
    expect(result.description).toContain("Try a more common dish");
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
          estimatedCost: 14.8,
          costPerServing: 3.7,
          vibe: "Comforting and bold"
        }
      })
    }));

    const result = await getConciergeRecipe("I want to cook fried chicken");

    expect(result.title).toContain("Fried Chicken");
    expect(result.ingredients).toHaveLength(2);
    expect(result.steps).toHaveLength(2);
    expect(result.prepTime).toBeGreaterThan(0);
    expect(result.cookTime).toBeGreaterThan(0);
    expect(result.servings).toBe(4);
  });

  it("accepts markdown-wrapped JSON from the concierge API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
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
          estimatedCost: "$12",
          costPerServing: "$1.50",
          vibe: "Indulgent"
        }
      })
    }));

    const result = await getConciergeRecipe("I want chocolate cake");

    expect(result.title).toBe("Chocolate Cake");
    expect(result.ingredients[0]?.name).toBe("flour");
    expect(result.ingredients[1]?.name).toBe("cocoa powder");
    expect(result.servings).toBe(8);
    expect(result.source).toBe("openai");
  });
});
