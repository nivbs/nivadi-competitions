import type { ReactNode } from "react";
import Link from "next/link";

import { MobileNav } from "@/components/shell/MobileNav";
import { UserMenu } from "@/components/shell/UserMenu";

const navItems = [
  { href: "/", label: "בית" },
  { href: "/log", label: "רישום משחק" },
  { href: "/history", label: "היסטוריה" },
  { href: "/analysis", label: "ניתוח" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col bg-[var(--color-canvas)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--color-ink)]">
              ניב מול גלעד
            </span>
            <span className="text-xs text-[var(--color-ink-muted)]">שש בש</span>
          </div>
          <div className="flex items-center gap-3">
            <nav className="hidden gap-3 text-sm font-medium sm:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-2 py-1 text-[var(--color-ink-muted)] transition hover:bg-[var(--color-border)]/40 hover:text-[var(--color-ink)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 pb-24">{children}</main>

      <MobileNav items={navItems} />
    </div>
  );
}
