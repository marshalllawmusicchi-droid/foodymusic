export type RecipeImageRequest = {
  title: string;
  description?: string;
  cuisine?: string;
  ingredients?: Array<{ name: string; qty?: string }>;
  vibe?: string;
};

export type RecipeImageResult =
  | { ok: true; imageUrl: string }
  | { ok: false; error: string; statusCode?: number; errorBody?: unknown };

const sessionImageCache = new Map<string, string>();

export const buildRecipeImageCacheKey = (recipe: RecipeImageRequest): string => {
  const ingredients = (recipe.ingredients ?? [])
    .map((item) => `${item.name}:${item.qty ?? ""}`)
    .join("|");

  return [recipe.title, recipe.cuisine ?? "", recipe.vibe ?? "", ingredients].join("::");
};

export const getCachedRecipeImage = (cacheKey: string): string | undefined =>
  sessionImageCache.get(cacheKey);

export const setCachedRecipeImage = (cacheKey: string, imageUrl: string): void => {
  sessionImageCache.set(cacheKey, imageUrl);
};

const formatApiError = (
  statusCode: number,
  error?: string,
  errorBody?: unknown,
): string => {
  if (error) {
    return error;
  }

  const bodyText =
    errorBody === undefined
      ? ""
      : typeof errorBody === "string"
        ? errorBody
        : JSON.stringify(errorBody, null, 2);

  return bodyText ? `HTTP ${statusCode}\n${bodyText}` : `HTTP ${statusCode}`;
};

export const fetchRecipeImage = async (recipe: RecipeImageRequest): Promise<RecipeImageResult> => {
  try {
    const response = await fetch("/api/recipe-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipe),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const statusCode = typeof data?.statusCode === "number" ? data.statusCode : response.status;
      const error = formatApiError(statusCode, data?.error, data?.errorBody);

      console.error("[RecipeImage] API error", {
        statusCode,
        errorBody: data?.errorBody ?? data,
      });

      return {
        ok: false,
        error,
        statusCode,
        errorBody: data?.errorBody ?? data,
      };
    }

    if (typeof data?.imageUrl === "string" && data.imageUrl.length > 0) {
      return { ok: true, imageUrl: data.imageUrl };
    }

    const statusCode = typeof data?.statusCode === "number" ? data.statusCode : response.status;
    const error = formatApiError(statusCode, data?.error, data?.errorBody ?? data);

    console.error("[RecipeImage] API returned no image URL", {
      statusCode,
      errorBody: data?.errorBody ?? data,
    });

    return {
      ok: false,
      error,
      statusCode,
      errorBody: data?.errorBody ?? data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[RecipeImage] Network or client error", error);

    return {
      ok: false,
      error: message,
    };
  }
};
