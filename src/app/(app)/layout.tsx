import type { ReactNode } from "react";
import { Suspense } from "react";

import { SheshBeshIntroLoader } from "@/components/intro/SheshBeshIntroLoader";
import { AuthenticatedShell } from "@/components/shell/AuthenticatedShell";
import AppLoading from "@/app/(app)/loading";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SheshBeshIntroLoader />
      <Suspense fallback={<AppLoading />}>
        <AuthenticatedShell>{children}</AuthenticatedShell>
      </Suspense>
    </>
  );
}
