import { redirect } from "next/navigation";
import { Suspense } from "react";

import { PlayerPicker } from "@/components/auth/PlayerPicker";
import { SignInScreen } from "@/components/auth/SignInScreen";
import { SitePasswordForm } from "@/components/auth/SitePasswordForm";
import type { SignInStep } from "@/components/auth/types";
import {
  getPlayerSlugFromCookies,
  hasSiteAccessFromCookies,
} from "@/lib/session/cookies";

type PageProps = {
  searchParams: Promise<{ step?: string }>;
};

function resolveStep(
  requested: string | undefined,
  siteOk: boolean,
  playerOk: boolean,
): SignInStep {
  if (playerOk) {
    redirect("/");
  }
  if (!siteOk) {
    return "gate";
  }
  if (requested === "gate") {
    return siteOk ? "player" : "gate";
  }
  return "player";
}

function SignInFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="h-10 w-48 animate-pulse rounded-md bg-[var(--color-border)]/50" />
    </div>
  );
}

export default function SignInPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SignInPageContent({ searchParams }: PageProps) {
  const { step: stepParam } = await searchParams;
  const siteOk = await hasSiteAccessFromCookies();
  const playerSlug = await getPlayerSlugFromCookies();
  const step = resolveStep(stepParam, siteOk, playerSlug !== null);

  return (
    <SignInScreen step={step}>
      {step === "gate" ? <SitePasswordForm /> : <PlayerPicker />}
    </SignInScreen>
  );
}
