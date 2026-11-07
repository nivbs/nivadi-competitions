type PgErrorLike = {
  code?: string;
  cause?: unknown;
};

function asPgError(error: unknown): PgErrorLike | null {
  if (!error || typeof error !== "object") {
    return null;
  }
  const e = error as PgErrorLike;
  if (typeof e.code === "string") {
    return e;
  }
  if (e.cause) {
    return asPgError(e.cause);
  }
  return null;
}

/** Postgres undefined_table / undefined_column and common Neon connection issues. */
export function isDatabaseSetupError(error: unknown): boolean {
  const pg = asPgError(error);
  if (!pg?.code) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      message.includes('relation "') && message.includes("does not exist") ||
      message.includes("NeonDbError")
    );
  }
  return (
    pg.code === "42P01" ||
    pg.code === "42703" ||
    pg.code === "3D000" ||
    pg.code === "08006" ||
    pg.code === "08001"
  );
}
