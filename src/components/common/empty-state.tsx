import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <Card className="overflow-hidden border-white/70">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-20 items-center justify-center rounded-4xl bg-[radial-gradient(circle_at_top,#fff4eb,#ffe0c9)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="h-8 w-12 rounded-2xl border border-white/80 bg-white/75 shadow-[0_14px_24px_-18px_rgba(116,29,12,0.38)]" />
        </div>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">{description}</p>
        {actionLabel && onAction ? (
          <div className="flex justify-center">
            <Button onClick={onAction}>{actionLabel}</Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
