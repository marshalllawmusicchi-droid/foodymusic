import React from "react";
import { PageSection } from "@/components/ui/PageSection";

const RecipesPage: React.FC = () => (
  <PageSection title="Recipes" eyebrow="Content library" description="Search, filter, and browse recipes with future AI and database-backed recommendations.">
    <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-zinc-300">
      Recipe discovery experience coming soon.
    </div>
  </PageSection>
);

export default RecipesPage;
