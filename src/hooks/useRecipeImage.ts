import { useEffect, useRef, useState } from "react";
import type { ConciergeRecommendation } from "../services/concierge";
import {
  buildRecipeImageCacheKey,
  fetchRecipeImage,
  getCachedRecipeImage,
  setCachedRecipeImage,
} from "../services/recipeImage";

type RecipeImageStatus = "idle" | "loading" | "success" | "error";

const toDisplayImageUrl = async (rawUrl: string): Promise<string> => {
  if (!rawUrl.startsWith("data:")) {
    return rawUrl;
  }

  const blob = await (await fetch(rawUrl)).blob();
  return URL.createObjectURL(blob);
};

export const useRecipeImage = (response: ConciergeRecommendation, enabled: boolean) => {
  const [status, setStatus] = useState<RecipeImageStatus>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const ingredientsKey = (response.ingredients ?? [])
    .map((item) => `${item.name}:${item.qty ?? ""}`)
    .join("|");

  useEffect(() => {
    const revokeObjectUrl = () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };

    if (!enabled) {
      revokeObjectUrl();
      setStatus("idle");
      setImageUrl(null);
      setErrorMessage(null);
      return undefined;
    }

    const request = {
      title: response.title,
      description: response.description,
      cuisine: response.recipeCuisine,
      ingredients: response.ingredients,
      vibe: response.vibe,
    };

    const cacheKey = buildRecipeImageCacheKey(request);
    const cached = getCachedRecipeImage(cacheKey);
    let cancelled = false;

    const applyImageUrl = async (rawUrl: string) => {
      try {
        const displayUrl = await toDisplayImageUrl(rawUrl);

        if (cancelled) {
          if (displayUrl.startsWith("blob:")) {
            URL.revokeObjectURL(displayUrl);
          }
          return;
        }

        revokeObjectUrl();
        if (displayUrl.startsWith("blob:")) {
          objectUrlRef.current = displayUrl;
        }

        setImageUrl(displayUrl);
        setErrorMessage(null);
        setStatus("success");
      } catch (error) {
        if (cancelled) return;

        const message = error instanceof Error ? error.message : "Unable to render recipe image.";
        setErrorMessage(message);
        setStatus("error");
      }
    };

    setStatus("loading");
    setImageUrl(null);
    setErrorMessage(null);

    if (cached) {
      void applyImageUrl(cached);
    } else {
      void fetchRecipeImage(request).then((result) => {
        if (cancelled) return;

        if (result.ok) {
          setCachedRecipeImage(cacheKey, result.imageUrl);
          void applyImageUrl(result.imageUrl);
          return;
        }

        setErrorMessage(result.error);
        setStatus("error");
      });
    }

    return () => {
      cancelled = true;
      revokeObjectUrl();
    };
  }, [
    enabled,
    response.title,
    response.description,
    response.recipeCuisine,
    response.vibe,
    ingredientsKey,
  ]);

  return { status, imageUrl, errorMessage };
};
