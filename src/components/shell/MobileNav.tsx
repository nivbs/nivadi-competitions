"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface-raised)]/98 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm sm:hidden"
      aria-label="ניווט ראשי"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between gap-1">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                className={`flex min-h-[44px] flex-col items-center justify-center rounded-lg px-1 py-1 text-[0.7rem] font-medium leading-tight transition ${
                  active
                    ? "text-[var(--color-brand)]"
                    : "text-[var(--color-ink-muted)]"
                }`}
              >
                <span className="text-center">{item.label}</span>
                {active ? (
                  <span
                    className="mt-1 h-0.5 w-8 rounded-full bg-[var(--color-brand)]"
                    aria-hidden
                  />
                ) : (
                  <span className="mt-1 h-0.5 w-8" aria-hidden />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
