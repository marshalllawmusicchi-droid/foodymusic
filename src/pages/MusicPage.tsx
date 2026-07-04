import React from "react";
import { PageSection } from "@/components/ui/PageSection";

const MusicPage: React.FC = () => (
  <PageSection title="Spotify Music" eyebrow="Mood-based audio" description="Discover playlists that match your meal plan, mood, and cooking rhythm.">
    <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-zinc-300">
      Spotify music experience coming soon.
    </div>
  </PageSection>
);

export default MusicPage;
