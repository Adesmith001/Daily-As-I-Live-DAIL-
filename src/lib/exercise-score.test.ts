import { describe, expect, it } from 'vitest'

import { buildExerciseProgressSummary, calculateDayCompletion, calculateDayXp, dayCountsForStreak } from '@/lib/exercise-score'
import type { ExerciseEntryDocument, ExerciseWorkoutDocument } from '@/types/models'

function makeWorkout(
  id: string,
  weekday: ExerciseWorkoutDocument['weekday'],
): ExerciseWorkoutDocument {
  return {
    id,
    userId: 'user-1',
    templateItemId: null,
    name: `Workout ${id}`,
    weekday,
    weekdayOrder: 0,
    category: 'workout',
    description: '',
    target: '3 sets',
    videoUrl: '',
    videoSearchQuery: '',
    isActive: true,
    displayOrder: 0,
    createdAt: null,
    updatedAt: null,
  }
}

function makeEntry(
  workoutId: string,
  entryDate: string,
): ExerciseEntryDocument {
  return {
    id: `${workoutId}_${entryDate}`,
    userId: 'user-1',
    workoutId,
    entryDate,
    isCompleted: true,
    createdAt: null,
    updatedAt: null,
  }
}

describe('exercise score helpers', () => {
  it('calculates completion and streak eligibility from percentages', () => {
    expect(calculateDayCompletion(4, 5)).toBe(80)
    expect(dayCountsForStreak(80, 5)).toBe(true)
    expect(dayCountsForStreak(79.9, 5)).toBe(false)
  })

  it('adds a day bonus when completion reaches 90%', () => {
    expect(calculateDayXp(4, 90)).toBe(60)
    expect(calculateDayXp(4, 89)).toBe(40)
  })

  it('builds progress summary with streak, weekly adherence, and xp totals', () => {
    const workouts = [
      makeWorkout('fri', 'friday'),
      makeWorkout('sat', 'saturday'),
      makeWorkout('sun', 'sunday'),
    ]

    const entries = [
      makeEntry('fri', '2026-04-10'),
      makeEntry('sat', '2026-04-11'),
      makeEntry('sun', '2026-04-12'),
    ]

    const summary = buildExerciseProgressSummary(workouts, entries, '2026-04-12')

    expect(summary.currentStreak).toBe(3)
    expect(summary.bestStreak).toBe(3)
    expect(summary.weeklyAdherence).toBe(100)
    expect(summary.xpTotal).toBe(90)
    expect(summary.badges).toContain('3-Day Streak')
    expect(summary.badges).toContain('Weekly 80%')
  })
})
