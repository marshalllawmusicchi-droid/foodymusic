import React, { useCallback, useEffect, useState } from "react";
import { BookOpen, Loader2, Plus, Trash2 } from "lucide-react";
import { Page, Section } from "@/components/ui/common";
import { ForkClef } from "@/components/ui/Logo";
import { useApp } from "@/context/AppContext";
import { createCookbook, deleteCookbook, listCookbooks } from "@/services/cookbook";
import type { Cookbook } from "@/types/cookbook";

const AuthPrompt: React.FC = () => {
  const { navigate } = useApp();
  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <div className="flex justify-center mb-5"><ForkClef size={56} /></div>
      <h1 className="text-2xl font-black text-white">Sign in to build cookbooks</h1>
      <p className="text-zinc-400 mt-2">Save AI-generated recipes into beautifully organized personal cookbooks.</p>
      <button
        onClick={() => navigate("profile")}
        className="mt-6 rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-black"
      >
        Go to sign in
      </button>
    </div>
  );
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export const Cookbooks: React.FC = () => {
  const { user, authReady, navigate } = useApp();
  const [items, setItems] = useState<Cookbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      setItems(await listCookbooks(user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load cookbooks.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authReady && user) load();
    if (authReady && !user) setLoading(false);
  }, [authReady, user, load]);

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    setError("");
    try {
      const book = await createCookbook(user.id, {
        title: "Untitled Cookbook",
        subtitle: "Recipes from Foody Music",
        authorName: user.name,
        description: "A personal collection of AI-generated recipes.",
        privacy: "private",
      });
      navigate("cookbookDetail", book.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create cookbook.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (book: Cookbook) => {
    if (!user) return;
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    try {
      await deleteCookbook(book.id, user.id);
      setItems((current) => current.filter((item) => item.id !== book.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete cookbook.");
    }
  };

  if (!authReady || loading) {
    return (
      <Page>
        <div className="flex items-center gap-2 text-zinc-400">
          <Loader2 size={18} className="animate-spin" /> Loading cookbooks…
        </div>
      </Page>
    );
  }

  if (!user) {
    return (
      <Page>
        <AuthPrompt />
      </Page>
    );
  }

  return (
    <Page>
      <Section
        title="My Cookbooks"
        sub="Create, organize, and export your Foody Music recipe collections."
        action={
          <button
            type="button"
            disabled={creating}
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            New cookbook
          </button>
        }
      >
        {error && <p className="mb-4 text-sm text-rose-400">{error}</p>}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
            <BookOpen size={40} className="mx-auto text-amber-400" />
            <h3 className="mt-4 text-lg font-bold text-white">Your first cookbook awaits</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Generate a recipe in AI Concierge, tap Add to Cookbook, and start building your collection.
            </p>
            <button
              type="button"
              onClick={handleCreate}
              className="mt-5 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black"
            >
              Create cookbook
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((book) => (
              <article
                key={book.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-amber-500/30"
              >
                <button
                  type="button"
                  onClick={() => navigate("cookbookDetail", book.id)}
                  className="block w-full text-left"
                >
                  <div className="relative h-40 bg-gradient-to-br from-amber-500/20 via-black to-zinc-900">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt="" className="h-full w-full object-cover opacity-80" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen size={36} className="text-amber-300/70" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white">{book.title}</h3>
                        {book.subtitle && <p className="mt-1 text-sm text-zinc-400">{book.subtitle}</p>}
                      </div>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
                        {book.privacy}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-zinc-500">{book.description || "No description yet."}</p>
                    <p className="mt-3 text-xs text-zinc-600">Updated {formatDate(book.updatedAt)}</p>
                  </div>
                </button>
                <div className="border-t border-white/5 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(book)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>
    </Page>
  );
};
