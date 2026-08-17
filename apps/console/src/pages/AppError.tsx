/**
 * The router's last resort — a failed lazy chunk or a render crash lands here
 * instead of a silent white screen (the failure mode that prompted this).
 */
export default function AppError() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 bg-primary px-6 text-center">
      <h1 className="text-xl font-bold text-primary-foreground">
        Something went wrong loading this page
      </h1>
      <p className="text-sm text-primary-foreground/60">
        A refresh usually fixes it.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground"
      >
        Reload
      </button>
    </main>
  );
}
