import { Card, CardContent } from '@/components/ui/card'

export function MetricCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <Card className="min-h-28 rounded-[1.8rem]">
      <CardContent className="flex h-full flex-col justify-between gap-3 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
            {value}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  )
}
