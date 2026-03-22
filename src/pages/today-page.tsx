import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/common/empty-state'
import { MetricCard } from '@/components/common/metric-card'
import { DailyTrackerCard } from '@/components/today/daily-tracker-card'
import { Card, CardContent } from '@/components/ui/card'
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
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          Loading your trackers...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-6 p-5">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {formatFriendlyDay(today)}
            </p>
            <h2 className="text-4xl">
              {dailyScore !== null ? `${dailyScore}/10` : 'No score yet'}
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              DAIL averages all tracker values logged today. Checkbox entries score
              10 or 0, range entries use their chosen 0-10 value.
            </p>
          </div>

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
        </CardContent>
      </Card>

      {activeTrackers.length === 0 ? (
        <EmptyState
          description="Create your first tracker on the Trackers page, then it will appear here for fast daily logging."
          title="No active trackers yet"
        />
      ) : (
        <div className="space-y-4">
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
