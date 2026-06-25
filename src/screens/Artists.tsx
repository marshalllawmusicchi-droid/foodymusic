import React from "react";
import { Page, Section } from "../components/ui/common";
import { ArtistCard } from "../components/Cards";
import { artists } from "../data/seed";

export const Artists: React.FC = () => (
  <Page>
    <Section title="Artists" sub="Follow your favorites and stream on Spotify. Promoted artists are clearly labeled.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
      </div>
    </Section>
  </Page>
);
