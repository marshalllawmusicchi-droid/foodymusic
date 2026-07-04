import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, ArrowRight, Clock3, DollarSign, ChefHat, Music4, ShoppingBag, ListChecks, Info } from "lucide-react";
import { ForkClef, Badge, Waveform } from "../components/ui/Logo";
import { useApp } from "../context/AppContext";
import { PlaylistCard, CouponCard, ProductCard, ArtistCard } from "../components/Cards";
import { suggestedPrompts, recipes, coupons, artists, playlists, products, conciergeResponses, type ConciergeResponse } from "../data/seed";
import { buildConciergeRecommendation, getConciergeRecipe } from "../services/concierge";

const money = (n: number) => "$" + n.toFixed(2);

const ResponseStack: React.FC<{ resp: ConciergeResponse }> = ({ resp }) => {
  const { navigate, addGrocery } = useApp();
  const recipe = recipes.find((r) => r.id === resp.recipeId)!;
  const playlist = playlists.find((p) => p.id === resp.playlistId)!;
  const respArtists = artists.filter((a) => resp.artistIds.includes(a.id));
  const respCoupons = coupons.filter((c) => resp.coupons.includes(c.id));
  const respKitchen = products.filter((k) => resp.kitchenIds.includes(k.id));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-white/[0.03] to-emerald-500/10 p-4 sm:p-5">
        <p className="text-sm leading-6 text-zinc-300">{resp.intro}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-black/20 border border-white/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Meal cost</p>
            <p className="mt-1 text-lg font-black text-white">{money(resp.cost.mealCost)}</p>
          </div>
          <div className="rounded-xl bg-black/20 border border-white/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">You save</p>
            <p className="mt-1 text-lg font-black text-emerald-400">{money(resp.cost.savings)}</p>
          </div>
          <div className="rounded-xl bg-black/20 border border-white/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Per serving</p>
            <p className="mt-1 text-lg font-black text-amber-400">{money(resp.cost.perServing)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400">Recipe recommendation</p>
              <h4 className="mt-1 font-semibold text-white">{recipe.title}</h4>
            </div>
            <button onClick={() => navigate("recipeDetail", recipe.id)} className="flex items-center gap-1 text-sm font-semibold text-amber-400">
              View <ArrowRight size={15} />
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-black/20 p-3 sm:flex-row">
            <img src={recipe.image} alt={recipe.title} className="h-24 w-full rounded-xl object-cover sm:w-28" />
            <div className="flex-1">
              <p className="text-sm text-zinc-300">{recipe.description}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-400">
                <span className="rounded-full bg-white/10 px-2.5 py-1">{recipe.cuisine}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1">{recipe.time} min</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1">{recipe.servings} servings</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-white/[0.03] p-4">
          <h4 className="font-semibold text-white">Why this fits</h4>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            <li>• Built around your pantry and budget.</li>
            <li>• Fast enough for a weeknight but still feels premium.</li>
            <li>• Comes with playlist, savings, and gear suggestions.</li>
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
            <button onClick={() => { addGrocery(resp.shoppingList.map((item) => item.name)); navigate("grocery"); }} className="flex items-center gap-1 text-sm font-semibold text-emerald-400">
              <ShoppingBag size={14} /> Add all
            </button>
          </div>
          <div className="mt-3 grid gap-2">
            {resp.shoppingList.map((item) => (
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
            {recipe.steps.slice(0, 4).map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-300">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1db954]/20 bg-gradient-to-br from-[#1db954]/10 to-white/[0.03] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#1db954]">Spotify playlist suggestion</p>
            <h4 className="mt-1 font-semibold text-white">{playlist.title}</h4>
          </div>
          <Waveform />
        </div>
        <div className="mt-3">
          <PlaylistCard playlist={playlist} compact />
        </div>
      </div>

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
            {respKitchen.map((tool) => (
              <div key={tool.id} onClick={() => navigate("kitchen")} className="cursor-pointer">
                <ProductCard product={tool} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400">Featured artist</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {respArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </div>
    </div>
  );
};

type Msg = { role: "user" | "ai"; text?: string; resp?: ConciergeResponse; response?: ReturnType<typeof buildConciergeRecommendation> };

const MockResponseStack: React.FC<{ response: ReturnType<typeof buildConciergeRecommendation> }> = ({ response }) => {
  const { navigate } = useApp();
  const playlist = playlists.find((p) => p.id === response.playlistId)!;
  const artist = artists.find((a) => a.id === response.artistId)!;
  const respCoupons = coupons.filter((c) => response.couponIds.includes(c.id));
  const respTools = products.filter((p) => response.toolIds.includes(p.id));

  if (!response.matchFound) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-300">
          <Sparkles size={12} /> Concierge match
        </div>
        <h3 className="mt-3 text-xl font-black text-white">{response.title}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-300">{response.description}</p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
          Try a prompt like “fried chicken”, “burgers”, “tacos”, “pizza”, “steak”, “salmon”, “pasta”, “chili”, “BBQ ribs”, “meatloaf”, or “shrimp”.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-white/[0.03] to-emerald-500/10 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-300">
              <Sparkles size={12} /> Foody Music AI Concierge
            </div>
            <h3 className="mt-3 text-2xl font-black text-white">{response.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">{response.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-200">{response.recipeCuisine}</span>
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
              <h4 className="mt-1 font-semibold text-white">Core pantry list</h4>
            </div>
            <div className="flex items-center gap-1 text-sm text-zinc-400"><ListChecks size={14} /> Ready</div>
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-amber-300"><DollarSign size={16} /> <p className="text-sm font-semibold text-white">Estimated cost</p></div>
          <p className="mt-2 text-2xl font-black text-white">{money(response.estimatedCost)}</p>
          <p className="mt-1 text-xs text-zinc-500">Around the cost of takeout for one night.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-amber-300"><Clock3 size={16} /> <p className="text-sm font-semibold text-white">Cost per serving</p></div>
          <p className="mt-2 text-2xl font-black text-amber-400">{money(response.costPerServing)}</p>
          <p className="mt-1 text-xs text-zinc-500">Efficient for leftovers and repeat lunches.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-amber-300"><ChefHat size={16} /> <p className="text-sm font-semibold text-white">Serving size</p></div>
          <p className="mt-2 text-2xl font-black text-emerald-400">{response.servings}</p>
          <p className="mt-1 text-xs text-zinc-500">Perfect for a small household or dinner for guests.</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-[#1db954]/20 bg-gradient-to-br from-[#1db954]/10 to-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#1db954]">Spotify playlist suggestion</p>
              <h4 className="mt-1 font-semibold text-white">{playlist.title}</h4>
            </div>
            <Music4 size={18} className="text-[#1db954]" />
          </div>
          <div className="mt-3">
            <PlaylistCard playlist={playlist} compact />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400">Featured artist</p>
          <div className="mt-3">
            <ArtistCard artist={artist} />
          </div>
        </div>
      </div>

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

export const Concierge: React.FC = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);

    const fallback = conciergeResponses[text] || Object.values(conciergeResponses)[0];
    const recommendation = await getConciergeRecipe(text);
    setMessages((m) => [...m, { role: "ai", response: recommendation, resp: fallback }]);
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
                <ForkClef size={14} /> Premium concierge prototype
              </div>
              <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">Turn ingredients into a full dinner plan.</h1>
              <p className="mt-3 text-base leading-7 text-zinc-300 sm:text-lg">
                Describe what you have, and Foody Music will generate a recipe, ingredients, step-by-step cooking guide, coupons, a Spotify playlist, and kitchen gear suggestions in one polished flow.
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
                  {message.response ? <MockResponseStack response={message.response} /> : message.resp ? <ResponseStack resp={message.resp} /> : null}
                </div>
              </div>
            )
          )}

          {typing && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-emerald-500">
                <Sparkles size={16} className="text-black" />
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((dot) => (
                  <span key={dot} className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: `${dot * 150}ms` }} />
                ))}
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
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Try: I have chicken, rice, and broccoli. What can I cook for under $20?"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          />
          <button type="submit" className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-black transition hover:bg-amber-400">
            <Send size={16} />
          </button>
        </form>
        <p className="mt-2 text-xs text-zinc-500">Recipes are generated through the concierge service and fall back gracefully when the AI service is unavailable.</p>
      </div>
    </div>
  );
};
