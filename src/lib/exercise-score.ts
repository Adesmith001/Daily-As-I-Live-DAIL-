import {
  daysBetween,
  getCurrentWeekDays,
  getExerciseWeekdayFromDateKey,
  getTodayKey,
  parseDateKey,
  shiftDateKey,
} from '@/lib/date'
import type {
  ExerciseEntryDocument,
  ExerciseProfileDocument,
  ExerciseWorkoutDocument,
} from '@/types/models'

export interface ExerciseDayStat {
  date: string
  scheduledCount: number
  completedCount: number
  completionPercent: number
  countsForStreak: boolean
  xpEarned: number
}

export interface ExerciseProgressSummary {
  xpTotal: number
  weeklyXp: number
  currentStreak: number
  bestStreak: number
  weeklyAdherence: number
  todayCompletion: number
  badges: string[]
  weeklyQualifiedDays: number
  weeklyScheduledDays: number
}

export function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10
}

export function calculateDayCompletion(completedItems: number, scheduledItems: number) {
  if (scheduledItems <= 0) {
    return 0
  }

  return roundToOneDecimal((completedItems / scheduledItems) * 100)
}

export function dayCountsForStreak(completionPercent: number, scheduledItems: number) {
  return scheduledItems > 0 && completionPercent >= 80
}

export function calculateDayXp(completedItems: number, completionPercent: number) {
  const base = completedItems * 10
  const bonus = completionPercent >= 90 && completedItems > 0 ? 20 : 0
  return base + bonus
}

function buildDateRange(startDate: string, endDate: string) {
  const totalDays = Math.max(0, daysBetween(startDate, endDate))

  return Array.from({ length: totalDays + 1 }, (_, index) =>
    shiftDateKey(startDate, index),
  )
}

function buildWorkoutsByWeekday(workouts: ExerciseWorkoutDocument[]) {
  const byWeekday = new Map<string, ExerciseWorkoutDocument[]>()

  for (const workout of workouts) {
    if (!workout.isActive) {
      continue
    }

    const current = byWeekday.get(workout.weekday) ?? []
    current.push(workout)
    byWeekday.set(workout.weekday, current)
  }

  for (const [weekday, weekdayWorkouts] of byWeekday.entries()) {
    byWeekday.set(
      weekday,
      [...weekdayWorkouts].sort((left, right) => left.displayOrder - right.displayOrder),
    )
  }

  return byWeekday
}

function buildCompletedIdsByDate(entries: ExerciseEntryDocument[]) {
  const byDate = new Map<string, Set<string>>()

  for (const entry of entries) {
    if (!entry.isCompleted) {
      continue
    }

    const current = byDate.get(entry.entryDate) ?? new Set<string>()
    current.add(entry.workoutId)
    byDate.set(entry.entryDate, current)
  }

  return byDate
}

export function buildExerciseDayStats(
  workouts: ExerciseWorkoutDocument[],
  entries: ExerciseEntryDocument[],
  startDate: string,
  endDate: string,
): ExerciseDayStat[] {
  const workoutsByWeekday = buildWorkoutsByWeekday(workouts)
  const completedIdsByDate = buildCompletedIdsByDate(entries)

  return buildDateRange(startDate, endDate).map((date) => {
    const weekday = getExerciseWeekdayFromDateKey(date)
    const scheduled = workoutsByWeekday.get(weekday) ?? []
    const completedIds = completedIdsByDate.get(date) ?? new Set<string>()
    const completedCount = scheduled.filter((workout) => completedIds.has(workout.id)).length
    const completionPercent = calculateDayCompletion(completedCount, scheduled.length)

    return {
      date,
      scheduledCount: scheduled.length,
      completedCount,
      completionPercent,
      countsForStreak: dayCountsForStreak(completionPercent, scheduled.length),
      xpEarned: calculateDayXp(completedCount, completionPercent),
    }
  })
}

function calculateCurrentStreak(dayStats: ExerciseDayStat[], today: string) {
  const byDate = new Map(dayStats.map((day) => [day.date, day]))

  let streak = 0
  let cursor = today

  while (true) {
    const day = byDate.get(cursor)
    if (!day || !day.countsForStreak) {
      break
    }

    streak += 1
    cursor = shiftDateKey(cursor, -1)
  }

  return streak
}

