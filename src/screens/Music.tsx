import React from "react";
import { Sparkles } from "lucide-react";
import { Page, Section } from "../components/ui/common";
import { PlaylistCard, ArtistCard } from "../components/Cards";
import { playlists, artists } from "../data/seed";

export const Music: React.FC = () => (
  <Page>
    <Section title="Music" sub="Spotify playlists matched to every cuisine and mood. Embeds & links only — we never host audio.">
      <div className="rounded-2xl bg-gradient-to-br from-[#1db954]/15 to-white/[0.03] border border-[#1db954]/20 p-5 mb-6 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[#1db954]/20 flex items-center justify-center shrink-0"><Sparkles size={18} className="text-[#1db954]" /></div>
        <div>
          <p className="font-semibold text-white text-sm">AI Curator Note</p>
          <p className="text-sm text-zinc-400 mt-0.5">Tonight's pick: pair your simmering sauces with "Italian Dinner" — soft jazz that slows the pace and warms the room.</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}
      </div>
    </Section>

    <Section title="Artist Spotlight" sub="Discover artists curated for your cooking sessions">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {artists.slice(0, 8).map((a) => <ArtistCard key={a.id} artist={a} />)}
      </div>
    </Section>
  </Page>
);
