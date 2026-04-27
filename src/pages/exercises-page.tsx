import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw, Settings2 } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/common/empty-state'
import { LoadingScreen } from '@/components/common/loading-screen'
import { ExerciseCard } from '@/components/exercises/exercise-card'
import { ExerciseDaySelector } from '@/components/exercises/exercise-day-selector'
import { ExerciseEditorDialog } from '@/components/exercises/exercise-editor-dialog'
import { ExerciseProgressHeader } from '@/components/exercises/exercise-progress-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { getCurrentWeekDays, getExerciseWeekdayFromDateKey, getTodayKey } from '@/lib/date'
import {
  buildExerciseProgressSummary,
  calculateDayCompletion,
} from '@/lib/exercise-score'
import {
  getDefaultExerciseTemplate,
  getExerciseTemplateById,
  getExerciseTemplates,
} from '@/lib/exercise-template'
import {
  getExerciseEntryId,
  setExerciseCompletion,
  subscribeToExerciseEntriesByDate,
  subscribeToExerciseHistoryEntries,
} from '@/services/exercise-entry-service'
import { importExerciseTemplate } from '@/services/exercise-import-service'
import { upsertExerciseLeaderboardPublic } from '@/services/exercise-leaderboard-service'
import {
  subscribeToExerciseProfile,
  upsertExerciseProfile,
} from '@/services/exercise-profile-service'
import {
  createExerciseWorkout,
  deleteExerciseWorkout,
  reorderExerciseWorkout,
  subscribeToExerciseWorkouts,
  updateExerciseWorkout,
} from '@/services/exercise-workout-service'
import type {
  ExerciseEntryDocument,
  ExerciseProfileDocument,
  ExerciseWorkoutDocument,
  ExerciseWorkoutFormValues,
} from '@/types/models'

function isPermissionDeniedError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }

  if (!('code' in error)) {
    return false
  }

  return (error as { code?: string }).code === 'permission-denied'
}

function getNextDisplayOrder(
  workouts: ExerciseWorkoutDocument[],
  weekday: ExerciseWorkoutDocument['weekday'],
) {
  const dayWorkouts = workouts.filter((workout) => workout.weekday === weekday)

  if (dayWorkouts.length === 0) {
    return 0
  }

  return Math.max(...dayWorkouts.map((workout) => workout.displayOrder)) + 1
}

function syncEntryList(
  entries: ExerciseEntryDocument[],
  params: {
    userId: string
    workoutId: string
    entryDate: string
    isCompleted: boolean
  },
) {
  const withoutMatch = entries.filter(
    (entry) =>
      !(entry.workoutId === params.workoutId && entry.entryDate === params.entryDate),
  )

  if (!params.isCompleted) {
    return withoutMatch
  }

  return [
    ...withoutMatch,
    {
      id: getExerciseEntryId(params.userId, params.workoutId, params.entryDate),
      userId: params.userId,
      workoutId: params.workoutId,
      entryDate: params.entryDate,
      isCompleted: true,
      createdAt: null,
      updatedAt: null,
    },
  ]
}

function profileMatchesSummary(
  profile: ExerciseProfileDocument | null,
  summary: ReturnType<typeof buildExerciseProgressSummary>,
) {
  if (!profile) {
    return false
  }

  if (
    profile.xpTotal !== summary.xpTotal ||
    profile.weeklyXp !== summary.weeklyXp ||
    profile.currentStreak !== summary.currentStreak ||
    profile.bestStreak !== summary.bestStreak ||
    profile.weeklyAdherence !== summary.weeklyAdherence
  ) {
    return false
  }

  return profile.badges.join('|') === summary.badges.join('|')
}

