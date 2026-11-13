import type { ReactNode } from "react";
import Link from "next/link";

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
    <div className="relative flex min-h-svh flex-col bg-[var(--color-canvas)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--color-ink)]">
              {t.app.name}
            </span>
            <span className="text-xs text-[var(--color-ink-muted)]">{t.app.game}</span>
          </div>
          <div className="flex items-center gap-3">
            <nav className="hidden gap-3 text-sm font-medium sm:flex">
              {desktopNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-2 py-1 text-[var(--color-ink-muted)] transition hover:bg-[var(--color-border)]/40 hover:text-[var(--color-ink)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <LanguageSwitcher />
            <UserMenu playerSlug={playerSlug} />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 pb-24">{children}</main>

      <MobileNav items={navItems} />
    </div>
  );
}
