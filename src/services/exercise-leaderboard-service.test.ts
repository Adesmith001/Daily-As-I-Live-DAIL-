import { describe, expect, it } from 'vitest'

import { sortExerciseLeaderboardRows } from '@/services/exercise-leaderboard-service'
import type { ExerciseLeaderboardPublicDocument } from '@/types/models'

function makeRow(
  userId: string,
  displayName: string,
  weeklyXp: number,
  weeklyAdherence: number,
  currentStreak: number,
): ExerciseLeaderboardPublicDocument {
  return {
    id: userId,
    userId,
    displayName,
    weeklyXp,
    xpTotal: weeklyXp * 2,
    weeklyAdherence,
    currentStreak,
    updatedAt: null,
  }
}

describe('exercise leaderboard sorting', () => {
  it('sorts by weekly XP, then adherence, then streak', () => {
    const rows = [
      makeRow('u3', 'Chris', 120, 70, 5),
      makeRow('u1', 'Alex', 150, 80, 2),
      makeRow('u2', 'Ben', 150, 90, 1),
      makeRow('u4', 'Drew', 150, 90, 3),
    ]

    const sorted = sortExerciseLeaderboardRows(rows)

    expect(sorted.map((row) => row.userId)).toEqual(['u4', 'u2', 'u1', 'u3'])
  })

  it('falls back to display name for fully-equal metrics', () => {
    const rows = [
      makeRow('u2', 'Ben', 120, 80, 2),
      makeRow('u1', 'Alex', 120, 80, 2),
    ]

    const sorted = sortExerciseLeaderboardRows(rows)

    expect(sorted.map((row) => row.displayName)).toEqual(['Alex', 'Ben'])
  })
})
