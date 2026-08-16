import { describe, expect, it } from "vitest";
import { renderCookbookPdf } from "./cookbook-pdf";
import type { CookbookWithContents } from "../src/types/cookbook";

const tinyPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const sampleCookbook = (): CookbookWithContents => ({
  id: "book-1",
  userId: "user-1",
  title: "Marshall Test Cookbook",
  subtitle: "",
  authorName: "Marshall",
  description: "",
  coverImage: "",
  dedication: "",
  privacy: "private",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  sections: [{ id: "section-1", cookbookId: "book-1", title: "Dinner", sortOrder: 0, createdAt: "" }],
  recipes: [
    {
      id: "recipe-1",
      cookbookId: "book-1",
      sectionId: "section-1",
      sortOrder: 0,
      personalNotes: "",
      createdAt: "",
      updatedAt: "",
      recipeSnapshot: {
        title: "Braised Short Ribs",
        description: "Rich and tender.",
        image: `data:image/png;base64,${tinyPngBase64}`,
        ingredients: [{ name: "short ribs", qty: "3 lb" }],
        steps: ["Braise until tender."],
        prepTime: 20,
        cookTime: 180,
        servings: 4,
        cuisine: "American",
      },
    },
  ],
});

describe("renderCookbookPdf", () => {
  it("embeds recipe images above recipe titles", async () => {
    const pdf = await renderCookbookPdf(sampleCookbook());
    expect(pdf.length).toBeGreaterThan(1000);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("fails when a saved image URL cannot be loaded", async () => {
    const cookbook = sampleCookbook();
    cookbook.recipes[0].recipeSnapshot.image = "https://example.com/missing-recipe-image.png";

    await expect(renderCookbookPdf(cookbook)).rejects.toThrow(
      'Unable to load recipe image for "Braised Short Ribs"',
    );
  });
});
