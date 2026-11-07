import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/AppShell";
import { getPlayerSlugFromSession } from "@/lib/session/player";

export async function AuthenticatedShell({ children }: { children: ReactNode }) {
  const playerSlug = await getPlayerSlugFromSession();
  if (!playerSlug) {
    redirect("/sign-in?step=player");
  }

  return <AppShell playerSlug={playerSlug}>{children}</AppShell>;
}
