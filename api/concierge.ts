const parseRecipeFromContent = (content: string) => {
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
};

const fallbackRecipe = {
  title: "Recipe suggestion",
  description: "A helpful kitchen idea based on your request.",
  ingredients: [],
  steps: [],
  prepTime: 15,
  cookTime: 20,
  totalTime: 35,
  servings: 4,
  cuisine: "Mixed",
  estimatedCost: 12,
  costPerServing: 3,
  vibe: "Comforting"
};

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

  console.log("concierge prompt", prompt);

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    res.status(200).json({ recipe: fallbackRecipe });
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
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful cooking concierge. Respond with valid JSON only. Return a recipe object with title, description, ingredients (array of {name, qty}), steps (array of strings), prepTime, cookTime, totalTime, servings, cuisine, estimatedCost, costPerServing, vibe, and a short summary."
          },
          {
            role: "user",
            content: `Generate a recipe for this request: ${prompt}. Return a concise recipe with ingredients, steps, prep time, cook time, total time, servings, cuisine, estimated cost, cost per serving, vibe, and a short summary. Do not include markdown.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({ error: errorText });
      return;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? "";

    let recipe;

    try {
      recipe = typeof content === "string" ? parseRecipeFromContent(content) : content;
    } catch {
      res.status(200).json({ recipe: fallbackRecipe });
      return;
    }

    if (!recipe?.title) {
      res.status(500).json({ error: "OpenAI returned an empty recipe" });
      return;
    }

    console.log("concierge response title", recipe.title);
    res.status(200).json({ recipe });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
}
