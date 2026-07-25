import { describe, expect, it } from "vitest";
import {
  HEY_FOODY_GREETING,
  answerLocally,
  buildStepMessage,
  isCookingQuestion,
  isNextCommand,
} from "./heyFoody";
import type { ConciergeRecommendation } from "./concierge";

const sampleRecipe = {
  title: "Garlic Chicken Bowl",
  description: "A quick weeknight bowl.",
  ingredients: [
    { name: "chicken breast", qty: "1 lb" },
    { name: "rice", qty: "1 cup" },
  ],
  steps: ["Season the chicken.", "Cook the rice.", "Combine and serve."],
  prepTime: 10,
  cookTime: 20,
  totalTime: 30,
  servings: 4,
  difficulty: "Easy" as const,
} as ConciergeRecommendation;

describe("heyFoody helpers", () => {
  it("includes the Hey Foody greeting", () => {
    expect(HEY_FOODY_GREETING).toContain("Hey Foody");
  });

  it("detects next commands", () => {
    expect(isNextCommand("next")).toBe(true);
    expect(isNextCommand("Next step please")).toBe(true);
    expect(isNextCommand("what is next")).toBe(false);
  });

  it("detects cooking questions", () => {
    expect(isCookingQuestion("How long does this take?")).toBe(true);
    expect(isCookingQuestion("next")).toBe(false);
    expect(isCookingQuestion("What temperature should I use?")).toBe(true);
  });

  it("builds step messages with numbering", () => {
    expect(buildStepMessage(sampleRecipe, 1)).toContain("Step 2 of 3");
    expect(buildStepMessage(sampleRecipe, 1)).toContain("Cook the rice.");
  });

  it("answers ingredient questions locally", () => {
    const answer = answerLocally("What ingredients do I need?", sampleRecipe, 0);
    expect(answer).toContain("chicken breast");
  });
});
