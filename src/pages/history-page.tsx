import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/empty-state'
import { LoadingScreen } from '@/components/common/loading-screen'
import { MetricCard } from '@/components/common/metric-card'
import { HistoryChart } from '@/components/history/history-chart'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'
import { daysBetween, formatDateLabel, getTodayKey } from '@/lib/date'
import {
  buildDailySummaries,
  buildTrendData,
  buildWeeklySummary,
  calculateBestStreak,
  calculateCurrentStreak,
} from '@/lib/score'
import { subscribeToHistoryEntries } from '@/services/daily-entry-service'
import { subscribeToTrackers } from '@/services/tracker-service'
import type { DailyEntryDocument, TrackerDocument } from '@/types/models'

type HistoryFilter = 'all' | 'week' | 'month'

export function HistoryPage() {
  const { user } = useAuth()
  const [trackers, setTrackers] = useState<TrackerDocument[]>([])
  const [entries, setEntries] = useState<DailyEntryDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<HistoryFilter>('all')

  useEffect(() => {
    if (!user) {
      return
    }

    const unsubscribeTrackers = subscribeToTrackers(user.uid, setTrackers)
    const unsubscribeEntries = subscribeToHistoryEntries(user.uid, (nextEntries) => {
      setEntries(nextEntries)
      setLoading(false)
    })

    return () => {
      unsubscribeTrackers()
      unsubscribeEntries()
    }
  }, [user])

  const summaries = useMemo(() => buildDailySummaries(entries, trackers), [entries, trackers])
  const filteredSummaries = useMemo(() => {
    if (filter === 'all') {
      return summaries
    }

    const maxDays = filter === 'week' ? 7 : 30
    return summaries.filter(
      (summary) => daysBetween(summary.date, getTodayKey()) >= 0 && daysBetween(summary.date, getTodayKey()) < maxDays,
    )
  }, [filter, summaries])
  const deferredSummaries = useDeferredValue(filteredSummaries)
  const weeklySummary = buildWeeklySummary(summaries)
  const currentStreak = calculateCurrentStreak(summaries)
  const bestStreak = calculateBestStreak(summaries)
  const trendData = buildTrendData(deferredSummaries, filter === 'month' ? 30 : 14)

  if (loading) {
    return <LoadingScreen fullscreen={false} label="Loading history..." />
  }

  if (summaries.length === 0) {
    return (
      <EmptyState
        description="Start logging trackers on the Today page and your score history will appear here."
        title="No history yet"
      />
    )
  }

  return (
    <div className="space-y-5">
      <section className="page-header">
        <p className="section-kicker">Reflection</p>
        <h2 className="text-3xl tracking-[-0.05em]">History and trends</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Review your past days, see what is compounding, and notice your patterns.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          helper="Days in a row with at least one logged entry."
          label="Current streak"
          value={`${currentStreak} days`}
        />
        <MetricCard
          helper="Your longest recorded run so far."
          label="Best streak"
          value={`${bestStreak} days`}
        />
        <MetricCard
          helper={`${weeklySummary.daysLogged} logged days and ${weeklySummary.completionRate}% completion this week.`}
          label="Weekly summary"
          value={
            weeklySummary.averageScore !== null
              ? `${weeklySummary.averageScore}/10`
              : 'No data'
          }
        />
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as HistoryFilter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="space-y-6">
          <HistoryChart data={trendData} />

          {deferredSummaries.length === 0 ? (
            <EmptyState
              description="Switch filters or keep logging to build up this view."
              title="No entries in this range"
            />
          ) : (
            <div className="space-y-3">
              {deferredSummaries.map((summary) => (
                <Link
                  key={summary.date}
                  className="block"
                  to={`/history/${summary.date}`}
                >
                  <div className="section-block transition hover:bg-muted">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-2xl">{formatDateLabel(summary.date)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {summary.entryCount} entries logged
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge>{summary.score !== null ? `${summary.score}/10` : 'No score'}</Badge>
                        <span className="text-xs text-muted-foreground">
                          newest first
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
