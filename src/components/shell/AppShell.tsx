import type { ReactNode } from "react";
import Link from "next/link";

import { DoublingCube } from "@/components/board/DoublingCube";
import { PointsRow } from "@/components/board/PointsRow";
import { LanguageSwitcher } from "@/components/shell/LanguageSwitcher";
import { MobileNav } from "@/components/shell/MobileNav";
import { UserMenu } from "@/components/shell/UserMenu";
import { getDict } from "@/lib/i18n/server";
import type { PlayerSlug } from "@/lib/session/types";

export async function AppShell({
  children,
  playerSlug,
}: {
  children: ReactNode;
  playerSlug: PlayerSlug;
}) {
  const { t } = await getDict();
  const navItems = [
    { href: "/", label: t.nav.home },
    { href: "/timer", label: t.nav.timer },
    { href: "/log", label: t.nav.log },
    { href: "/history", label: t.nav.history },
    { href: "/analysis", label: t.nav.analysis },
  ];
  // The timer is a phone-only feature: keep it out of the desktop header nav.
  const desktopNavItems = navItems.filter((i) => i.href !== "/timer");
  return (
    <div className="relative flex min-h-svh flex-col bg-[var(--color-walnut-deep)]">
      <header data-shake className="wood sticky top-0 z-30 h-[3.75rem] border-b border-[var(--color-gold)]/70 text-[var(--color-cream)] shadow-[0_4px_12px_rgb(0_0_0/0.35)]">
        <div className="mx-auto flex h-full max-w-4xl items-center justify-between gap-3 px-4 pb-1.5">
          <Link href="/" aria-label={t.app.name} className="flex min-w-0 items-center gap-2.5">
            <DoublingCube value={64} size={34} />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="hidden truncate font-display text-xl font-bold min-[440px]:block sm:hidden">{t.app.game}</span>
              <span className="hidden truncate font-display text-lg font-bold sm:block">{t.app.name}</span>
              <span className="hidden text-xs text-[var(--color-cream-muted)] sm:block">{t.app.game}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="hidden gap-1 text-sm font-medium sm:flex">
              {desktopNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-2.5 py-1 text-[var(--color-cream-muted)] transition hover:bg-white/10 hover:text-[var(--color-gold)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <LanguageSwitcher />
            <UserMenu playerSlug={playerSlug} />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <PointsRow height={6} flip />
        </div>
      </header>

      <main className="felt relative z-10 mx-auto w-full max-w-4xl flex-1 pb-24 shadow-[inset_0_8px_14px_-8px_rgb(0_0_0/0.35)] sm:border-x-[10px] sm:border-[var(--color-walnut-frame)]">
        {children}
      </main>

      <MobileNav items={navItems} />
    </div>
  );
}
