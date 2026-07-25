import type { ConciergeRecommendation } from "./concierge";

export type HeyFoodyRecipeContext = {
  title: string;
  description?: string;
  ingredients?: Array<{ name: string; qty?: string }>;
  steps?: string[];
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  servings?: number;
  difficulty?: string;
};

export const HEY_FOODY_GREETING =
  "Hey! I'm Hey Foody™. What would you like to cook today? Tell me your ingredients, cravings, or budget — by voice or text.";

export const isNextCommand = (text: string): boolean => {
  const normalized = text.trim().toLowerCase();
  return /^(next|next step|continue|go on|done|ready|ok next|okay next|move on)\b/.test(normalized);
};

export const isCookingQuestion = (text: string): boolean => {
  const normalized = text.trim().toLowerCase();
  if (!normalized || isNextCommand(normalized)) return false;
  return (
    normalized.includes("?") ||
    /^(what|how|why|can i|should i|when|where|which|do i|is it|could i|help|substitute|replace|instead)/.test(normalized)
  );
};

export const toHeyFoodyRecipeContext = (recipe: ConciergeRecommendation): HeyFoodyRecipeContext => ({
  title: recipe.title,
  description: recipe.description,
  ingredients: recipe.ingredients,
  steps: recipe.steps,
  prepTime: recipe.prepTime,
  cookTime: recipe.cookTime,
  totalTime: recipe.totalTime,
  servings: recipe.servings,
  difficulty: recipe.difficulty,
});

export const buildStepMessage = (recipe: ConciergeRecommendation, stepIndex: number): string => {
  const step = recipe.steps[stepIndex];
  const total = recipe.steps.length;
  if (!step) {
    return "You're all done! Enjoy your meal.";
  }

  return `Step ${stepIndex + 1} of ${total}: ${step}`;
};

export const buildIngredientsMessage = (recipe: ConciergeRecommendation): string => {
  const list = recipe.ingredients.map((item) => `${item.name} (${item.qty})`).join(", ");
  return `Here's what you'll need for ${recipe.title}: ${list}. Say "next" when you're ready for step 1.`;
};

export const answerLocally = (question: string, recipe: ConciergeRecommendation, stepIndex: number): string | null => {
  const q = question.toLowerCase();

  if (q.includes("ingredient") || q.includes("need for") || q.includes("shopping")) {
    return buildIngredientsMessage(recipe);
  }

  if (q.includes("how long") || q.includes("how much time") || q.includes("total time")) {
    return `${recipe.title} takes about ${recipe.prepTime} minutes prep and ${recipe.cookTime} minutes cook time (${recipe.totalTime} minutes total).`;
  }

  if (q.includes("serving") || q.includes("serve")) {
    return `This recipe makes ${recipe.servings} servings.`;
  }

  if (q.includes("current step") || q.includes("this step") || q.includes("what step")) {
    return buildStepMessage(recipe, stepIndex);
  }

  if (q.includes("temperature") || q.includes("heat")) {
    return "Use medium heat unless the current step says otherwise — adjust if you see browning too fast.";
  }

  return null;
};

export type HeyFoodyAnswerResult =
  | { ok: true; answer: string }
  | { ok: false; answer: string; error?: string };

export const askHeyFoody = async (
  question: string,
  recipe: ConciergeRecommendation,
  currentStepIndex: number,
): Promise<HeyFoodyAnswerResult> => {
  const local = answerLocally(question, recipe, currentStepIndex);
  if (local) {
    return { ok: true, answer: local };
  }

  try {
    const response = await fetch("/api/hey-foody", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        recipe: toHeyFoodyRecipeContext(recipe),
        currentStepIndex,
      }),
    });

    const data = await response.json().catch(() => ({}));
    const answer =
      typeof data?.answer === "string"
        ? data.answer
        : "I'm not sure about that — check the recipe card or ask about ingredients, timing, or the current step.";

    if (!response.ok) {
      return { ok: false, answer, error: typeof data?.error === "string" ? data.error : undefined };
    }

    return { ok: true, answer };
  } catch {
    return {
      ok: false,
      answer: "I couldn't reach the kitchen coach right now. Try again or tap Next when you're ready.",
    };
  }
};
