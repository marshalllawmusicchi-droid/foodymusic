import React, { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Send, ArrowRight, Clock3, DollarSign, Music4, ShoppingBag, Info, AlertCircle, Loader2, Flame, Mic } from "lucide-react";
import { ForkClef, Waveform } from "../components/ui/Logo";
import { useApp } from "../context/AppContext";
import { CouponCard, ProductCard, ArtistCard } from "../components/Cards";
import { suggestedPrompts, coupons, artists, products } from "../data/seed";
import { getConciergeRecipe, type ConciergeRecommendation } from "../services/concierge";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

const money = (n: number) => "$" + n.toFixed(2);

const difficultyColor = (level: string) => {
  if (level === "Easy") return "text-emerald-400 bg-emerald-500/15";
  if (level === "Hard") return "text-rose-400 bg-rose-500/15";
  return "text-amber-400 bg-amber-500/15";
};

const ErrorBanner: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
    <div className="flex items-start gap-3">
      <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-400" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-rose-200">Something went wrong</p>
        <p className="mt-1 text-sm text-zinc-300">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-3 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20">
            Try again
          </button>
        )}
      </div>
    </div>
  </div>
);

const RecipeResponseStack: React.FC<{ response: ConciergeRecommendation; error?: string; onRetry?: () => void }> = ({ response, error, onRetry }) => {
  const { navigate, addGrocery } = useApp();
  const respCoupons = coupons.filter((c) => response.couponIds.includes(c.id));
  const respTools = products.filter((p) => response.toolIds.includes(p.id));
  const artist = artists.find((a) => a.id === response.artistId);

  if (!response.matchFound) {
    return (
      <div className="space-y-4">
        {error && <ErrorBanner message={error} onRetry={onRetry} />}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-300">
            <Sparkles size={12} /> AI Concierge
          </div>
          <h3 className="mt-3 text-xl font-black text-white">{response.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{response.description}</p>
        </div>
      </div>
    );
  }

  const isAiGenerated = response.source === "openai";

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      <div className="rounded-[24px] border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-white/[0.03] to-emerald-500/10 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-300">
                <Sparkles size={12} /> Foody Music AI Concierge
              </div>
              {isAiGenerated ? (
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">AI generated</span>
              ) : (
                <span className="rounded-full bg-zinc-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Sample recipe</span>
              )}
            </div>
            <h3 className="mt-3 text-2xl font-black text-white">{response.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">{response.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-200">{response.recipeCuisine}</span>
              <span className={`rounded-full px-3 py-1 text-xs ${difficultyColor(response.difficulty)}`}>{response.difficulty}</span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">{response.budgetLabel}</span>
              <span className="rounded-full bg-[#1db954]/15 px-3 py-1 text-xs text-[#1db954]">{response.servings} servings</span>
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-200">Prep {response.prepTime} min</span>
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-200">Cook {response.cookTime} min</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:min-w-[280px]">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
              <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Estimated cost</p>
              <p className="mt-1 text-lg font-black text-white">{money(response.estimatedCost)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
              <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Per serving</p>
              <p className="mt-1 text-lg font-black text-amber-400">{money(response.costPerServing)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center sm:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Total time</p>
              <p className="mt-1 text-sm font-semibold text-emerald-400">{response.totalTime} min total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400">Recipe recommendation</p>
              <h4 className="mt-1 font-semibold text-white">{response.recipeTitle}</h4>
            </div>
            <button onClick={() => navigate("recipes")} className="flex items-center gap-1 text-sm font-semibold text-amber-400">
              Browse recipes <ArrowRight size={15} />
            </button>
          </div>
          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-black/20 p-3">
            <p className="text-sm text-zinc-300">{response.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
              <span className="rounded-full bg-white/10 px-2.5 py-1">{response.recipeCuisine}</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1">{response.servings} servings</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1">{response.vibe}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-emerald-300">
            <Info size={16} />
            <h4 className="font-semibold text-white">Why this fits your request</h4>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            <li>• Uses what you already have and stays under your budget target.</li>
            <li>• Feels elevated with a quick prep timeline and strong flavor payoff.</li>
            <li>• Includes a playlist, coupons, and kitchen tools in one flow.</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400">Ingredients</p>
              <h4 className="mt-1 font-semibold text-white">Shopping list</h4>
            </div>
            <button
              onClick={() => { addGrocery(response.ingredients.map((item) => item.name)); navigate("grocery"); }}
              className="flex items-center gap-1 text-sm font-semibold text-emerald-400"
            >
              <ShoppingBag size={14} /> Add all
            </button>
          </div>
          <div className="mt-3 grid gap-2">
            {response.ingredients.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-sm">
                <span className="text-zinc-300">{item.name}</span>
                <span className="text-zinc-500">{item.qty}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400">Cooking instructions</p>
          <ol className="mt-3 space-y-2 text-sm text-zinc-300">
            {response.steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-300">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-amber-300"><Flame size={16} /> <p className="text-sm font-semibold text-white">Nutrition summary</p></div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{response.nutrition.summary}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-black/20 px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Calories</p>
              <p className="mt-1 text-lg font-black text-white">{response.nutrition.calories}</p>
            </div>
            <div className="rounded-xl bg-black/20 px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Protein</p>
              <p className="mt-1 text-lg font-black text-emerald-400">{response.nutrition.protein}</p>
            </div>
            <div className="rounded-xl bg-black/20 px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Carbs</p>
              <p className="mt-1 text-lg font-black text-amber-400">{response.nutrition.carbs}</p>
            </div>
            <div className="rounded-xl bg-black/20 px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Fat</p>
              <p className="mt-1 text-lg font-black text-zinc-300">{response.nutrition.fat}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-amber-300"><DollarSign size={16} /> <p className="text-sm font-semibold text-white">Estimated grocery cost</p></div>
            <p className="mt-2 text-2xl font-black text-white">{money(response.estimatedCost)}</p>
            <p className="mt-1 text-xs text-zinc-500">{money(response.costPerServing)} per serving · {response.servings} servings</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-amber-300"><Clock3 size={16} /> <p className="text-sm font-semibold text-white">Cook time</p></div>
            <p className="mt-2 text-2xl font-black text-emerald-400">{response.cookTime} min</p>
            <p className="mt-1 text-xs text-zinc-500">{response.prepTime} min prep · {response.totalTime} min total · {response.difficulty}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1db954]/20 bg-gradient-to-br from-[#1db954]/10 to-white/[0.03] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#1db954]">Spotify playlist</p>
            <h4 className="mt-1 font-semibold text-white">{response.playlist.title}</h4>
            <p className="mt-1 text-sm text-zinc-400">{response.playlist.mood}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#1db954]/30 bg-[#1db954]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1db954]">Coming soon</span>
            <Music4 size={18} className="text-[#1db954]" />
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-300">{response.playlist.description}</p>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#1db954]/20 bg-black/20 px-4 py-3">
          <Waveform />
          <p className="text-xs text-zinc-500">Spotify integration coming soon — your cooking playlist will appear here.</p>
        </div>
      </div>
      {artist && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400">Featured artist</p>
          <div className="mt-3">
            <ArtistCard artist={artist} />
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400">Grocery coupons & savings</p>
          <div className="mt-3 grid gap-3">
            {respCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400">Kitchen+ tools</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {respTools.map((tool) => (
              <div key={tool.id} onClick={() => navigate("kitchen")} className="cursor-pointer">
                <ProductCard product={tool} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

type Msg = {
  role: "user" | "ai";
  text?: string;
  response?: ConciergeRecommendation;
  error?: string;
  prompt?: string;
};

export const Concierge: React.FC = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTranscript = useCallback((text: string) => {
    setInput(text);
  }, []);

  const {
    isSupported: speechSupported,
    isListening,
    error: speechError,
    debugMessage: speechDebug,
    handleMicClick,
    stopListening,
  } = useSpeechRecognition({ onTranscript: handleTranscript });

  useEffect(() => {
    if (!isListening && input.trim()) {
      inputRef.current?.focus();
    }
  }, [isListening, input]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, isListening]);

  const send = async (text: string) => {
    if (!text.trim() || typing) return;
    stopListening();
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);

    const result = await getConciergeRecipe(text);

    if (result.ok) {
      setMessages((m) => [...m, { role: "ai", response: result.recipe, prompt: text }]);
    } else if (result.recipe) {
      setMessages((m) => [...m, { role: "ai", response: result.recipe, error: result.error, prompt: text }]);
    } else {
      setMessages((m) => [...m, { role: "ai", error: result.error, prompt: text }]);
    }

    setTyping(false);
  };

  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      {empty ? (
        <div className="flex-1">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-amber-500/15 via-white/[0.03] to-emerald-500/10 p-6 sm:p-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300">
                <ForkClef size={14} /> AI cooking assistant
              </div>
              <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">Turn ingredients into a full dinner plan.</h1>
              <p className="mt-3 text-base leading-7 text-zinc-300 sm:text-lg">
                Describe what you have, and Foody Music's AI will generate a recipe with ingredients, step-by-step instructions, nutrition, cost estimates, and a playlist placeholder — all in one polished flow.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-zinc-200">Budget-aware</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-zinc-200">Mobile-first</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-zinc-200">Spotify-ready</span>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {suggestedPrompts.map((prompt) => (
                <button key={prompt} onClick={() => { void send(prompt); }} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-zinc-200 transition hover:border-amber-500/40">
                  <Sparkles size={15} className="shrink-0 text-amber-400" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-6 pb-4">
          {messages.map((message, index) =>
            message.role === "user" ? (
              <div key={index} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-amber-500 px-4 py-2.5 text-sm font-medium text-black">
                  {message.text}
                </div>
              </div>
            ) : (
              <div key={index} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-emerald-500">
                  <Sparkles size={16} className="text-black" />
                </div>
                <div className="flex-1 rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.02] p-4">
                  {message.response ? (
                    <RecipeResponseStack
                      response={message.response}
                      error={message.error}
                      onRetry={message.prompt ? () => { void send(message.prompt!); } : undefined}
                    />
                  ) : message.error ? (
                    <ErrorBanner message={message.error} onRetry={message.prompt ? () => { void send(message.prompt!); } : undefined} />
                  ) : null}
                </div>
              </div>
            )
          )}

          {typing && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-emerald-500">
                <Sparkles size={16} className="text-black" />
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <Loader2 size={16} className="animate-spin text-amber-400" />
                <span className="text-sm text-zinc-400">Generating your recipe…</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      <div className="sticky bottom-16 mt-4 bg-[#0a0a0b] pt-2 lg:bottom-4">
        {!empty && (
          <div className="mb-2 flex gap-2 overflow-x-auto pb-2">
            {suggestedPrompts.map((prompt) => (
              <button key={prompt} onClick={() => { void send(prompt); }} className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-amber-500/40">
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={(event) => { event.preventDefault(); void send(input); }} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 focus-within:border-amber-500/50">
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Try: I have chicken, rice, and broccoli. What can I cook for under $20?"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            disabled={isListening}
          />
          {speechSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              disabled={typing}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                isListening
                  ? "bg-rose-500/20 text-rose-300 ring-2 ring-rose-500/40 animate-pulse"
                  : "bg-white/10 text-zinc-300 hover:bg-white/15 hover:text-amber-300"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <Mic size={16} />
            </button>
          )}
          <button
            type="submit"
            disabled={typing || isListening || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
        {isListening && (
          <p className="mt-2 flex items-center gap-2 text-xs text-amber-300">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            Listening… speak your cooking request, then edit or press Send.
          </p>
        )}
        {speechDebug && (
          <p className="mt-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-400">
            {speechDebug}
          </p>
        )}
        {speechError && (
          <p className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {speechError}
          </p>
        )}
        {!isListening && (
          <p className="mt-2 text-xs text-zinc-500">
            {speechSupported
              ? "Recipes are generated by OpenAI. Tap the microphone to speak your request."
              : "Voice input is not supported in this browser. Type your request instead."}
          </p>
        )}
      </div>
    </div>
  );
};
