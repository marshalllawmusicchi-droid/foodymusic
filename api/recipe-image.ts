import { getOpenAIApiKey } from "./openai-config";

export type RecipeImagePayload = {
  title: string;
  description?: string;
  cuisine?: string;
  ingredients?: Array<{ name: string; qty?: string }>;
  vibe?: string;
};

const IMAGE_MODEL = "gpt-image-1";

const buildImagePrompt = (recipe: RecipeImagePayload) => {
  const ingredients =
    recipe.ingredients?.slice(0, 10).map((item) => item.name).join(", ") ?? "fresh ingredients";

  return [
    `Professional food photography of "${recipe.title}".`,
    recipe.description ?? "",
    `${recipe.cuisine ?? "Homestyle"} cuisine featuring ${ingredients}.`,
    `Style: ${recipe.vibe ?? "appetizing and comforting"}.`,
    "Beautifully plated finished dish, warm lighting, dark moody background, no text, no watermark.",
  ]
    .filter(Boolean)
    .join(" ");
};

const formatOpenAIError = (statusCode: number, errorBody: unknown): string => {
  const bodyText =
    typeof errorBody === "string" ? errorBody : JSON.stringify(errorBody, null, 2);

  return `HTTP ${statusCode}\n${bodyText}`;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const recipe = req.body as RecipeImagePayload;

  if (!recipe?.title || typeof recipe.title !== "string") {
    res.status(400).json({ error: "A recipe title is required" });
    return;
  }

  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    res.status(503).json({ error: "OpenAI API key is not configured." });
    return;
  }

  const prompt = buildImagePrompt(recipe);

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    let responseBody: unknown;

    try {
      responseBody = await response.json();
    } catch {
      responseBody = await response.text();
    }

    if (!response.ok) {
      const errorMessage = formatOpenAIError(response.status, responseBody);
      console.error("[RecipeImage API] OpenAI Images API error", {
        statusCode: response.status,
        errorBody: responseBody,
      });

      res.status(response.status).json({
        error: errorMessage,
        statusCode: response.status,
        errorBody: responseBody,
      });
      return;
    }

    const imageData = (responseBody as { data?: Array<{ url?: string; b64_json?: string }> })?.data?.[0];
    const imageUrl =
      typeof imageData?.url === "string" && imageData.url.length > 0
        ? imageData.url
        : typeof imageData?.b64_json === "string" && imageData.b64_json.length > 0
          ? `data:image/png;base64,${imageData.b64_json}`
          : undefined;

    if (typeof imageUrl === "string" && imageUrl.length > 0) {
      res.status(200).json({ imageUrl });
      return;
    }

    const errorMessage = formatOpenAIError(response.status, responseBody);
    console.error("[RecipeImage API] OpenAI Images API returned no image URL", {
      statusCode: response.status,
      errorBody: responseBody,
    });

    res.status(502).json({
      error: errorMessage,
      statusCode: response.status,
      errorBody: responseBody,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[RecipeImage API] Request failed", error);
    res.status(500).json({ error: `Unable to generate recipe image: ${message}` });
  }
}
