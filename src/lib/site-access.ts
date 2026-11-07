import { timingSafeEqual } from "node:crypto";

const DEFAULT_SITE_PASSWORD = "GN110225";

function expectedPassword(): string {
  return process.env.SITE_ACCESS_PASSWORD ?? DEFAULT_SITE_PASSWORD;
}

export function verifySitePassword(input: string): boolean {
  const expected = expectedPassword();
  const a = Buffer.from(input, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
