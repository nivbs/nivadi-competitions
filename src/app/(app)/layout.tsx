import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { SheshBeshIntroLoader } from "@/components/intro/SheshBeshIntroLoader";
import { AppShell } from "@/components/shell/AppShell";
import { getPlayerSlugFromSession } from "@/lib/session/player";

export const instant = false;

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  const playerSlug = await getPlayerSlugFromSession();
  if (!playerSlug) {
    redirect("/sign-in?step=player");
  }

  return (
    <>
      <SheshBeshIntroLoader />
      <AppShell playerSlug={playerSlug}>{children}</AppShell>
    </>
  );
}
