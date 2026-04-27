import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore'

import { getExerciseWeekdayOrder } from '@/lib/date'
import { db } from '@/lib/firebase'
import {
  getDefaultExerciseTemplate,
  getExerciseTemplateById,
  getExerciseTemplates,
} from '@/lib/exercise-template'
import type { ExerciseWorkoutDocument } from '@/types/models'

function requireDb() {
  if (!db) {
    throw new Error('Cloud Firestore is not configured.')
  }

  return db
}

function getMaxOrderByWeekday(existingWorkouts: ExerciseWorkoutDocument[]) {
  const maxByWeekday = new Map<string, number>()

  for (const workout of existingWorkouts) {
    const current = maxByWeekday.get(workout.weekday) ?? -1
    maxByWeekday.set(workout.weekday, Math.max(current, workout.displayOrder))
  }

  return maxByWeekday
}

export async function importExerciseTemplate(params: {
  uid: string
  templateId: string
  existingWorkouts: ExerciseWorkoutDocument[]
}) {
  const database = requireDb()
  const template = getExerciseTemplateById(params.templateId)
  if (!template) {
    throw new Error(`Unknown exercise template: ${params.templateId}`)
  }

  const allTemplateItemIds = new Set(
    getExerciseTemplates().flatMap((item) => item.items.map((workout) => workout.templateItemId)),
  )
  const selectedTemplateItemIds = new Set(template.items.map((item) => item.templateItemId))

  const workoutsToRemove = params.existingWorkouts.filter((workout) =>
    workout.templateItemId
      ? allTemplateItemIds.has(workout.templateItemId) &&
        !selectedTemplateItemIds.has(workout.templateItemId)
      : false,
  )

  const remainingWorkouts = params.existingWorkouts.filter((workout) =>
    !workoutsToRemove.some((item) => item.id === workout.id),
  )

  const itemsToImport = getMissingTemplateItems({
    existingWorkouts: remainingWorkouts,
    templateId: params.templateId,
  })
  const maxOrderByWeekday = getMaxOrderByWeekday(remainingWorkouts)
  const batch = writeBatch(database)

  let importedCount = 0

  for (const workout of workoutsToRemove) {
    batch.delete(doc(database, 'exerciseWorkouts', workout.id))
  }

  for (const item of itemsToImport) {
    const nextDisplayOrder = (maxOrderByWeekday.get(item.weekday) ?? -1) + 1
    maxOrderByWeekday.set(item.weekday, nextDisplayOrder)

    const workoutRef = doc(collection(database, 'exerciseWorkouts'))

    batch.set(workoutRef, {
      id: workoutRef.id,
      userId: params.uid,
      templateItemId: item.templateItemId,
      name: item.name,
      weekday: item.weekday,
      weekdayOrder: getExerciseWeekdayOrder(item.weekday),
      category: item.category,
      description: item.description,
      target: item.target,
      videoUrl: item.videoUrl,
      videoSearchQuery: item.videoSearchQuery,
      isActive: true,
      displayOrder: nextDisplayOrder,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    importedCount += 1
  }

  if (importedCount > 0) {
    await batch.commit()
  }

  return {
    importedCount,
    removedCount: workoutsToRemove.length,
    templateVersion: template.version,
  }
}

export async function importDefaultExerciseTemplate(params: {
  uid: string
  existingWorkouts: ExerciseWorkoutDocument[]
}) {
  const defaultTemplate = getDefaultExerciseTemplate()
  return importExerciseTemplate({
    uid: params.uid,
    templateId: defaultTemplate.templateId,
    existingWorkouts: params.existingWorkouts,
  })
}

export function getMissingTemplateItems(params: {
  existingWorkouts: ExerciseWorkoutDocument[]
  templateId: string
}) {
  const template = getExerciseTemplateById(params.templateId)
  if (!template) {
    return []
  }

  const existingTemplateIds = new Set(
    params.existingWorkouts
      .map((workout) => workout.templateItemId)
      .filter((value): value is string => Boolean(value)),
  )

  return template.items.filter((item) => !existingTemplateIds.has(item.templateItemId))
}
