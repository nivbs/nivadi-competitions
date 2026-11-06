"use client";

import { UserButton } from "@clerk/nextjs";

export function UserMenu() {
  return (
    <div className="shrink-0">
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: "h-9 w-9 ring-2 ring-[var(--color-border-strong)]",
          },
        }}
      />
    </div>
  );
}
