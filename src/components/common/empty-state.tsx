import { Button } from '@/components/ui/button'

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <section className="section-block flex flex-col items-center gap-5 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-muted">
        <div className="h-8 w-8 rounded-lg border border-border bg-card" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl">{title}</h2>
        <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction ? (
        <div className="flex justify-center">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </section>
  )
}
