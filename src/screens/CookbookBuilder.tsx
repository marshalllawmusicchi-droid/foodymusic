import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Download,
  Eye,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Page } from "@/components/ui/common";
import { CookbookPreview } from "@/components/cookbook/CookbookPreview";
import { getAccessToken } from "@/components/cookbook/AddToCookbookButton";
import { useApp } from "@/context/AppContext";
import {
  addCookbookSection,
  deleteCookbookRecipe,
  deleteCookbookSection,
  exportCookbookPdf,
  getCookbook,
  reorderCookbookRecipes,
  updateCookbook,
  updateCookbookRecipe,
} from "@/services/cookbook";
import type { CookbookInput, CookbookPrivacy, CookbookWithContents } from "@/types/cookbook";

type CookbookBuilderProps = {
  cookbookId: string;
};

const inputClass =
  "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50";

export const CookbookBuilder: React.FC<CookbookBuilderProps> = ({ cookbookId }) => {
  const { user, navigate } = useApp();
  const [book, setBook] = useState<CookbookWithContents | null>(null);
  const [form, setForm] = useState<CookbookInput>({ title: "", privacy: "private" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCookbook(cookbookId);
      if (!data) {
        setError("Cookbook not found.");
        setBook(null);
        return;
      }
      if (user && data.userId !== user.id) {
        setError("You can only edit your own cookbooks.");
        setBook(null);
        return;
      }
      setBook(data);
      setForm({
        title: data.title,
        subtitle: data.subtitle,
        authorName: data.authorName,
        description: data.description,
        coverImage: data.coverImage,
        dedication: data.dedication,
        privacy: data.privacy,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load cookbook.");
    } finally {
      setLoading(false);
    }
  }, [cookbookId, user]);

  useEffect(() => {
    load();
  }, [load]);

  const recipesBySection = useMemo(() => {
    if (!book) return [];
    return book.sections.map((section) => ({
      section,
      recipes: book.recipes.filter((recipe) => recipe.sectionId === section.id),
    }));
  }, [book]);

  const handleSaveMeta = async () => {
    if (!user || !book) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateCookbook(book.id, user.id, form);
      setBook((current) => (current ? { ...current, ...updated } : current));
      setMessage("Cookbook saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save cookbook.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!book || !newSectionTitle.trim()) return;
    try {
      const section = await addCookbookSection(book.id, newSectionTitle, book.sections.length);
      setBook((current) =>
        current ? { ...current, sections: [...current.sections, section] } : current,
      );
      setNewSectionTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add section.");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!book) return;
    if (!window.confirm("Delete this section? Recipes will remain but lose their section.")) return;
    try {
      await deleteCookbookSection(sectionId);
      setBook((current) =>
        current
          ? {
              ...current,
              sections: current.sections.filter((section) => section.id !== sectionId),
              recipes: current.recipes.map((recipe) =>
                recipe.sectionId === sectionId ? { ...recipe, sectionId: null } : recipe,
              ),
            }
          : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete section.");
    }
  };

  const moveRecipe = async (sectionId: string | null, recipeId: string, direction: "up" | "down") => {
    if (!book) return;
    const sectionRecipes = book.recipes
      .filter((recipe) => recipe.sectionId === sectionId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sectionRecipes.findIndex((recipe) => recipe.id === recipeId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= sectionRecipes.length) return;

    const reorderedSection = [...sectionRecipes];
    [reorderedSection[index], reorderedSection[targetIndex]] = [
      reorderedSection[targetIndex],
      reorderedSection[index],
    ];

    const recipesBySectionId = new Map<string | null, CookbookRecipe[]>();
    book.sections.forEach((section) => {
      recipesBySectionId.set(
        section.id,
        section.id === sectionId
          ? reorderedSection
          : book.recipes
              .filter((recipe) => recipe.sectionId === section.id)
              .sort((a, b) => a.sortOrder - b.sortOrder),
      );
    });

    const unsectioned = book.recipes
      .filter((recipe) => !recipe.sectionId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    if (sectionId === null) {
      const nullIndex = unsectioned.findIndex((recipe) => recipe.id === recipeId);
      const nullTarget = direction === "up" ? nullIndex - 1 : nullIndex + 1;
      if (nullIndex >= 0 && nullTarget >= 0 && nullTarget < unsectioned.length) {
        [unsectioned[nullIndex], unsectioned[nullTarget]] = [unsectioned[nullTarget], unsectioned[nullIndex]];
      }
    }
    recipesBySectionId.set(null, unsectioned);

    let sortOrder = 0;
    const nextRecipes: CookbookRecipe[] = [];
    book.sections.forEach((section) => {
      (recipesBySectionId.get(section.id) ?? []).forEach((recipe) => {
        nextRecipes.push({ ...recipe, sortOrder: sortOrder++ });
      });
    });
    (recipesBySectionId.get(null) ?? []).forEach((recipe) => {
      nextRecipes.push({ ...recipe, sortOrder: sortOrder++ });
    });

    try {
      await reorderCookbookRecipes(nextRecipes.map((recipe) => recipe.id));
      setBook((current) => (current ? { ...current, recipes: nextRecipes } : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reorder recipes.");
    }
  };

  const handleSectionChange = async (recipeId: string, sectionId: string) => {
    try {
      const updated = await updateCookbookRecipe(recipeId, { sectionId });
      setBook((current) =>
        current
          ? {
              ...current,
              recipes: current.recipes.map((recipe) => (recipe.id === recipeId ? updated : recipe)),
            }
          : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to move recipe.");
    }
  };

  const handleNotesChange = async (recipeId: string, personalNotes: string) => {
    try {
      const updated = await updateCookbookRecipe(recipeId, { personalNotes });
      setBook((current) =>
        current
          ? {
              ...current,
              recipes: current.recipes.map((recipe) => (recipe.id === recipeId ? updated : recipe)),
            }
          : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save notes.");
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!book) return;
    if (!window.confirm("Remove this recipe from the cookbook?")) return;
    try {
      await deleteCookbookRecipe(recipeId);
      setBook((current) =>
        current ? { ...current, recipes: current.recipes.filter((recipe) => recipe.id !== recipeId) } : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete recipe.");
    }
  };

  const handleExport = async () => {
    if (!book) return;
    setExporting(true);
    setError("");
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Sign in again to export your cookbook.");
      const blob = await exportCookbookPdf(book.id, token);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${book.title.replace(/[^\w\s-]/g, "").trim() || "cookbook"}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to export PDF.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Page>
        <div className="flex items-center gap-2 text-zinc-400">
          <Loader2 size={18} className="animate-spin" /> Loading cookbook…
        </div>
      </Page>
    );
  }

  if (!book) {
    return (
      <Page>
        <button
          type="button"
          onClick={() => navigate("cookbooks")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400"
        >
          <ArrowLeft size={16} /> Back to My Cookbooks
        </button>
        <p className="text-rose-400">{error || "Cookbook unavailable."}</p>
      </Page>
    );
  }

  return (
    <Page>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("cookbooks")}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400"
        >
          <ArrowLeft size={16} /> My Cookbooks
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab(tab === "edit" ? "preview" : "edit")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200"
          >
            <Eye size={16} /> {tab === "edit" ? "Preview" : "Edit"}
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export PDF
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-rose-400">{error}</p>}
      {message && <p className="mb-4 text-sm text-emerald-400">{message}</p>}

      {tab === "preview" ? (
        <CookbookPreview cookbook={book} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-lg font-bold text-white">Cookbook details</h2>
              <div className="mt-4 space-y-3">
                <label className="block text-sm">
                  <span className="text-zinc-400">Title</span>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-zinc-400">Subtitle</span>
                  <input
                    value={form.subtitle ?? ""}
                    onChange={(e) => setForm((current) => ({ ...current, subtitle: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-zinc-400">Author name</span>
                  <input
                    value={form.authorName ?? ""}
                    onChange={(e) => setForm((current) => ({ ...current, authorName: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-zinc-400">Description</span>
                  <textarea
                    value={form.description ?? ""}
                    onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                    rows={3}
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-zinc-400">Cover image URL</span>
                  <input
                    value={form.coverImage ?? ""}
                    onChange={(e) => setForm((current) => ({ ...current, coverImage: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-zinc-400">Dedication</span>
                  <textarea
                    value={form.dedication ?? ""}
                    onChange={(e) => setForm((current) => ({ ...current, dedication: e.target.value }))}
                    rows={3}
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-zinc-400">Privacy</span>
                  <select
                    value={form.privacy ?? "private"}
                    onChange={(e) =>
                      setForm((current) => ({ ...current, privacy: e.target.value as CookbookPrivacy }))
                    }
                    className={inputClass}
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </label>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveMeta}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save details
              </button>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-lg font-bold text-white">Sections</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {book.sections.map((section) => (
                  <span
                    key={section.id}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-300"
                  >
                    {section.title}
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-rose-400 hover:text-rose-300"
                      aria-label={`Delete ${section.title}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="Custom section name"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-200"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-lg font-bold text-white">Recipes</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Reorder recipes within each section. Add recipes from AI Concierge with Add to Cookbook.
            </p>

            <div className="mt-5 space-y-6">
              {recipesBySection.map(({ section, recipes }) => (
                <div key={section.id}>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">{section.title}</h3>
                  {recipes.length === 0 ? (
                    <p className="mt-2 text-sm text-zinc-500">No recipes in this section yet.</p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {recipes.map((recipe, index) => (
                        <article
                          key={recipe.id}
                          className="rounded-xl border border-white/10 bg-black/20 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h4 className="font-semibold text-white">{recipe.recipeSnapshot.title}</h4>
                              <p className="mt-1 text-xs text-zinc-500">
                                {recipe.recipeSnapshot.cuisine} · {recipe.recipeSnapshot.servings} servings
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => moveRecipe(section.id, recipe.id, "up")}
                                className="rounded-full bg-white/10 p-2 text-zinc-300 disabled:opacity-30"
                                aria-label="Move up"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={index === recipes.length - 1}
                                onClick={() => moveRecipe(section.id, recipe.id, "down")}
                                className="rounded-full bg-white/10 p-2 text-zinc-300 disabled:opacity-30"
                                aria-label="Move down"
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRecipe(recipe.id)}
                                className="rounded-full bg-rose-500/15 p-2 text-rose-400"
                                aria-label="Delete recipe"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <label className="mt-3 block text-xs">
                            <span className="text-zinc-500">Section</span>
                            <select
                              value={recipe.sectionId ?? ""}
                              onChange={(e) => handleSectionChange(recipe.id, e.target.value)}
                              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                            >
                              {book.sections.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.title}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="mt-3 block text-xs">
                            <span className="text-zinc-500">Personal notes</span>
                            <textarea
                              defaultValue={recipe.personalNotes}
                              onBlur={(e) => {
                                if (e.target.value !== recipe.personalNotes) {
                                  handleNotesChange(recipe.id, e.target.value);
                                }
                              }}
                              rows={2}
                              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                            />
                          </label>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </Page>
  );
};
