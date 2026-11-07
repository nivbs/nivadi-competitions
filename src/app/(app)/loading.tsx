export default function AppLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-4 px-4 py-6 sm:py-10">
      <div className="h-8 w-40 rounded-md bg-[var(--color-border)]/60" />
      <div className="h-4 w-full max-w-md rounded-md bg-[var(--color-border)]/40" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-[var(--radius-md)] bg-[var(--color-border)]/30" />
        <div className="h-28 rounded-[var(--radius-md)] bg-[var(--color-border)]/30" />
      </div>
    </div>
  );
}
