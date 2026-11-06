import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export const instant = false;

export default function SignInPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <p className="mb-6 text-center text-lg font-semibold text-[var(--color-ink)]">
        ניב וגלעד — התחברות
      </p>
      <Suspense fallback={<div className="h-[420px] w-full max-w-sm animate-pulse rounded-lg bg-[var(--color-surface)]" />}>
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-in" />
      </Suspense>
    </div>
  );
}
