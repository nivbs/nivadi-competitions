export type PlayerSlug = "niv" | "gilad";

export function getPlayerSlugForClerkUser(
  clerkUserId: string | undefined,
): PlayerSlug | null {
  if (!clerkUserId) {
    return null;
  }
  if (clerkUserId === process.env.NIV_CLERK_USER_ID) {
    return "niv";
  }
  if (clerkUserId === process.env.GILAD_CLERK_USER_ID) {
    return "gilad";
  }
  return null;
}

export function assertEnvPlayerMapping(): void {
  if (!process.env.NIV_CLERK_USER_ID || !process.env.GILAD_CLERK_USER_ID) {
    throw new Error(
      "Set NIV_CLERK_USER_ID and GILAD_CLERK_USER_ID in the environment (see .env.example).",
    );
  }
}
