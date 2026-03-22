export function LoadingScreen({ label = 'Loading DAIL...' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="surface-card flex w-full max-w-sm flex-col items-center gap-4 p-8 text-center">
        <div className="flex gap-2">
          <span className="size-3 animate-pulse rounded-full bg-primary" />
          <span className="size-3 animate-pulse rounded-full bg-primary/70 [animation-delay:120ms]" />
          <span className="size-3 animate-pulse rounded-full bg-primary/45 [animation-delay:240ms]" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{label}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your daily space is coming into view.
          </p>
        </div>
      </div>
    </div>
  )
}
