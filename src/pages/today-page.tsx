import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/common/empty-state'
import { LoadingScreen } from '@/components/common/loading-screen'
import { MetricCard } from '@/components/common/metric-card'
import { DailyTrackerCard } from '@/components/today/daily-tracker-card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { formatFriendlyDay, getTodayKey } from '@/lib/date'
import {
  buildDailySummaries,
  buildWeeklySummary,
  calculateCurrentStreak,
  calculateDailyScore,
} from '@/lib/score'
import {
  clearDailyEntry,
  subscribeToEntriesByDate,
  subscribeToHistoryEntries,
  upsertDailyEntry,
} from '@/services/daily-entry-service'
import { subscribeToTrackers } from '@/services/tracker-service'
import type { DailyEntryDocument, TrackerDocument } from '@/types/models'

export function TodayPage() {
  const { user } = useAuth()
  const [trackers, setTrackers] = useState<TrackerDocument[]>([])
  const [entries, setEntries] = useState<DailyEntryDocument[]>([])
  const [historyEntries, setHistoryEntries] = useState<DailyEntryDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [savingTrackerIds, setSavingTrackerIds] = useState<string[]>([])

  const today = getTodayKey()

  useEffect(() => {
    if (!user) {
      return
    }

    const unsubscribeTrackers = subscribeToTrackers(user.uid, (nextTrackers) => {
      setTrackers(nextTrackers)
      setLoading(false)
    })
    const unsubscribeEntries = subscribeToEntriesByDate(user.uid, today, setEntries)
    const unsubscribeHistory = subscribeToHistoryEntries(user.uid, setHistoryEntries)

    return () => {
      unsubscribeTrackers()
      unsubscribeEntries()
      unsubscribeHistory()
    }
  }, [today, user])

  const activeTrackers = useMemo(
    () => trackers.filter((tracker) => tracker.isActive),
    [trackers],
  )
  const entriesByTrackerId = useMemo(
    () => new Map(entries.map((entry) => [entry.trackerId, entry])),
    [entries],
  )
  const dailyScore = calculateDailyScore(entries)
  const summaries = buildDailySummaries(historyEntries, trackers)
  const weeklySummary = buildWeeklySummary(summaries)
  const streak = calculateCurrentStreak(summaries)

  async function handleSave(
    tracker: TrackerDocument,
    value: boolean | number,
  ) {
    if (!user) {
      return
    }

    setSavingTrackerIds((current) => [...current, tracker.id])
    try {
      await upsertDailyEntry({
        userId: user.uid,
        tracker,
        entryDate: today,
        value,
        existingEntry: entriesByTrackerId.get(tracker.id),
      })
    } catch (error) {
      console.error('Could not save daily entry', error)
      toast.error('Could not save that daily entry.')
    } finally {
      setSavingTrackerIds((current) => current.filter((item) => item !== tracker.id))
    }
  }

  async function handleClear(tracker: TrackerDocument) {
    if (!user) {
      return
    }

    setSavingTrackerIds((current) => [...current, tracker.id])
    try {
      await clearDailyEntry(user.uid, tracker.id, today)
    } catch (error) {
      console.error('Could not clear daily entry', error)
      toast.error('Could not clear that daily entry.')
    } finally {
      setSavingTrackerIds((current) => current.filter((item) => item !== tracker.id))
    }
  }

  if (loading) {
    return <LoadingScreen fullscreen={false} label="Loading your trackers..." />
  }

  return (
    <div className="space-y-5">
      <section className="page-header">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="theme-chip inline-flex px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
              Today
            </p>
            <h2 className="text-[2.7rem] leading-none tracking-[-0.06em]">
              {dailyScore !== null ? `${dailyScore}/10` : 'No score yet'}
            </h2>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              Your day score updates as you log each tracker.
            </p>
          </div>

          <div className="theme-soft-panel px-4 py-3">
            <p className="section-kicker">Focus day</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.04em]">
              {formatFriendlyDay(today)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          helper="Consecutive days with at least one entry logged."
          label="Current streak"
          value={`${streak} day${streak === 1 ? '' : 's'}`}
        />
        <MetricCard
          helper="Average score across the last 7 logged days."
          label="Weekly average"
          value={
            weeklySummary.averageScore !== null
              ? `${weeklySummary.averageScore}/10`
              : 'No data'
          }
        />
        <MetricCard
          helper={`${weeklySummary.completionRate}% tracker completion over the last week.`}
          label="This week"
          value={`${weeklySummary.daysLogged} days`}
        />
      </div>

      <section className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="section-kicker">Habits</p>
          <h3 className="mt-1 text-3xl tracking-[-0.05em]">Today's list</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Tap through your daily check-ins with one hand and keep your momentum visible.
          </p>
        </div>
        <Badge variant="outline">{activeTrackers.length} active</Badge>
      </section>

      {activeTrackers.length === 0 ? (
        <EmptyState
          description="Create your first tracker on the Trackers page, then it will appear here for fast daily logging."
          title="No active trackers yet"
        />
      ) : (
        <div className="space-y-3">
          {activeTrackers.map((tracker) => (
            <DailyTrackerCard
              key={tracker.id}
              entry={entriesByTrackerId.get(tracker.id)}
              isSaving={savingTrackerIds.includes(tracker.id)}
              tracker={tracker}
              onCheckboxSelect={(value) => handleSave(tracker, value)}
              onClear={() => handleClear(tracker)}
              onRangeSelect={(value) => handleSave(tracker, value)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
