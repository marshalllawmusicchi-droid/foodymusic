import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ConciergeRecommendation } from "../services/concierge";
import { useRecipeImage } from "../hooks/useRecipeImage";

type RecipeGeneratedImageProps = {
  response: ConciergeRecommendation;
};

export const RecipeGeneratedImage: React.FC<RecipeGeneratedImageProps> = ({ response }) => {
  const enabled = response.matchFound && response.source === "openai";
  const { status, imageUrl, errorMessage } = useRecipeImage(response, enabled);
  const [renderFailed, setRenderFailed] = useState(false);

  useEffect(() => {
    setRenderFailed(false);
  }, [imageUrl]);

  if (!enabled) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400">Recipe image</p>

      {status === "loading" && (
        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 size={16} className="animate-spin text-amber-400" />
          Creating dish photo…
        </div>
      )}

      {status === "success" && imageUrl && !renderFailed && (
        <img
          src={imageUrl}
          alt={`AI-generated photo of ${response.title}`}
          className="mt-3 block w-full max-h-[480px] rounded-xl border border-white/10 object-cover"
          onLoad={() => setRenderFailed(false)}
          onError={() => setRenderFailed(true)}
        />
      )}

      {status === "success" && renderFailed && (
        <p className="mt-3 text-xs text-rose-300">
          Recipe image could not be displayed in the browser.
        </p>
      )}

      {status === "error" && errorMessage && (
        <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-rose-300">{errorMessage}</pre>
      )}
    </div>
  );
};
