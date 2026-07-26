import React from "react";
import type { CookbookRecipe, CookbookSection, CookbookWithContents } from "@/types/cookbook";

type CookbookPreviewProps = {
  cookbook: CookbookWithContents;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });

export const CookbookPreview: React.FC<CookbookPreviewProps> = ({ cookbook }) => {
  const recipesBySection = cookbook.sections.map((section) => ({
    section,
    recipes: cookbook.recipes.filter((recipe) => recipe.sectionId === section.id),
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <article className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-zinc-900 via-black to-amber-950/40 shadow-2xl">
        <div className="relative min-h-[420px] p-8 sm:p-12">
          {cookbook.coverImage ? (
            <img
              src={cookbook.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.25),_transparent_55%)]" />
          )}
          <div className="relative flex min-h-[340px] flex-col justify-end">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-300">Foody Music Cookbook</p>
            <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">{cookbook.title}</h1>
            {cookbook.subtitle && <p className="mt-3 text-lg text-zinc-300">{cookbook.subtitle}</p>}
            {cookbook.authorName && <p className="mt-6 text-sm uppercase tracking-[0.25em] text-zinc-400">by {cookbook.authorName}</p>}
            <p className="mt-8 text-xs text-zinc-500">Created {formatDate(cookbook.createdAt)} · Updated {formatDate(cookbook.updatedAt)}</p>
          </div>
        </div>
      </article>

      <article className="rounded-[24px] border border-white/10 bg-white/[0.03] p-8 sm:p-10">
        <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400">Dedication</p>
        <p className="mt-4 text-lg leading-8 text-zinc-200">
          {cookbook.dedication || "For everyone who cooks with heart, hunger, and a great playlist."}
        </p>
      </article>

      <article className="rounded-[24px] border border-white/10 bg-white/[0.03] p-8 sm:p-10">
        <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400">Table of Contents</p>
        <div className="mt-5 space-y-5">
          {recipesBySection.map(({ section, recipes }) =>
            recipes.length === 0 ? null : (
              <div key={section.id}>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">{section.title}</h3>
                <ul className="mt-2 space-y-1">
                  {recipes.map((recipe, index) => (
                    <li key={recipe.id} className="flex justify-between gap-4 text-sm text-zinc-300">
                      <span>{recipe.recipeSnapshot.title}</span>
                      <span className="text-zinc-500">{index + 1}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>
      </article>

      {recipesBySection.map(({ section, recipes }) =>
        recipes.length === 0 ? null : (
          <React.Fragment key={section.id}>
            <article className="rounded-[24px] border border-amber-500/20 bg-gradient-to-br from-amber-500/15 to-white/[0.03] px-8 py-16 text-center">
              <p className="text-[11px] uppercase tracking-[0.35em] text-amber-300">Section</p>
              <h2 className="mt-3 text-3xl font-black text-white">{section.title}</h2>
            </article>

            {recipes.map((recipe) => (
              <RecipePreviewPage key={recipe.id} recipe={recipe} section={section} />
            ))}
          </React.Fragment>
        ),
      )}
    </div>
  );
};

const RecipePreviewPage: React.FC<{ recipe: CookbookRecipe; section: CookbookSection }> = ({ recipe, section }) => {
  const snapshot = recipe.recipeSnapshot;

  return (
    <article className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
      {snapshot.image && (
        <img src={snapshot.image} alt={snapshot.title} className="h-56 w-full object-cover sm:h-72" />
      )}
      <div className="space-y-5 p-6 sm:p-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400">{section.title}</p>
          <h3 className="mt-2 text-2xl font-black text-white">{snapshot.title}</h3>
          <p className="mt-2 text-sm text-zinc-400">
            {snapshot.cuisine} · {snapshot.servings} servings · {snapshot.prepTime} min prep · {snapshot.cookTime} min cook
          </p>
        </div>

        <p className="text-sm leading-7 text-zinc-300">{snapshot.description}</p>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-amber-300">Ingredients</h4>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              {snapshot.ingredients.map((item) => (
                <li key={`${item.name}-${item.qty}`} className="flex justify-between gap-3 border-b border-white/5 pb-2">
                  <span>{item.name}</span>
                  <span className="text-zinc-500">{item.qty}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-amber-300">Instructions</h4>
            <ol className="mt-3 space-y-3 text-sm text-zinc-300">
              {snapshot.steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-300">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {recipe.personalNotes && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300">Personal Notes</p>
            <p className="mt-2 text-sm leading-6 text-zinc-200">{recipe.personalNotes}</p>
          </div>
        )}
      </div>
    </article>
  );
};
