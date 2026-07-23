import { getOpenAIApiKey, getOpenAIModel } from "./openai-config";

const parseRecipeFromContent = (content: string) => {
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
};

export type ConciergeRecipePayload = {
  title: string;
  description: string;
  ingredients: Array<{ name: string; qty: string }>;
  steps: string[];
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  cuisine: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedCost: number;
  costPerServing: number;
  vibe: string;
  summary: string;
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
    summary: string;
  };
  playlist: {
    title: string;
    mood: string;
    description: string;
  };
};

const fallbackRecipe: ConciergeRecipePayload = {
  title: "Recipe suggestion",
  description: "A helpful kitchen idea based on your request.",
  ingredients: [],
  steps: [],
  prepTime: 15,
  cookTime: 20,
  totalTime: 35,
  servings: 4,
  cuisine: "Mixed",
  difficulty: "Easy",
  estimatedCost: 12,
  costPerServing: 3,
  vibe: "Comforting",
  summary: "A quick, budget-friendly meal idea.",
  nutrition: {
    calories: 450,
    protein: "25g",
    carbs: "40g",
    fat: "18g",
    summary: "Balanced home-cooked meal with moderate calories per serving.",
  },
  playlist: {
    title: "Cooking Vibes",
    mood: "Chill and upbeat",
    description: "Spotify playlist integration coming soon — cook along to curated tracks matched to your meal.",
  },
};

const SYSTEM_PROMPT = `You are Foody Music's AI cooking concierge. Respond with valid JSON only — no markdown, no code fences.

Return a recipe object with these exact fields:
- title (string)
- description (string, 1-2 sentences)
- ingredients (array of {name, qty})
- steps (array of strings, clear step-by-step instructions)
- prepTime (number, minutes)
- cookTime (number, minutes)
- totalTime (number, minutes)
- servings (number)
- cuisine (string)
- difficulty ("Easy" | "Medium" | "Hard")
- estimatedCost (number, USD for all ingredients)
- costPerServing (number, USD)
- vibe (string, cooking mood)
- summary (string, one sentence)
- nutrition ({ calories: number, protein: string, carbs: string, fat: string, summary: string })
- playlist ({ title: string, mood: string, description: string — a placeholder playlist suggestion for future Spotify integration })

Tailor the recipe to the user's ingredients, budget, and preferences when mentioned. Be practical and realistic with costs and nutrition estimates.`;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { prompt } = req.body ?? {};

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "A prompt is required" });
    return;
  }

  const apiKey = getOpenAIApiKey();
  const model = getOpenAIModel();

  if (!apiKey) {
    res.status(503).json({
      error: "OpenAI API key is not configured. Add OPENAI_API_KEY to your environment variables.",
      recipe: fallbackRecipe,
      source: "fallback",
    });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Generate a complete recipe for this request: ${prompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      let errorMessage = "The AI service returned an error. Please try again.";
      try {
        const errorBody = await response.json();
        errorMessage = errorBody?.error?.message || errorMessage;
      } catch {
        // keep default message
      }
      res.status(response.status >= 500 ? 502 : response.status).json({ error: errorMessage });
      return;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? "";

    let recipe: ConciergeRecipePayload;

    try {
      recipe = typeof content === "string" ? parseRecipeFromContent(content) : content;
    } catch {
      res.status(502).json({ error: "The AI returned an unreadable response. Please try again." });
      return;
    }

    if (!recipe?.title) {
      res.status(502).json({ error: "The AI returned an empty recipe. Please try again." });
      return;
    }

    res.status(200).json({ recipe, source: "openai" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: `Unable to generate recipe: ${message}` });
  }
}
