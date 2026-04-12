import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { getExerciseWeekdayKeys } from '@/lib/date'
import type {
  ExerciseCategory,
  ExerciseWeekday,
  ExerciseWorkoutDocument,
  ExerciseWorkoutFormValues,
} from '@/types/models'

const categoryOptions: ExerciseCategory[] = [
  'warmup',
  'workout',
  'cardio',
  'core',
  'mobility',
  'recovery',
  'full-body',
]

const weekdayOptions = getExerciseWeekdayKeys()

const defaultValues: ExerciseWorkoutFormValues = {
  name: '',
  weekday: 'monday',
  category: 'workout',
  description: '',
  target: '',
  videoUrl: '',
  videoSearchQuery: '',
  isActive: true,
}

function formatLabel(value: string) {
  return value[0].toUpperCase() + value.slice(1)
}

function toFormValues(workout?: ExerciseWorkoutDocument | null): ExerciseWorkoutFormValues {
  if (!workout) {
    return defaultValues
  }

  return {
    name: workout.name,
    weekday: workout.weekday,
    category: workout.category,
    description: workout.description,
    target: workout.target,
    videoUrl: workout.videoUrl,
    videoSearchQuery: workout.videoSearchQuery,
    isActive: workout.isActive,
  }
}

export function ExerciseEditorDialog({
  open,
  onOpenChange,
  onSubmit,
  workout,
  isSaving,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ExerciseWorkoutFormValues) => Promise<void>
  workout?: ExerciseWorkoutDocument | null
  isSaving: boolean
}) {
  const [values, setValues] = useState<ExerciseWorkoutFormValues>(defaultValues)
  const [error, setError] = useState('')

  const title = useMemo(() => (workout ? 'Edit exercise' : 'Add exercise'), [workout])

  useEffect(() => {
    if (!open) {
      return
    }

    let isCancelled = false

    queueMicrotask(() => {
      if (isCancelled) {
        return
      }

      setValues(toFormValues(workout))
      setError('')
    })

    return () => {
      isCancelled = true
    }
  }, [open, workout])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!values.name.trim()) {
      setError('Exercise name is required.')
      return
    }

    if (!values.target.trim()) {
      setError('Target is required (for example: 3 sets x 12 reps).')
      return
    }

    setError('')
    await onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Keep each item clear enough to complete from a phone screen.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="exercise-name">Exercise name</Label>
            <Textarea
              id="exercise-name"
              maxLength={240}
              placeholder="Banded squats"
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="exercise-weekday">Day</Label>
              <Select
                value={values.weekday}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    weekday: value as ExerciseWeekday,
                  }))
                }
              >
                <SelectTrigger id="exercise-weekday">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weekdayOptions.map((weekday) => (
                    <SelectItem key={weekday} value={weekday}>
                      {formatLabel(weekday)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exercise-category">Category</Label>
              <Select
                value={values.category}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    category: value as ExerciseCategory,
                  }))
                }
              >
                <SelectTrigger id="exercise-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {formatLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise-target">Target</Label>
            <Input
              id="exercise-target"
              maxLength={140}
              placeholder="3 sets x 12-15 reps"
              value={values.target}
              onChange={(event) =>
                setValues((current) => ({ ...current, target: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise-description">Cue or note</Label>
            <Textarea
              id="exercise-description"
              maxLength={240}
              placeholder="Keep knees tracking over toes and maintain band tension."
              value={values.description}
              onChange={(event) =>
                setValues((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise-video-url">Video URL (optional)</Label>
            <Input
              id="exercise-video-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={values.videoUrl}
              onChange={(event) =>
                setValues((current) => ({ ...current, videoUrl: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise-video-search">Video search phrase</Label>
            <Input
              id="exercise-video-search"
              placeholder="banded glute kickback tutorial"
              value={values.videoSearchQuery}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  videoSearchQuery: event.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Active in plan</p>
              <p className="text-xs text-muted-foreground">
                Inactive items stay saved but do not count toward progress.
              </p>
            </div>
            <Switch
              checked={values.isActive}
              onCheckedChange={(checked) =>
                setValues((current) => ({ ...current, isActive: checked }))
              }
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : workout ? 'Save changes' : 'Create exercise'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
