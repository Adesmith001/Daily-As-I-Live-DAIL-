import { daysBetween, formatShortDateLabel, getTodayKey, shiftDateKey } from '@/lib/date'
import type { DailyEntryDocument, DailySummary, TrackerDocument, WeeklySummary } from '@/types/models'

export function getEntryScore(entry: DailyEntryDocument) {
  if (entry.checkboxValue !== null) {
    return entry.checkboxValue ? 10 : 0
  }

  if (entry.rangeValue !== null) {
    return entry.rangeValue
  }

  return null
}

export function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10
}

export function calculateDailyScore(entries: DailyEntryDocument[]) {
  const scores = entries
    .map(getEntryScore)
    .filter((value): value is number => value !== null)

  if (scores.length === 0) {
    return null
  }

  return roundToOneDecimal(
    scores.reduce((total, score) => total + score, 0) / scores.length,
  )
}

export function buildDailySummaries(
  entries: DailyEntryDocument[],
  trackers: TrackerDocument[],
) {
  const trackerCount = trackers.length
  const byDate = new Map<string, DailyEntryDocument[]>()

  for (const entry of entries) {
    const current = byDate.get(entry.entryDate) ?? []
    current.push(entry)
    byDate.set(entry.entryDate, current)
  }

  return Array.from(byDate.entries())
    .map(([date, dateEntries]) => ({
      date,
      score: calculateDailyScore(dateEntries),
      entryCount: dateEntries.length,
      completedTrackers: dateEntries.length,
      trackerCount,
    }))
    .sort((left, right) => (left.date < right.date ? 1 : -1))
}

export function calculateCurrentStreak(
  summaries: DailySummary[],
  today = getTodayKey(),
) {
  const dates = new Set(summaries.map((summary) => summary.date))
  let streak = 0
  let cursor = today

  while (dates.has(cursor)) {
    streak += 1
    cursor = shiftDateKey(cursor, -1)
  }

  return streak
}

export function calculateBestStreak(summaries: DailySummary[]) {
  const ordered = [...summaries].sort((left, right) =>
    left.date > right.date ? 1 : -1,
  )

  let longest = 0
  let current = 0
  let previousDate: string | null = null

  for (const summary of ordered) {
    if (previousDate === null) {
      current = 1
    } else if (daysBetween(previousDate, summary.date) === 1) {
      current += 1
    } else {
      current = 1
    }

    longest = Math.max(longest, current)
    previousDate = summary.date
  }

  return longest
}

export function buildWeeklySummary(summaries: DailySummary[]): WeeklySummary {
  const recent = summaries.filter((summary) => daysBetween(summary.date, getTodayKey()) < 7)
  const scores = recent
    .map((summary) => summary.score)
    .filter((value): value is number => value !== null)

  const averageScore =
    scores.length > 0
      ? roundToOneDecimal(scores.reduce((total, score) => total + score, 0) / scores.length)
      : null

  const bestScore = scores.length > 0 ? Math.max(...scores) : null
  const totalPossible = recent.reduce(
    (total, summary) => total + (summary.trackerCount || 0),
    0,
  )
  const completed = recent.reduce(
    (total, summary) => total + summary.completedTrackers,
    0,
  )

  return {
    averageScore,
    bestScore,
    daysLogged: recent.length,
    completionRate:
      totalPossible > 0 ? roundToOneDecimal((completed / totalPossible) * 100) : 0,
  }
}

export function buildTrendData(summaries: DailySummary[], days = 14) {
  const summaryMap = new Map(summaries.map((summary) => [summary.date, summary]))
  const today = getTodayKey()

  return Array.from({ length: days }, (_, index) => {
    const date = shiftDateKey(today, index - (days - 1))
    const summary = summaryMap.get(date)

    return {
      date,
      label: formatShortDateLabel(date),
      score: summary?.score ?? null,
    }
  })
}
