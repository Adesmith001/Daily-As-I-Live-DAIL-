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
    <Card className="relative overflow-hidden rounded-[1.6rem]">
      <div className={cn('absolute bottom-5 left-0 top-5 w-1.5 rounded-full', accentClass)} />
      <CardContent className="space-y-5 p-5 pl-7">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <h3 className="break-words text-[1.28rem] tracking-[-0.04em]">
                {tracker.name}
              </h3>
              <Badge variant="secondary">{tracker.type}</Badge>
            </div>
            {tracker.description ? (
              <p className="break-words text-sm leading-6 text-muted-foreground">
                {tracker.description}
              </p>
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
                'flex min-h-13 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition',
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
                'flex min-h-13 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition',
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
                  'flex size-10 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold transition',
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
