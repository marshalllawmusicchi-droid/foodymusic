import { describe, expect, it, vi } from "vitest";
import {
  buildRecipeImageCacheKey,
  fetchRecipeImage,
  getCachedRecipeImage,
  setCachedRecipeImage,
} from "./recipeImage";

describe("recipeImage service", () => {
  it("builds a stable cache key from recipe fields", () => {
    const key = buildRecipeImageCacheKey({
      title: "Garlic Shrimp Scampi",
      cuisine: "Mediterranean",
      vibe: "Bright and quick",
      ingredients: [{ name: "Shrimp", qty: "1 lb" }],
    });

    expect(key).toContain("Garlic Shrimp Scampi");
    expect(key).toContain("Mediterranean");
  });

  it("returns a generated image URL from the API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ imageUrl: "https://example.com/dish.png" }),
      }),
    );

    const result = await fetchRecipeImage({
      title: "Test Dish",
      cuisine: "American",
      ingredients: [{ name: "Chicken", qty: "1 lb" }],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.imageUrl).toBe("https://example.com/dish.png");
    }
  });

  it("returns the exact API error when image generation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: "HTTP 400\n{\n  \"error\": {\n    \"message\": \"The model 'dall-e-3' does not exist.\"\n  }\n}",
          statusCode: 400,
          errorBody: {
            error: {
              message: "The model 'dall-e-3' does not exist.",
              type: "image_generation_user_error",
            },
          },
        }),
      }),
    );

    const result = await fetchRecipeImage({ title: "Test Dish" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("HTTP 400");
      expect(result.error).toContain("dall-e-3");
      expect(result.statusCode).toBe(400);
    }
  });

  it("stores and reads cached image URLs", () => {
    const key = buildRecipeImageCacheKey({ title: "Cached Dish" });
    setCachedRecipeImage(key, "https://example.com/cached.png");

    expect(getCachedRecipeImage(key)).toBe("https://example.com/cached.png");
  });
});
