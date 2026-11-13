import { revalidatePath } from "next/cache";

import { closeIdleSessions } from "@/lib/sessions/close-idle";

/**
 * Vercel Cron: every 10 minutes (see vercel.json).
 * Set CRON_SECRET in the project; Vercel sends `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ ok: false, error: "CRON_SECRET not configured" }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await closeIdleSessions();
    for (const p of ["/", "/history", "/analysis", "/timer"]) {
      revalidatePath(p);
    }
    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron close-idle-sessions]", error);
    return Response.json({ ok: false, error: "close_failed" }, { status: 500 });
  }
}
