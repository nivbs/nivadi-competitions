"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/lib/i18n/client";

export type NavItem = { href: string; label: string };

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav
      data-shake
      className="fixed inset-x-0 bottom-0 z-40 wood border-t border-[var(--color-gold)]/70 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-4px_12px_rgb(0_0_0/0.35)] sm:hidden"
      aria-label={t.nav.label}
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
                    ? "text-[var(--color-gold)]"
                    : "text-[var(--color-cream-muted)]"
                }`}
              >
                <span className="text-center">{item.label}</span>
                <span
                  className={`mt-1 h-0 w-0 border-x-[7px] border-b-[7px] border-x-transparent ${
                    active ? "border-b-[var(--color-gold)]" : "border-b-transparent"
                  }`}
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
