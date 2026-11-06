import type { ReactNode } from "react";

import { AppShell } from "@/components/shell/AppShell";
import { SheshBeshIntro } from "@/components/intro/SheshBeshIntro";

export const instant = false;

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SheshBeshIntro />
      <AppShell>{children}</AppShell>
    </>
  );
}
