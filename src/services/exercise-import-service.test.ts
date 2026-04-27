import { describe, expect, it } from 'vitest'

import { getDefaultExerciseTemplate, getExerciseTemplates } from '@/lib/exercise-template'
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
    const template = getDefaultExerciseTemplate()
    const missing = getMissingTemplateItems({
      existingWorkouts: [],
      templateId: template.templateId,
    })
    expect(missing.length).toBe(getDefaultExerciseTemplate().items.length)
  })

  it('skips template items that already exist in user workouts', () => {
    const template = getDefaultExerciseTemplate()
    const existing = template.items.slice(0, 2).map((item) => makeImportedWorkout(item.templateItemId))

    const missing = getMissingTemplateItems({
      existingWorkouts: existing,
      templateId: template.templateId,
    })

    expect(missing.length).toBe(template.items.length - 2)
    expect(missing.some((item) => item.templateItemId === template.items[0]?.templateItemId)).toBe(false)
  })

  it('is idempotent after all template items are imported', () => {
    const template = getDefaultExerciseTemplate()
    const existing = template.items.map((item) => makeImportedWorkout(item.templateItemId))

    const missing = getMissingTemplateItems({
      existingWorkouts: existing,
      templateId: template.templateId,
    })

    expect(missing).toHaveLength(0)
  })

  it('exposes male-v1 and shiela-v2 template options', () => {
    const templates = getExerciseTemplates()
    const templateIds = templates.map((template) => template.templateId)

    expect(templateIds).toContain('shiela-v2')
    expect(templateIds).toContain('male-v1')

    const maleTemplate = templates.find((template) => template.templateId === 'male-v1')
    expect(maleTemplate?.items.length).toBeGreaterThan(0)
    expect(maleTemplate?.items.every((item) => item.target.trim().length > 0)).toBe(true)
    expect(new Set(maleTemplate?.items.map((item) => item.weekday))).toEqual(new Set([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]))
  })

  it('filters missing items against selected template only', () => {
    const templates = getExerciseTemplates()
    const shiela = templates.find((template) => template.templateId === 'shiela-v2')
    const male = templates.find((template) => template.templateId === 'male-v1')

    expect(shiela).toBeTruthy()
    expect(male).toBeTruthy()

    const mixedExisting = [
      makeImportedWorkout(shiela!.items[0]!.templateItemId),
      makeImportedWorkout(male!.items[0]!.templateItemId),
    ]

    const missingForMale = getMissingTemplateItems({
      existingWorkouts: mixedExisting,
      templateId: 'male-v1',
    })

    expect(missingForMale).toHaveLength(male!.items.length - 1)
    expect(
      missingForMale.some((item) => item.templateItemId === male!.items[0]!.templateItemId),
    ).toBe(false)
  })
})