export function ExercisesPage() {
  const { user, profile: userProfile } = useAuth()
  const [workouts, setWorkouts] = useState<ExerciseWorkoutDocument[]>([])
  const [entriesForSelectedDate, setEntriesForSelectedDate] = useState<ExerciseEntryDocument[]>([])
  const [historyEntries, setHistoryEntries] = useState<ExerciseEntryDocument[]>([])
  const [profile, setProfile] = useState<ExerciseProfileDocument | null>(null)

  const [workoutsLoaded, setWorkoutsLoaded] = useState(false)
  const [selectedEntriesLoaded, setSelectedEntriesLoaded] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const [selectedWeekday, setSelectedWeekday] = useState(
    getExerciseWeekdayFromDateKey(getTodayKey()),
  )
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<ExerciseWorkoutDocument | null>(null)
  const [savingEditor, setSavingEditor] = useState(false)
  const [savingWorkoutIds, setSavingWorkoutIds] = useState<string[]>([])
  const [importingDefaults, setImportingDefaults] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    getDefaultExerciseTemplate().templateId,
  )
  const [editMode, setEditMode] = useState(false)
  const [pulseProgress, setPulseProgress] = useState(false)
  const [profileSyncBlocked, setProfileSyncBlocked] = useState(false)

  const templates = useMemo(() => getExerciseTemplates(), [])
  const selectedTemplate =
    useMemo(
      () => getExerciseTemplateById(selectedTemplateId) ?? templates[0] ?? getDefaultExerciseTemplate(),
      [selectedTemplateId, templates],
    )

  const weekDays = useMemo(() => getCurrentWeekDays(), [])
  const selectedDay =
    weekDays.find((day) => day.weekdayKey === selectedWeekday) ?? weekDays[0]
  const selectedEntryDate = selectedDay?.key ?? getTodayKey()

  useEffect(() => {
    if (!selectedDay) {
      setSelectedWeekday(getExerciseWeekdayFromDateKey(getTodayKey()))
    }
  }, [selectedDay])

  useEffect(() => {
    if (!user) {
      setWorkouts([])
      setEntriesForSelectedDate([])
      setHistoryEntries([])
      setProfile(null)
      setWorkoutsLoaded(true)
      setSelectedEntriesLoaded(true)
      setHistoryLoaded(true)
      return
    }

    setWorkoutsLoaded(false)

    const unsubscribe = subscribeToExerciseWorkouts(user.uid, (nextWorkouts) => {
      setWorkouts(nextWorkouts)
      setWorkoutsLoaded(true)
    })

    return () => {
      unsubscribe()
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      return
    }

    setSelectedEntriesLoaded(false)

    const unsubscribe = subscribeToExerciseEntriesByDate(
      user.uid,
      selectedEntryDate,
      (entries) => {
        setEntriesForSelectedDate(entries)
        setSelectedEntriesLoaded(true)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [selectedEntryDate, user])

  useEffect(() => {
    if (!user) {
      return
    }

    setHistoryLoaded(false)

    const unsubscribe = subscribeToExerciseHistoryEntries(user.uid, (entries) => {
      setHistoryEntries(entries)
      setHistoryLoaded(true)
    })

    return () => {
      unsubscribe()
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      return
    }

    const unsubscribe = subscribeToExerciseProfile(
      user.uid,
      setProfile,
      (error) => {
        console.error('Could not subscribe to exercise profile', error)
        if (isPermissionDeniedError(error)) {
          setProfileSyncBlocked(true)
        }
      },
    )

    return () => {
      unsubscribe()
    }
  }, [user])

  const workoutsByWeekday = useMemo(() => {
    const byWeekday = new Map<string, ExerciseWorkoutDocument[]>()

    for (const workout of workouts) {
      const current = byWeekday.get(workout.weekday) ?? []
      byWeekday.set(workout.weekday, [...current, workout])
    }

    for (const [weekday, weekdayWorkouts] of byWeekday.entries()) {
      byWeekday.set(
        weekday,
        [...weekdayWorkouts].sort((left, right) => left.displayOrder - right.displayOrder),
      )
    }

    return byWeekday
  }, [workouts])

  const selectedWorkouts = workoutsByWeekday.get(selectedWeekday) ?? []
  const entriesByWorkoutId = useMemo(
    () => new Map(entriesForSelectedDate.map((entry) => [entry.workoutId, entry])),
    [entriesForSelectedDate],
  )

  const summary = useMemo(
    () => buildExerciseProgressSummary(workouts, historyEntries),
    [historyEntries, workouts],
  )

  const selectedCompletedCount = selectedWorkouts.filter((workout) =>
    entriesByWorkoutId.has(workout.id),
  ).length
  const selectedCompletion = calculateDayCompletion(
    selectedCompletedCount,
    selectedWorkouts.length,
  )

  const loading = !workoutsLoaded || !selectedEntriesLoaded || !historyLoaded

  const syncProfileSafely = useCallback(async (
    nextSummary: ReturnType<typeof buildExerciseProgressSummary>,
    defaultTemplateVersionImported?: string | null,
  ) => {
    if (!user || profileSyncBlocked) {
      return
    }

    try {
      await upsertExerciseProfile(user.uid, {
        xpTotal: nextSummary.xpTotal,
        weeklyXp: nextSummary.weeklyXp,
        currentStreak: nextSummary.currentStreak,
        bestStreak: nextSummary.bestStreak,
        weeklyAdherence: nextSummary.weeklyAdherence,
        badges: nextSummary.badges,
        defaultTemplateVersionImported:
          defaultTemplateVersionImported ??
          profile?.defaultTemplateVersionImported ??
          null,
        rivalUid: profile?.rivalUid ?? null,
      })

      await upsertExerciseLeaderboardPublic({
        uid: user.uid,
        displayName: userProfile?.displayName || 'DAIL member',
        weeklyXp: nextSummary.weeklyXp,
        xpTotal: nextSummary.xpTotal,
        weeklyAdherence: nextSummary.weeklyAdherence,
        currentStreak: nextSummary.currentStreak,
      })
    } catch (error) {
      console.error('Could not sync exercise profile', error)
      if (isPermissionDeniedError(error)) {
        setProfileSyncBlocked(true)
        toast.message(
          'Progress will still save. XP and badges sync is blocked by Firestore permissions.',
        )
      }
    }
  }, [
    profile?.defaultTemplateVersionImported,
    profile?.rivalUid,
    profileSyncBlocked,
    user,
    userProfile?.displayName,
  ])

  useEffect(() => {
    if (!user || !historyLoaded || !workoutsLoaded) {
      return
    }

    if (profileSyncBlocked) {
      return
    }

    if (profileMatchesSummary(profile, summary)) {
      return
    }

    void syncProfileSafely(summary)
  }, [historyLoaded, profile, profileSyncBlocked, summary, syncProfileSafely, user, workoutsLoaded])

  async function handleImportTemplate() {
    if (!user) {
      return
    }

    setImportingDefaults(true)
    try {
      const result = await importExerciseTemplate({
        uid: user.uid,
        templateId: selectedTemplate.templateId,
        existingWorkouts: workouts,
      })

      if (result.importedCount === 0 && result.removedCount === 0) {
        toast.message(`${selectedTemplate.title} is already imported.`)
      } else {
        toast.success(
          `Imported ${result.importedCount} from ${selectedTemplate.title}. Removed ${result.removedCount} from other template(s).`,
        )
      }

      await syncProfileSafely(summary, result.templateVersion)
    } catch (error) {
      console.error('Could not import exercise template', error)
      toast.error('Could not import this template right now.')
    } finally {
      setImportingDefaults(false)
    }
  }

  async function handleSaveWorkout(values: ExerciseWorkoutFormValues) {
    if (!user) {
      return
    }

    setSavingEditor(true)
    try {
      if (editingWorkout) {
        const weekdayChanged = editingWorkout.weekday !== values.weekday
        const nextDisplayOrder = weekdayChanged
          ? getNextDisplayOrder(workouts, values.weekday)
          : editingWorkout.displayOrder

        await updateExerciseWorkout(editingWorkout.id, {
          ...values,
          displayOrder: nextDisplayOrder,
        })

        toast.success('Exercise updated')
      } else {
        await createExerciseWorkout(
          user.uid,
          values,
          getNextDisplayOrder(workouts, values.weekday),
        )

        toast.success('Exercise created')
      }

      setEditorOpen(false)
      setEditingWorkout(null)
    } catch (error) {
      console.error('Could not save exercise', error)
      toast.error('Could not save that exercise.')
    } finally {
      setSavingEditor(false)
    }
  }

  async function handleDeleteWorkout(workout: ExerciseWorkoutDocument) {
    const confirmed = window.confirm(`Delete "${workout.name}"?`)
    if (!confirmed) {
      return
    }

    try {
      await deleteExerciseWorkout(workout.id)
      toast.success('Exercise deleted')
    } catch (error) {
      console.error('Could not delete exercise', error)
      toast.error('Could not delete that exercise.')
    }
  }

  async function handleMoveWorkout(
    workoutId: string,
    direction: 'up' | 'down',
  ) {
    try {
      await reorderExerciseWorkout(selectedWorkouts, workoutId, direction)
    } catch (error) {
      console.error('Could not reorder exercise', error)
      toast.error('Could not reorder this exercise right now.')
    }
  }

  async function handleToggleCompletion(
    workout: ExerciseWorkoutDocument,
    isCompleted: boolean,
  ) {
    if (!user) {
      return
    }

    const previousSelectedEntries = entriesForSelectedDate
    const previousHistoryEntries = historyEntries

    const nextSelectedEntries = syncEntryList(entriesForSelectedDate, {
      userId: user.uid,
      workoutId: workout.id,
      entryDate: selectedEntryDate,
      isCompleted,
    })

    const nextHistoryEntries = syncEntryList(historyEntries, {
      userId: user.uid,
      workoutId: workout.id,
      entryDate: selectedEntryDate,
      isCompleted,
    })

    setEntriesForSelectedDate(nextSelectedEntries)
    setHistoryEntries(nextHistoryEntries)
    setSavingWorkoutIds((current) => [...current, workout.id])

    try {
      await setExerciseCompletion({
        userId: user.uid,
        workoutId: workout.id,
        entryDate: selectedEntryDate,
        isCompleted,
        existingEntry: entriesByWorkoutId.get(workout.id),
      })

      const nextSummary = buildExerciseProgressSummary(workouts, nextHistoryEntries)
      const newBadges = nextSummary.badges.filter(
        (badge) => !summary.badges.includes(badge),
      )

      if (nextSummary.currentStreak > summary.currentStreak) {
        toast.success(`Streak up: ${nextSummary.currentStreak} days.`)
      }

      if (newBadges.length > 0) {
        toast.success(`Badge unlocked: ${newBadges.join(', ')}`)
      }

      if (nextSummary.xpTotal > summary.xpTotal) {
        setPulseProgress(true)
        window.setTimeout(() => setPulseProgress(false), 650)
      }

      await syncProfileSafely(nextSummary)
    } catch (error) {
      console.error('Could not save exercise completion', error)
      setEntriesForSelectedDate(previousSelectedEntries)
      setHistoryEntries(previousHistoryEntries)
      toast.error('Could not save completion right now.')
    } finally {
      setSavingWorkoutIds((current) => current.filter((id) => id !== workout.id))
    }
  }

  if (loading) {
    return <LoadingScreen fullscreen={false} label="Loading exercises..." />
  }

  if (workouts.length === 0) {
    return (
      <div className="space-y-5">
        <section className="page-header">
          <p className="section-kicker">Exercises</p>
          <h2 className="text-3xl tracking-[-0.05em]">Import a weekly plan</h2>
          <div className="max-w-sm">
            <Select value={selectedTemplate.templateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.templateId} value={template.templateId}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Start with {selectedTemplate.title}, then customize every item for any user.
          </p>
        </section>

        <EmptyState
          actionLabel={importingDefaults ? 'Importing...' : `Import ${selectedTemplate.title}`}
          description={selectedTemplate.description}
          onAction={() => {
            void handleImportTemplate()
          }}
          title="No exercises yet"
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <ExerciseProgressHeader
        badges={summary.badges}
        currentStreak={summary.currentStreak}
        pulse={pulseProgress}
        todayCompletion={summary.todayCompletion}
        weeklyAdherence={summary.weeklyAdherence}
        weeklyXp={summary.weeklyXp}
        xpTotal={summary.xpTotal}
      />

      <section className="space-y-4 border-b border-border pb-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-kicker">Day-by-day flow</p>
            <h3 className="mt-1 text-2xl tracking-[-0.04em]">Exercises</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="min-w-52">
              <Select value={selectedTemplate.templateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.templateId} value={template.templateId}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              disabled={importingDefaults}
              size="sm"
              variant="outline"
              onClick={() => void handleImportTemplate()}
            >
              <RefreshCw className="size-4" />
              {importingDefaults ? 'Importing...' : 'Activate plan'}
            </Button>
            <Button
              size="sm"
              variant={editMode ? 'secondary' : 'outline'}
              onClick={() => setEditMode((current) => !current)}
            >
              <Settings2 className="size-4" />
              {editMode ? 'Editing on' : 'Edit mode'}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingWorkout(null)
                setEditorOpen(true)
              }}
            >
              <Plus className="size-4" />
              Add exercise
            </Button>
          </div>
        </div>

        <ExerciseDaySelector
          days={weekDays}
          selectedWeekday={selectedWeekday}
          onSelect={setSelectedWeekday}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {selectedWorkouts.length} planned
          </Badge>
          <Badge variant="secondary">{selectedCompletion}% complete</Badge>
          <Badge variant="outline">
            {summary.weeklyQualifiedDays}/{summary.weeklyScheduledDays} strong days this week
          </Badge>
        </div>
      </section>

      {selectedWorkouts.length === 0 ? (
        <EmptyState
          description="No exercises planned for this day yet. Add one to personalize the routine."
          onAction={() => {
            setEditingWorkout(null)
            setEditorOpen(true)
          }}
          title="No exercises for this day"
          actionLabel="Add exercise"
        />
      ) : (
        <div className="space-y-4">
          {selectedWorkouts.map((workout, index) => (
            <ExerciseCard
              key={workout.id}
              canMoveDown={index < selectedWorkouts.length - 1}
              canMoveUp={index > 0}
              isCompleted={entriesByWorkoutId.has(workout.id)}
              isSaving={savingWorkoutIds.includes(workout.id)}
              showEditorControls={editMode}
              workout={workout}
              onDelete={() => handleDeleteWorkout(workout)}
              onEdit={() => {
                setEditingWorkout(workout)
                setEditorOpen(true)
              }}
              onMoveDown={() => handleMoveWorkout(workout.id, 'down')}
              onMoveUp={() => handleMoveWorkout(workout.id, 'up')}
              onToggleCompletion={(isCompleted) =>
                handleToggleCompletion(workout, isCompleted)
              }
            />
          ))}
        </div>
      )}

      <ExerciseEditorDialog
        isSaving={savingEditor}
        open={editorOpen}
        workout={editingWorkout}
        onOpenChange={(open) => {
          setEditorOpen(open)
          if (!open) {
            setEditingWorkout(null)
          }
        }}
        onSubmit={handleSaveWorkout}
      />
    </div>
  )
}
