import { describe, expect, it } from 'vitest'

import { getDefaultExerciseTemplate } from '@/lib/exercise-template'
import { getMissingTemplateItems } from '@/services/exercise-import-service'
import type { ExerciseWorkoutDocument } from '@/types/models'

function makeImportedWorkout(templateItemId: string): ExerciseWorkoutDocument {
  return {
    id: templateItemId,
    userId: 'user-1',
    templateItemId,
    name: templateItemId,
    weekday: 'monday',
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

describe('exercise import helper', () => {
  it('returns all template items when no defaults are imported', () => {
    const missing = getMissingTemplateItems([])
    expect(missing.length).toBe(getDefaultExerciseTemplate().items.length)
  })

  it('skips template items that already exist in user workouts', () => {
    const template = getDefaultExerciseTemplate()
    const existing = template.items.slice(0, 2).map((item) => makeImportedWorkout(item.templateItemId))

    const missing = getMissingTemplateItems(existing)

    expect(missing.length).toBe(template.items.length - 2)
    expect(missing.some((item) => item.templateItemId === template.items[0]?.templateItemId)).toBe(false)
  })

  it('is idempotent after all template items are imported', () => {
    const template = getDefaultExerciseTemplate()
    const existing = template.items.map((item) => makeImportedWorkout(item.templateItemId))

    const missing = getMissingTemplateItems(existing)

    expect(missing).toHaveLength(0)
  })
})
