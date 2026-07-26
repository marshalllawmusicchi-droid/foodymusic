import React, { useEffect, useMemo, useState } from "react";
import { BookPlus, Check, Loader2, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { listCookbooks, addRecipeToCookbook, getCookbook } from "@/services/cookbook";
import { snapshotFromConcierge } from "@/services/cookbookRecipe";
import type { ConciergeRecommendation } from "@/services/concierge";
import type { Cookbook, CookbookSection } from "@/types/cookbook";
import { useRecipeImage } from "@/hooks/useRecipeImage";

type AddToCookbookButtonProps = {
  recipe: ConciergeRecommendation;
};

export const AddToCookbookButton: React.FC<AddToCookbookButtonProps> = ({ recipe }) => {
  const { user, authReady, navigate } = useApp();
  const enabled = recipe.matchFound && recipe.source === "openai";
  const { imageUrl } = useRecipeImage(recipe, enabled);
  const [open, setOpen] = useState(false);
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [sections, setSections] = useState<CookbookSection[]>([]);
  const [selectedCookbookId, setSelectedCookbookId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const snapshot = useMemo(
    () => snapshotFromConcierge(recipe, imageUrl || recipe.image),
    [recipe, imageUrl],
  );

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    setError("");
    listCookbooks(user.id)
      .then((items) => {
        setCookbooks(items);
        if (items[0]) setSelectedCookbookId(items[0].id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load cookbooks."))
      .finally(() => setLoading(false));
  }, [open, user]);

  useEffect(() => {
    if (!selectedCookbookId) {
      setSections([]);
      return;
    }
    getCookbook(selectedCookbookId)
      .then((book) => setSections(book?.sections ?? []))
      .catch(() => setSections([]));
  }, [selectedCookbookId]);

  useEffect(() => {
    if (sections[0]) setSelectedSectionId(sections[0].id);
  }, [sections]);

  if (!recipe.matchFound) return null;

  const handleSave = async () => {
    if (!user || !selectedCookbookId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const book = await getCookbook(selectedCookbookId);
      const sortOrder = book?.recipes.length ?? 0;
      await addRecipeToCookbook({
        cookbookId: selectedCookbookId,
        sectionId: selectedSectionId || null,
        snapshot,
        personalNotes,
        sortOrder,
      });
      setSuccess(`Added to ${book?.title ?? "cookbook"}.`);
      setTimeout(() => setOpen(false), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add recipe.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!authReady) return;
          if (!user) {
            navigate("profile");
            return;
          }
          setOpen(true);
          setSuccess("");
          setError("");
        }}
        className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/25"
      >
        <BookPlus size={16} /> Add to Cookbook
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400">Cookbook Builder</p>
                <h3 className="mt-1 text-lg font-bold text-white">Save this recipe</h3>
                <p className="mt-1 text-sm text-zinc-400">{recipe.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-white/10 p-2 text-zinc-300 hover:bg-white/20"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {loading ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
                <Loader2 size={16} className="animate-spin" /> Loading cookbooks…
              </div>
            ) : cookbooks.length === 0 ? (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-zinc-400">Create a cookbook first, then come back to save recipes.</p>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("cookbooks");
                  }}
                  className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black"
                >
                  Go to My Cookbooks
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <label className="block text-sm">
                  <span className="text-zinc-400">Cookbook</span>
                  <select
                    value={selectedCookbookId}
                    onChange={(e) => setSelectedCookbookId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
                  >
                    {cookbooks.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="text-zinc-400">Section</span>
                  <select
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
                  >
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="text-zinc-400">Personal notes (optional)</span>
                  <textarea
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    rows={3}
                    placeholder="Family tweaks, serving tips, playlist pairing…"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-500/50"
                  />
                </label>

                {error && <p className="text-sm text-rose-400">{error}</p>}
                {success && (
                  <p className="flex items-center gap-2 text-sm text-emerald-400">
                    <Check size={16} /> {success}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    Save recipe
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export const getAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};
