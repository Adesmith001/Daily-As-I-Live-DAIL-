import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
} from 'lucide-react'

import { ExerciseVideoEmbed } from '@/components/exercises/exercise-video-embed'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ExerciseWorkoutDocument } from '@/types/models'

const accentByCategory: Record<string, string> = {
  warmup: 'tracker-rail-2',
  workout: 'tracker-rail-1',
  cardio: 'tracker-rail-5',
  core: 'tracker-rail-4',
  mobility: 'tracker-rail-3',
  recovery: 'tracker-rail-3',
  'full-body': 'tracker-rail-2',
}

export interface ExerciseCardProps {
  workout: ExerciseWorkoutDocument
  isCompleted: boolean
  isSaving: boolean
  showEditorControls: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onToggleCompletion: (isCompleted: boolean) => Promise<void>
  onEdit: () => void
  onDelete: () => Promise<void>
  onMoveUp: () => Promise<void>
  onMoveDown: () => Promise<void>
}

export function ExerciseCard({
  workout,
  isCompleted,
  isSaving,
  showEditorControls,
  canMoveUp,
  canMoveDown,
  onToggleCompletion,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ExerciseCardProps) {
  const accentClass = accentByCategory[workout.category] ?? 'tracker-rail-1'

  return (
    <Card className="relative overflow-hidden rounded-[1.6rem]">
      <div className={cn('absolute bottom-5 left-0 top-5 w-1.5 rounded-full', accentClass)} />
      <CardContent className="space-y-5 p-5 pl-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[1.28rem] leading-tight tracking-[-0.04em]">{workout.name}</h3>
              <Badge variant="secondary">{workout.category}</Badge>
              {!workout.isActive ? <Badge variant="outline">inactive</Badge> : null}
            </div>
            <p className="text-sm text-muted-foreground">{workout.target}</p>
            {workout.description ? (
              <p className="text-sm leading-6 text-muted-foreground">{workout.description}</p>
            ) : null}
          </div>

          <button
            className={cn(
              'flex min-h-11 min-w-30 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition md:self-start',
              isCompleted
                ? 'tracker-action-active border-transparent'
                : 'tracker-action-idle text-foreground',
            )}
            disabled={isSaving}
            onClick={() => void onToggleCompletion(!isCompleted)}
          >
            {isCompleted ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
            {isCompleted ? 'Done' : 'Mark done'}
          </button>
        </div>

        <ExerciseVideoEmbed
          title={workout.name}
          videoSearchQuery={workout.videoSearchQuery}
          videoUrl={workout.videoUrl}
        />

        {showEditorControls ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <Button
              disabled={!canMoveUp}
              size="sm"
              variant="outline"
              onClick={() => void onMoveUp()}
            >
              <ArrowUp className="size-4" />
              Up
            </Button>
            <Button
              disabled={!canMoveDown}
              size="sm"
              variant="outline"
              onClick={() => void onMoveDown()}
            >
              <ArrowDown className="size-4" />
              Down
            </Button>
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void onDelete()}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        ) : null}

        {isSaving ? <p className="text-xs text-muted-foreground">Saving...</p> : null}
      </CardContent>
    </Card>
  )
}
