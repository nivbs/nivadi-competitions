import type { ReactNode } from "react";

import { SheshBeshIntroLoader } from "@/components/intro/SheshBeshIntroLoader";
import { AppShell } from "@/components/shell/AppShell";

export const instant = false;

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SheshBeshIntroLoader />
      <AppShell>{children}</AppShell>
    </>
  );
}
