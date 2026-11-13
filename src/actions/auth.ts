"use server";

import { redirect } from "next/navigation";

import {
  clearPlayerCookie,
  clearSessionCookies,
  setPlayerCookie,
  setSiteAccessCookie,
} from "@/lib/session/cookies";
import { getDict } from "@/lib/i18n/server";
import { isPlayerSlug } from "@/lib/session/types";
import { verifySitePassword } from "@/lib/site-access";

export type PasswordGateState =
  | { ok: true }
  | { ok: false; message: string };

export async function verifySitePasswordAction(
  _prev: PasswordGateState | undefined,
  formData: FormData,
): Promise<PasswordGateState> {
  const password = String(formData.get("password") ?? "");
  if (!verifySitePassword(password)) {
    const { t } = await getDict();
    return { ok: false, message: t.auth.wrongPassword };
  }
  await setSiteAccessCookie();
  redirect("/sign-in?step=player");
}

export async function selectPlayerFormAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  if (!isPlayerSlug(slug)) {
    redirect("/sign-in?step=player");
  }
  await setPlayerCookie(slug);
  redirect("/");
}

export async function signOutAction(): Promise<void> {
  await clearSessionCookies();
  redirect("/sign-in?step=gate");
}

export async function switchPlayerAction(): Promise<void> {
  await clearPlayerCookie();
  redirect("/sign-in?step=player");
}
