import { useCallback, useState } from "react";
import { getConciergeRecipe, type ConciergeRecommendation } from "../services/concierge";
import {
  HEY_FOODY_GREETING,
  askHeyFoody,
  buildIngredientsMessage,
  buildStepMessage,
  isCookingQuestion,
  isNextCommand,
} from "../services/heyFoody";

export type HeyFoodyPhase =
  | "inactive"
  | "awaiting_request"
  | "generating"
  | "guiding"
  | "answering"
  | "complete";

export type HeyFoodyMessage = {
  id: string;
  role: "foody" | "user";
  text: string;
};

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useHeyFoody = (options?: {
  onRecipeGenerated?: (recipe: ConciergeRecommendation, prompt: string) => void;
}) => {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<HeyFoodyPhase>("inactive");
  const [messages, setMessages] = useState<HeyFoodyMessage[]>([]);
  const [recipe, setRecipe] = useState<ConciergeRecommendation | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);

  const appendFoody = useCallback((text: string) => {
    setMessages((current) => [...current, { id: createId(), role: "foody", text }]);
  }, []);

  const appendUser = useCallback((text: string) => {
    setMessages((current) => [...current, { id: createId(), role: "user", text }]);
  }, []);

  const resetSession = useCallback(() => {
    setActive(false);
    setPhase("inactive");
    setMessages([]);
    setRecipe(null);
    setStepIndex(0);
    setBusy(false);
  }, []);

  const activate = useCallback(() => {
    setActive(true);
    setPhase("awaiting_request");
    setMessages([{ id: createId(), role: "foody", text: HEY_FOODY_GREETING }]);
    setRecipe(null);
    setStepIndex(0);
    setBusy(false);
  }, []);

  const startGuiding = useCallback(
    (nextRecipe: ConciergeRecommendation) => {
      setRecipe(nextRecipe);
      setStepIndex(0);
      setPhase("guiding");
      appendFoody(`Great choice — let's make ${nextRecipe.title}!`);
      appendFoody(buildIngredientsMessage(nextRecipe));
      appendFoody(buildStepMessage(nextRecipe, 0));
    },
    [appendFoody],
  );

  const submitRequest = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;

      appendUser(trimmed);
      setBusy(true);
      setPhase("generating");
      appendFoody("On it — I'm pulling together a recipe for you…");

      const result = await getConciergeRecipe(trimmed);

      setBusy(false);

      if (result.ok && result.recipe.matchFound) {
        options?.onRecipeGenerated?.(result.recipe, trimmed);
        startGuiding(result.recipe);
        return;
      }

      if (result.recipe?.matchFound) {
        appendFoody(result.error ?? "I found a sample recipe to walk you through.");
        options?.onRecipeGenerated?.(result.recipe, trimmed);
        startGuiding(result.recipe);
        return;
      }

      setPhase("awaiting_request");
      appendFoody(
        result.error ??
          "I couldn't build a recipe from that. Try telling me a dish name or a few ingredients you have on hand.",
      );
    },
    [appendFoody, appendUser, busy, options, startGuiding],
  );

  const advanceStep = useCallback(() => {
    if (!recipe) return;

    const nextIndex = stepIndex + 1;
    if (nextIndex >= recipe.steps.length) {
      setPhase("complete");
      appendFoody(`You finished ${recipe.title}! Plate it up and enjoy — you nailed it.`);
      return;
    }

    setStepIndex(nextIndex);
    setPhase("guiding");
    appendFoody(buildStepMessage(recipe, nextIndex));
  }, [appendFoody, recipe, stepIndex]);

  const answerQuestion = useCallback(
    async (text: string) => {
      if (!recipe) return;

      appendUser(text);
      setBusy(true);
      setPhase("answering");
      appendFoody("Good question — let me think…");

      const result = await askHeyFoody(text, recipe, stepIndex);

      setBusy(false);
      setPhase("guiding");
      appendFoody(result.answer);
    },
    [appendFoody, appendUser, recipe, stepIndex],
  );

  const handleInput = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;

      if (phase === "awaiting_request") {
        await submitRequest(trimmed);
        return;
      }

      if (phase === "guiding" || phase === "complete") {
        if (isNextCommand(trimmed)) {
          if (phase === "complete") {
            appendFoody("You're already at the finish line. Exit Hey Foody™ or ask for a new recipe anytime.");
            return;
          }
          advanceStep();
          return;
        }

        if (isCookingQuestion(trimmed)) {
          await answerQuestion(trimmed);
          return;
        }

        if (phase === "complete") {
          appendFoody("Your dish is done! Tap Exit to return to the Concierge, or tap the mic for a new recipe.");
          return;
        }

        appendFoody('Say "next" when you finish this step, or ask me a cooking question.');
        return;
      }

      if (phase === "generating" || phase === "answering") {
        appendFoody("Hang tight — I'm still working on that.");
      }
    },
    [advanceStep, answerQuestion, appendFoody, busy, phase, submitRequest],
  );

  const handleVoiceInput = useCallback(
    (text: string, isFinal: boolean) => {
      if (!active || !isFinal) return;
      void handleInput(text);
    },
    [active, handleInput],
  );

  return {
    active,
    phase,
    messages,
    recipe,
    stepIndex,
    busy,
    activate,
    deactivate: resetSession,
    handleInput,
    handleVoiceInput,
    advanceStep,
  };
};
