# ניב מול גלעד · שש בש

אתר לנייד (Next.js) לרישום תוצאות שש בש בין ניב לגלעד. סשן הוא כמה משחקים ברצף; לכל משחק מנצח וסוג ניצחון (רגיל 1, מארס 2, בק גמון 3) וזמן שעון. כולל טיימר דיגיטלי (זמן בסיס + דיליי, ברירת מחדל 6:00 + 12ש׳) עם כפתור כתר ״מנצח״ ששומר אוטומטית, עריכה ומחיקה, וניתוח מצטבר.

## מה בתוך הפרויקט

- **Next.js 16** (App Router), TypeScript, Tailwind v4
- **סיסמת אתר + בחירת שחקן** — כניסה פשוטה (ללא Clerk)
- **Neon** — PostgreSQL serverless
- **Drizzle ORM** — סכמה ומיגרציות
- **GSAP** + `@gsap/react` — אנימציית פתיחה “שש בש” (קוביות 6 ו־5), עם כיבוי אוטומטי ב־`prefers-reduced-motion`

## הקמה מהירה

1. העתיקו `.env.example` ל־`.env.local` ומלאו:

   - `DATABASE_URL` — מחרוזת החיבור מ־[Neon](https://neon.tech)
   - `SESSION_SECRET` — מפתח לחתימת עוגיות (למשל `openssl rand -base64 32`)

2. כניסה לאתר: סיסמת אתר (`GN110225` כברירת מחדל, או `SITE_ACCESS_PASSWORD`), ואז בחירה **ניב** או **גלעד**.

3. החלת הסכמה על Neon:

   ```bash
   npm run db:push
   ```

4. Seed — שחקנים (ניב, גלעד) ותחרות “שש בש”:

   ```bash
   npm run db:seed
   ```

5. הרצה מקומית:

   ```bash
   npm run db:apply-sessions   # פעם אחת אחרי עדכון קוד (מיגרציית sessions/games)
   npm run db:seed
   npm run dev
   ```

   פתחו **http://localhost:3000** — תופנו לכניסה (`/sign-in?step=gate`, סיסמת אתר ברירת מחדל `GN110225`, ואז בחירת ניב/גלעד).

6. **Vercel:** חברו את הריפו, הגדירו `DATABASE_URL` ו־`SESSION_SECRET` בדשבורד, והריצו `db:push` + `db:seed` מול מסד הייצור (או דרך SQL). הגדירו גם `CRON_SECRET` — קרון יומי (05:00 UTC, תואם מגבלות Hobby) סוגר סשנים פתוחים ללא משחק חדש מעל 15 דקות (`vercel.json` → `/api/cron/close-idle-sessions`).

## סקריפטים

| סקריפט | תיאור |
|--------|--------|
| `npm run dev` | שרת פיתוח |
| `npm run build` | בנייה לייצור |
| `npm run lint` | ESLint |
| `npm run db:generate` | יצירת קבצי מיגרציה מ־`src/db/schema.ts` |
| `npm run db:push` | דחיפת הסכמה ל־DB (מתאים לפיתוח) |
| `npm run db:seed` | נתוני התחלה |
| `npm test` | בדיקות יחידה (ניקוד, שעון, ניתוח) |
| `npm run db:studio` | Drizzle Studio |

## קבצי הקשר (Impeccable)

- [`PRODUCT.md`](PRODUCT.md) — אמת מוצר
- [`DESIGN.md`](DESIGN.md) — כיוון חזותי (ערב־שחמנואי, מובייל־פירסט)

A newer Impeccable (v4.8.0) is available; this project used the installed skill output from context. Update with `npx impeccable update` in a future session if you want.

## מעבר לסשנים (חד־פעמי)

המיגרציה `0002_sessions_and_games` מוחקת את הטבלה הישנה `matches` ויוצרת `sessions` ו־`games`. **צרו גיבוי / ענף Neon לפני** הרצת `npm run db:push` על הייצור, ואז הזינו מחדש את המשחקים הישנים דרך `/log` (סימון מארס לפי הצורך).
