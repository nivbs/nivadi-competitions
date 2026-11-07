import { redirect } from "next/navigation";

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
  if (requested === "player" && siteOk) {
    return "player";
  }
  if (requested === "gate") {
    return "gate";
  }
  return siteOk ? "player" : "gate";
}

export const instant = false;

export default async function SignInPage({ searchParams }: PageProps) {
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
