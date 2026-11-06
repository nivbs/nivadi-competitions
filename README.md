# ניב מול גלעד · שש בש

אתר לנייד (Next.js) לרישום תוצאות שש בש בין ניב לגלעד: ניקוד, זמן שעון (עד 6 דקות לכל שחקן), תאריך והערות — עם ניתוח מצטבר לאורך זמן.

## מה בתוך הפרויקט

- **Next.js 16** (App Router), TypeScript, Tailwind v4
- **Clerk** — התחברות (שני משתמשים)
- **Neon** — PostgreSQL serverless
- **Drizzle ORM** — סכמה ומיגרציות
- **GSAP** + `@gsap/react` — אנימציית פתיחה “שש בש” (קוביות 6 ו־5), עם כיבוי אוטומטי ב־`prefers-reduced-motion`

## הקמה מהירה

1. העתיקו `.env.example` ל־`.env.local` ומלאו:

   - `DATABASE_URL` — מחרוזת החיבור מ־[Neon](https://neon.tech)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` ו־`CLERK_SECRET_KEY` — מ־[Clerk](https://dashboard.clerk.com)
   - `NIV_CLERK_USER_ID` ו־`GILAD_CLERK_USER_ID` — מזהי משתמש מ-Clerk (Dashboard → Users)

2. החלת הסכמה על Neon:

   ```bash
   npm run db:push
   ```

3. Seed — שחקנים (ניב, גלעד) ותחרות “שש בש”:

   ```bash
   npm run db:seed
   ```

4. הרצה מקומית:

   ```bash
   npm run dev
   ```

5. **Vercel:** חברו את הריפו, הגדירו אותן משתני סביבה בדשבורד, והריצו `db:push` + `db:seed` מול מסד הייצור (או דרך SQL).

## סקריפטים

| סקריפט | תיאור |
|--------|--------|
| `npm run dev` | שרת פיתוח |
| `npm run build` | בנייה לייצור |
| `npm run lint` | ESLint |
| `npm run db:generate` | יצירת קבצי מיגרציה מ־`src/db/schema.ts` |
| `npm run db:push` | דחיפת הסכמה ל־DB (מתאים לפיתוח) |
| `npm run db:seed` | נתוני התחלה |
| `npm run db:studio` | Drizzle Studio |

## קבצי הקשר (Impeccable)

- [`PRODUCT.md`](PRODUCT.md) — אמת מוצר
- [`DESIGN.md`](DESIGN.md) — כיוון חזותי (ערב־שחמנואי, מובייל־פירסט)

A newer Impeccable (v4.8.0) is available; this project used the installed skill output from context. Update with `npx impeccable update` in a future session if you want.
