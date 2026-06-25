import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, ChevronDown, ChevronUp, ListPlus, ExternalLink, ArrowRight } from "lucide-react";
import { ForkClef } from "../components/ui/Logo";
import { Badge, Waveform } from "../components/ui/Logo";
import { useApp } from "../context/AppContext";
import { RecipeCard, PlaylistCard, CouponCard, ProductCard } from "../components/Cards";
import {
  suggestedPrompts, conciergeResponses, recipes, coupons, artists, playlists, products,
  type ConciergeResponse,
} from "../data/seed";

const money = (n: number) => "$" + n.toFixed(2);

const CollapsibleSteps: React.FC<{ steps: string[] }> = ({ steps }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3">
        <span className="font-semibold text-white text-sm">Step-by-step instructions</span>
        {open ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
      </button>
      {open && (
        <ol className="px-4 pb-4 space-y-2">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-zinc-300">
              <span className="w-5 h-5 shrink-0 rounded-full bg-amber-500/20 text-amber-300 text-xs flex items-center justify-center font-bold">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

const ResponseStack: React.FC<{ resp: ConciergeResponse }> = ({ resp }) => {
  const { navigate, addGrocery } = useApp();
  const recipe = recipes.find((r) => r.id === resp.recipeId)!;
  const playlist = playlists.find((p) => p.id === resp.playlistId)!;
  const respArtists = artists.filter((a) => resp.artistIds.includes(a.id));
  const respCoupons = coupons.filter((c) => resp.coupons.includes(c.id));
  const respKitchen = products.filter((k) => resp.kitchenIds.includes(k.id));

  return (
    <div className="space-y-4">
      <p className="text-zinc-200">{resp.intro}</p>

      {/* Recipe card */}
      <div onClick={() => navigate("recipeDetail", recipe.id)} className="rounded-2xl overflow-hidden border border-amber-500/30 bg-white/[0.04] cursor-pointer hover:border-amber-500/60 transition flex">
        <img src={recipe.image} alt="" className="w-28 sm:w-40 object-cover" />
        <div className="p-4 flex-1">
          <Badge kind="Sponsored" className={recipe.sponsored ? "mb-2 inline-block" : "hidden"} />
          <h3 className="font-bold text-white">{recipe.title}</h3>
          <p className="text-xs text-zinc-400 mt-1">{recipe.cuisine} · {recipe.time} min · {recipe.servings} servings</p>
          <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-semibold mt-2">View recipe <ArrowRight size={13} /></span>
        </div>
      </div>

      <CollapsibleSteps steps={recipe.steps} />

      {/* Shopping list */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-white text-sm">Shopping List</h4>
          <button onClick={() => { addGrocery(resp.shoppingList.map((i) => i.name)); navigate("grocery"); }} className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <ListPlus size={14} /> Add all
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {resp.shoppingList.map((i) => (
            <div key={i.name} className="flex justify-between text-sm">
              <span className="text-zinc-300">{i.name}</span><span className="text-zinc-500">{i.qty}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coupons */}
      <div>
        <h4 className="font-semibold text-white text-sm mb-2">Grocery Coupons</h4>
        <div className="grid grid-cols-3 gap-2">
          {respCoupons.map((c) => (
            <div key={c.id} className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
              <p className="text-emerald-300 font-bold">{c.discount}</p>
              <p className="text-[11px] text-zinc-400">{c.brand}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Affiliate */}
      <div className="grid grid-cols-2 gap-2">
        {resp.affiliate.map((a) => (
          <div key={a.name} className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <Badge kind="Affiliate" />
            <p className="text-sm text-white font-medium mt-1.5">{a.name}</p>
            <p className="text-xs text-zinc-400">{a.deal}</p>
          </div>
        ))}
      </div>

      {/* Playlist */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1db954]/10 to-white/[0.03] border border-[#1db954]/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#1db954] font-semibold uppercase tracking-wide">Matched Playlist</p>
            <h4 className="font-semibold text-white">{playlist.title}</h4>
          </div>
          <Waveform />
        </div>
        <a href={`https://open.spotify.com/playlist/${playlist.spotifyId}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold py-2 px-4 rounded-full bg-[#1db954] text-black">
          <ExternalLink size={13} /> Open in Spotify
        </a>
      </div>

      {/* Artists */}
      <div>
        <h4 className="font-semibold text-white text-sm mb-2">Artist Recommendations</h4>
        <div className="flex gap-3">
          {respArtists.map((a) => (
            <div key={a.id} className="flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/10 pr-4">
              <img src={a.image} className="w-9 h-9 rounded-full object-cover" alt="" />
              <div><p className="text-sm text-white">{a.name}</p><p className="text-[11px] text-zinc-500">{a.genre}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand products */}
      <div>
        <h4 className="font-semibold text-white text-sm mb-2">Food Brand Picks</h4>
        <div className="grid grid-cols-2 gap-2">
          {resp.brandProducts.map((b) => (
            <div key={b.name} className="rounded-xl bg-white/[0.04] border border-white/10 p-3 flex items-center justify-between">
              <div><p className="text-sm text-white">{b.name}</p><p className="text-[11px] text-zinc-500">{b.brand}</p></div>
              <span className="text-amber-400 font-bold text-sm">{money(b.price)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kitchen+ */}
      <div>
        <h4 className="font-semibold text-white text-sm mb-2">Kitchen+ Tools</h4>
        <div className="grid grid-cols-2 gap-2">
          {respKitchen.map((k) => (
            <div onClick={() => navigate("kitchen")} key={k.id} className="rounded-xl bg-white/[0.04] border border-white/10 p-2 flex items-center gap-2 cursor-pointer hover:border-amber-500/40">
              <img src={k.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
              <div><p className="text-xs text-white leading-tight">{k.name}</p><p className="text-xs text-amber-400 font-bold">{money(k.price)}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost summary */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 to-emerald-500/10 border border-amber-500/20 p-4 grid grid-cols-3 gap-2 text-center">
        <div><p className="text-[11px] text-zinc-400">Meal Cost</p><p className="text-xl font-black text-white">{money(resp.cost.mealCost)}</p></div>
        <div><p className="text-[11px] text-zinc-400">You Save</p><p className="text-xl font-black text-emerald-400">{money(resp.cost.savings)}</p></div>
        <div><p className="text-[11px] text-zinc-400">Per Serving</p><p className="text-xl font-black text-amber-400">{money(resp.cost.perServing)}</p></div>
      </div>
    </div>
  );
};

type MockIngredient = { name: string; qty: string };
type MockAiResponse = {
  title: string;
  description: string;
  ingredients: MockIngredient[];
  steps: string[];
  estimatedCost: number;
  costPerServing: number;
  servings: number;
  playlistId: string;
  couponIds: string[];
  toolIds: string[];
};

type Msg = { role: "user" | "ai"; text?: string; resp?: ConciergeResponse; response?: MockAiResponse };

const buildMockResponse = (text: string): MockAiResponse | null => {
  const normalized = text.toLowerCase();
  const hasCoreIngredients = normalized.includes("chicken") && normalized.includes("rice") && normalized.includes("broccoli");

  if (!hasCoreIngredients) return null;

  return {
    title: "Garlic Chicken Rice Broccoli Skillet",
    description: "A fast, flavor-packed one-pan dinner that turns pantry staples into a comforting weeknight meal for 4 people.",
    ingredients: [
      { name: "Chicken thighs", qty: "1.25 lb" },
      { name: "Brown rice", qty: "1 cup" },
      { name: "Broccoli florets", qty: "2 cups" },
      { name: "Garlic", qty: "3 cloves" },
      { name: "Soy sauce", qty: "3 tbsp" },
      { name: "Sesame oil", qty: "1 tbsp" },
      { name: "Green onion", qty: "1 bunch" },
    ],
    steps: [
      "Sear the chicken in a hot skillet until golden and fully cooked, then remove it to a plate.",
      "Add the rice, garlic, and a splash of water to the same pan and let it soften and absorb the flavor.",
      "Toss in the broccoli and cook until bright and just tender.",
      "Return the chicken to the pan, add soy sauce and sesame oil, and stir until glossy and fragrant.",
      "Finish with chopped green onion and serve hot for a quick, balanced meal.",
    ],
    estimatedCost: 13.82,
    costPerServing: 3.46,
    servings: 4,
    playlistId: "pl12",
    couponIds: ["c2", "c6"],
    toolIds: ["k4", "k8"],
  };
};

const MockResponseStack: React.FC<{ response: MockAiResponse }> = ({ response }) => {
  const { navigate } = useApp();
  const playlist = playlists.find((p) => p.id === response.playlistId)!;
  const respCoupons = coupons.filter((c) => response.couponIds.includes(c.id));
  const respTools = products.filter((p) => response.toolIds.includes(p.id));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-white/[0.03] to-emerald-500/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-400 font-semibold">Foody Music AI</p>
            <h3 className="mt-2 text-xl font-black text-white">{response.title}</h3>
            <p className="mt-2 text-sm text-zinc-300">{response.description}</p>
          </div>
          <Badge kind="Sponsored" className="shrink-0" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-black/20 border border-white/10 px-3 py-2">
            <p className="text-[11px] text-zinc-400">Estimated cost</p>
            <p className="text-sm font-bold text-white">${response.estimatedCost.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-black/20 border border-white/10 px-3 py-2">
            <p className="text-[11px] text-zinc-400">Per serving</p>
            <p className="text-sm font-bold text-amber-400">${response.costPerServing.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-black/20 border border-white/10 px-3 py-2">
            <p className="text-[11px] text-zinc-400">Servings</p>
            <p className="text-sm font-bold text-emerald-400">{response.servings}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white">Ingredients</h4>
            <span className="text-xs text-zinc-500">Local pantry match</span>
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

        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-white/[0.03] border border-emerald-500/20 p-4">
          <h4 className="font-semibold text-white">Why this fits</h4>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            <li>• Uses what you already have and keeps the spend under budget.</li>
            <li>• Balanced, fast, and easy to scale for leftovers.</li>
            <li>• Pairs naturally with a mood-matching playlist and savings.</li>
          </ul>
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
        <h4 className="font-semibold text-white">Step-by-step cooking</h4>
        <ol className="mt-3 space-y-2">
          {response.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-zinc-300">
              <span className="w-6 h-6 shrink-0 rounded-full bg-amber-500/20 text-amber-300 text-xs flex items-center justify-center font-bold">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-[#1db954]/20 bg-gradient-to-br from-[#1db954]/10 to-white/[0.03] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#1db954] font-semibold">Suggested Spotify playlist</p>
            <h4 className="mt-1 font-semibold text-white">{playlist.title}</h4>
          </div>
          <Waveform />
        </div>
        <div className="mt-3">
          <PlaylistCard playlist={playlist} compact />
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-white text-sm mb-2">Grocery coupon suggestions</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {respCoupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-white text-sm mb-2">Kitchen+ recommended tools</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {respTools.map((tool) => (
            <div key={tool.id} onClick={() => navigate("kitchen")} className="cursor-pointer">
              <ProductCard product={tool} />
            </div>
          ))}
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

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const mock = buildMockResponse(text);
      if (mock) {
        setMessages((m) => [...m, { role: "ai", response: mock }]);
      } else {
        const resp = conciergeResponses[text] || Object.values(conciergeResponses)[0];
        setMessages((m) => [...m, { role: "ai", resp }]);
      }
      setTyping(false);
    }, 900);
  };

  const empty = messages.length === 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col min-h-[calc(100vh-3.5rem)]">
      {empty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
          <ForkClef size={64} />
          <h1 className="text-3xl font-black text-white mt-4">How can I help you cook today?</h1>
          <p className="text-zinc-400 mt-2">Tell me what you're craving, who you're feeding, or what's in your fridge.</p>
          <div className="grid sm:grid-cols-2 gap-3 mt-8 w-full">
            {suggestedPrompts.map((p) => (
              <button key={p} onClick={() => send(p)} className="text-left text-sm rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-500/40 px-4 py-3 text-zinc-200 transition flex items-center gap-2">
                <Sparkles size={15} className="text-amber-400 shrink-0" /> {p}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-6 pb-4">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="bg-amber-500 text-black rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%] font-medium text-sm">{m.text}</div>
              </div>
            ) : (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center"><Sparkles size={16} className="text-black" /></div>
                <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-2xl rounded-tl-sm p-4">
                  {m.response ? <MockResponseStack response={m.response} /> : m.resp ? <ResponseStack resp={m.resp} /> : null}
                </div>
              </div>
            )
          )}
          {typing && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center"><Sparkles size={16} className="text-black" /></div>
              <div className="flex gap-1">{[0, 1, 2].map((d) => <span key={d} className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: `${d * 150}ms` }} />)}</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {/* Input */}
      <div className="sticky bottom-16 lg:bottom-4 bg-[#0a0a0b] pt-2">
        {!empty && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {suggestedPrompts.map((p) => (
              <button key={p} onClick={() => send(p)} className="shrink-0 text-xs rounded-full bg-white/[0.05] border border-white/10 px-3 py-1.5 text-zinc-300 hover:border-amber-500/40">{p}</button>
            ))}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/15 focus-within:border-amber-500/50 px-4 py-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Try: I have chicken, rice, and broccoli. What can I cook for under $15?" className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-zinc-500" />
          <button type="submit" className="w-9 h-9 rounded-full bg-amber-500 text-black flex items-center justify-center hover:bg-amber-400 transition"><Send size={16} /></button>
        </form>
      </div>
    </div>
  );
};
