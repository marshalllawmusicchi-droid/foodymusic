import React from "react";
import { PageSection } from "@/components/ui/PageSection";

const ProfilePage: React.FC = () => (
  <PageSection title="Profile" eyebrow="Account center" description="Manage saved recipes, shopping preferences, dietary needs, and account details.">
    <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-zinc-300">
      Profile experience coming soon.
    </div>
  </PageSection>
);

export default ProfilePage;
