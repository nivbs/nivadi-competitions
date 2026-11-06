import { connection } from "next/server";

import { analyzeMatches, formatClock } from "@/lib/analysis";
import { getActiveCompetition, getPlayersBySlug, listMatchesForCompetition } from "@/lib/queries";

export default async function AnalysisPage() {
  await connection();

  if (!process.env.DATABASE_URL) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-[var(--color-ink-muted)]">
          חסר DATABASE_URL. העתיקו מ־‎.env.example ל־‎.env.local והתחברו ל-Neon.
        </p>
      </div>
    );
  }

  const competition = await getActiveCompetition();
  const playersBySlug = await getPlayersBySlug();
  const niv = playersBySlug.niv;
  const gilad = playersBySlug.gilad;

  if (!competition || !niv || !gilad) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-[var(--color-ink-muted)]">
          חסרות תחרות פעילה או שחקנים אותחלו. הריצו מיגרציה ו-seed לפי README.
        </p>
      </div>
    );
  }

  const matchRows = await listMatchesForCompetition(competition.id);
  const a = analyzeMatches(matchRows, {
    nivPlayerId: niv.id,
    giladPlayerId: gilad.id,
  });

  const streakText =
    a.currentStreakOwner && a.currentStreakLength > 0
      ? a.currentStreakOwner === "niv"
        ? `רצף נוכחי: ניב ${a.currentStreakLength} משחקים`
        : `רצף נוכחי: גלעד ${a.currentStreakLength} משחקים`
      : "אין רצף ניצחונות פעיל (או תיקו אחרון).";

  const paceText =
    a.matchesPerWeek !== null
      ? `קצב: כ-${a.matchesPerWeek.toFixed(1)} משחקים בשבוע (לפי טווח התאריכים).`
      : "קצב: צריך לפחות שני משחקים עם תאריכים שונים.";

  const timeAdv =
    a.averageTimeRemainingAdvantageSec !== null
      ? a.averageTimeRemainingAdvantageSec > 0
        ? `בממוצע ניב משאיר ${formatClock(Math.abs(Math.round(a.averageTimeRemainingAdvantageSec)))} יותר על השעון מגלעד (פחות זמן שנוצל).`
        : a.averageTimeRemainingAdvantageSec < 0
          ? `בממוצע גלעד משאיר ${formatClock(Math.abs(Math.round(a.averageTimeRemainingAdvantageSec)))} יותר על השעון מניב.`
          : "בממוצע שני הצדדים מסיימים עם אותו לחץ זמן יחסי."
      : "אין עדיין נתוני זמן מספיקים.";

  const burstLine = `שעון מלא (360ש׳): ניב ${a.nivBankBursts} · גלעד ${a.giladBankBursts}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
        ניתוח שש בש
      </h1>
      <p className="mt-2 max-w-prose text-[var(--color-ink-muted)]">
        ניתוח סביב טקטיקת זמן ותוצאות — כמו חישובים על לוח הבית: מי מקדים במירוץ אבל נשאר עם יותר זמן לנשימה.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">
            סה״כ משחקים
          </p>
          <p className="mt-2 font-mono text-4xl font-semibold tabular-nums text-[var(--color-ink)]" dir="ltr">
            {a.totalMatches}
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">
            תיקו
          </p>
          <p className="mt-2 font-mono text-4xl font-semibold tabular-nums text-[var(--color-ink)]" dir="ltr">
            {a.ties}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">
            הפרש נקודות ממוצע (נקודות ניב מול גלעד)
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[var(--color-ink)]" dir="ltr">
            {a.averageScoreDiffNiv !== null ? a.averageScoreDiffNiv.toFixed(2) : "—"}
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">
            ממוצע זמן שנוצל (ניב / גלעד)
          </p>
          <p className="mt-2 text-lg font-medium tabular-nums text-[var(--color-ink)]" dir="ltr">
            {a.nivAvgTimeUsedSec !== null ? formatClock(Math.round(a.nivAvgTimeUsedSec)) : "—"} ·{" "}
            {a.giladAvgTimeUsedSec !== null ? formatClock(Math.round(a.giladAvgTimeUsedSec)) : "—"}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm leading-relaxed text-[var(--color-ink-muted)] shadow-[var(--shadow-soft)]">
        <p>{streakText}</p>
        <p>{paceText}</p>
        <p>{timeAdv}</p>
        <p>{burstLine}</p>
      </div>
    </div>
  );
}
