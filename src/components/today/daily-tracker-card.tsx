import { CheckCircle2, Circle, RotateCcw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DailyEntryDocument, TrackerDocument } from '@/types/models'

const accentClasses = [
  'tracker-rail-1',
  'tracker-rail-2',
  'tracker-rail-3',
  'tracker-rail-4',
  'tracker-rail-5',
]

export function DailyTrackerCard({
  tracker,
  entry,
  isSaving,
  onCheckboxSelect,
  onRangeSelect,
  onClear,
}: {
  tracker: TrackerDocument
  entry?: DailyEntryDocument
  isSaving: boolean
  onCheckboxSelect: (value: boolean) => Promise<void>
  onRangeSelect: (value: number) => Promise<void>
  onClear: () => Promise<void>
}) {
  const hasValue = entry?.checkboxValue !== null || entry?.rangeValue !== null
  const accentClass =
    accentClasses[tracker.displayOrder % accentClasses.length] ?? accentClasses[0]

  return (
    <Card className="relative overflow-hidden">
      <div className={cn('absolute bottom-6 left-0 top-6 w-1 rounded-full', accentClass)} />
      <CardContent className="space-y-4 p-5 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-[1.4rem] tracking-[-0.05em]">{tracker.name}</h3>
              <Badge variant="secondary">{tracker.type}</Badge>
            </div>
            {tracker.description ? (
              <p className="text-sm leading-6 text-muted-foreground">{tracker.description}</p>
            ) : null}
          </div>

          {hasValue ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Clear ${tracker.name}`}
              disabled={isSaving}
              onClick={() => void onClear()}
            >
              <RotateCcw className="size-4" />
            </Button>
          ) : null}
        </div>

        {tracker.type === 'checkbox' ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              className={cn(
                'flex min-h-14 items-center justify-center gap-2 rounded-[1.35rem] border px-4 py-3 text-sm font-semibold transition',
                entry?.checkboxValue === true
                  ? 'tracker-action-active border-transparent'
                  : 'tracker-action-idle text-foreground',
              )}
              disabled={isSaving}
              onClick={() => void onCheckboxSelect(true)}
            >
              <CheckCircle2 className="size-4" />
              Done
            </button>
            <button
              className={cn(
                'flex min-h-14 items-center justify-center gap-2 rounded-[1.35rem] border px-4 py-3 text-sm font-semibold transition',
                entry?.checkboxValue === false
                  ? 'tracker-action-dark border-transparent'
                  : 'tracker-action-idle text-foreground',
              )}
              disabled={isSaving}
              onClick={() => void onCheckboxSelect(false)}
            >
              <Circle className="size-4" />
              Not today
            </button>
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Array.from({ length: 11 }, (_, index) => (
              <button
                key={index}
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-[1.2rem] border text-sm font-semibold transition',
                  entry?.rangeValue === index
                    ? 'tracker-scale-active border-transparent'
                    : 'tracker-scale-idle text-foreground',
                )}
                disabled={isSaving}
                onClick={() => void onRangeSelect(index)}
              >
                {index}
              </button>
            ))}
          </div>
        )}

        {isSaving ? (
          <p className="text-xs text-muted-foreground">Saving...</p>
        ) : hasValue ? (
          <p className="text-xs text-muted-foreground">
            Logged for today. Tap again any time to revise.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            No entry yet for today.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