function calculateBestStreak(dayStats: ExerciseDayStat[]) {
  let best = 0
  let current = 0

  for (const day of dayStats) {
    if (day.countsForStreak) {
      current += 1
      best = Math.max(best, current)
    } else {
      current = 0
    }
  }

  return best
}

export function calculateWeeklyAdherence(dayStats: ExerciseDayStat[]) {
  const scheduledDays = dayStats.filter((day) => day.scheduledCount > 0).length
  if (scheduledDays === 0) {
    return 0
  }

  const qualifiedDays = dayStats.filter((day) => day.countsForStreak).length
  return roundToOneDecimal((qualifiedDays / scheduledDays) * 100)
}

export function deriveExerciseBadges(input: {
  xpTotal: number
  currentStreak: number
  bestStreak: number
  weeklyAdherence: number
  todayCompletion: number
}) {
  const badges: string[] = []

  if (input.xpTotal >= 150) {
    badges.push('First 150 XP')
  }

  if (input.xpTotal >= 500) {
    badges.push('500 XP')
  }

  if (input.currentStreak >= 3) {
    badges.push('3-Day Streak')
  }

  if (input.bestStreak >= 7) {
    badges.push('7-Day Consistency')
  }

  if (input.weeklyAdherence >= 80) {
    badges.push('Weekly 80%')
  }

  if (input.todayCompletion >= 100) {
    badges.push('Perfect Day')
  }

  return badges
}

export function buildExerciseProgressSummary(
  workouts: ExerciseWorkoutDocument[],
  entries: ExerciseEntryDocument[],
  referenceDate = getTodayKey(),
): ExerciseProgressSummary {
  const minEntryDate = entries.reduce<string | null>((current, entry) => {
    if (!current || entry.entryDate < current) {
      return entry.entryDate
    }

    return current
  }, null)

  const startDate = minEntryDate ?? shiftDateKey(referenceDate, -14)
  const allStats = buildExerciseDayStats(workouts, entries, startDate, referenceDate)
  const xpTotal = allStats.reduce((total, day) => total + day.xpEarned, 0)
  const currentStreak = calculateCurrentStreak(allStats, referenceDate)
  const bestStreak = calculateBestStreak(allStats)

  const weekDays = getCurrentWeekDays(parseDateKey(referenceDate))
  const weekStart = weekDays[0]?.key ?? referenceDate
  const weeklyStats = allStats.filter(
    (day) => day.date >= weekStart && day.date <= referenceDate,
  )
  const weeklyXp = weeklyStats.reduce((total, day) => total + day.xpEarned, 0)
  const weeklyAdherence = calculateWeeklyAdherence(weeklyStats)

  const today = allStats[allStats.length - 1]
  const todayCompletion = today?.completionPercent ?? 0
  const weeklyQualifiedDays = weeklyStats.filter((day) => day.countsForStreak).length
  const weeklyScheduledDays = weeklyStats.filter((day) => day.scheduledCount > 0).length

  return {
    xpTotal,
    weeklyXp,
    currentStreak,
    bestStreak,
    weeklyAdherence,
    todayCompletion,
    badges: deriveExerciseBadges({
      xpTotal,
      currentStreak,
      bestStreak,
      weeklyAdherence,
      todayCompletion,
    }),
    weeklyQualifiedDays,
    weeklyScheduledDays,
  }
}

export function toExerciseProfileDocument(
  userId: string,
  summary: ExerciseProgressSummary,
  templateVersion: string | null,
): Omit<ExerciseProfileDocument, 'createdAt' | 'updatedAt'> {
  return {
    id: userId,
    userId,
    xpTotal: summary.xpTotal,
    weeklyXp: summary.weeklyXp,
    currentStreak: summary.currentStreak,
    bestStreak: summary.bestStreak,
    weeklyAdherence: summary.weeklyAdherence,
    badges: summary.badges,
    defaultTemplateVersionImported: templateVersion,
    rivalUid: null,
  }
}
