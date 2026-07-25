import { getOpenAIApiKey, getOpenAIModel } from "../lib/openai-config.js";

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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { question, recipe, currentStepIndex } = req.body ?? {};

  if (!question || typeof question !== "string") {
    res.status(400).json({ error: "A question is required" });
    return;
  }

  if (!recipe?.title) {
    res.status(400).json({ error: "Recipe context is required" });
    return;
  }

  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    res.status(503).json({
      error: "OpenAI API key is not configured.",
      answer: "I'm having trouble reaching my kitchen brain right now. Check the recipe card above for ingredients and timing.",
    });
    return;
  }

  const model = getOpenAIModel();
  const stepIndex = typeof currentStepIndex === "number" ? currentStepIndex : 0;
  const currentStep = recipe.steps?.[stepIndex];
  const ingredients =
    recipe.ingredients?.map((item: { name: string; qty?: string }) => `${item.name} (${item.qty ?? "as needed"})`).join(", ") ??
    "not listed";

  const systemPrompt = `You are Hey Foody™, a warm, concise cooking coach helping someone cook in real time.
Answer only the cooking question using the recipe context below. Keep answers under 3 short sentences.
If the question is unrelated to cooking this dish, gently redirect back to the recipe.

Recipe: ${recipe.title}
Description: ${recipe.description ?? ""}
Ingredients: ${ingredients}
Prep: ${recipe.prepTime ?? "?"} min · Cook: ${recipe.cookTime ?? "?"} min · Servings: ${recipe.servings ?? "?"}
Current step (${stepIndex + 1}${recipe.steps?.length ? ` of ${recipe.steps.length}` : ""}): ${currentStep ?? "not started yet"}
All steps: ${(recipe.steps ?? []).map((step: string, index: number) => `${index + 1}. ${step}`).join(" | ")}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
      }),
    });

    if (!response.ok) {
      res.status(response.status).json({
        error: "Unable to answer right now.",
        answer: "I'm not sure about that — peek at the ingredients list or the current step above.",
      });
      return;
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      res.status(502).json({
        error: "Empty answer",
        answer: "Good question — double-check the current step and ingredient amounts in the recipe card.",
      });
      return;
    }

    res.status(200).json({ answer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: message,
      answer: "Something glitched on my side. Try asking again or tap Next when you're ready.",
    });
  }
}
