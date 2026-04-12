import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore'

import { getExerciseWeekdayOrder } from '@/lib/date'
import { db } from '@/lib/firebase'
import { getDefaultExerciseTemplate } from '@/lib/exercise-template'
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

export async function importDefaultExerciseTemplate(params: {
  uid: string
  existingWorkouts: ExerciseWorkoutDocument[]
}) {
  const database = requireDb()
  const template = getDefaultExerciseTemplate()
  const itemsToImport = getMissingTemplateItems(params.existingWorkouts, template.version)
  const maxOrderByWeekday = getMaxOrderByWeekday(params.existingWorkouts)
  const batch = writeBatch(database)

  let importedCount = 0

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
    templateVersion: template.version,
  }
}

export function getMissingTemplateItems(
  existingWorkouts: ExerciseWorkoutDocument[],
  templateVersion = getDefaultExerciseTemplate().version,
) {
  const template = getDefaultExerciseTemplate()
  if (template.version !== templateVersion) {
    return template.items
  }

  const existingTemplateIds = new Set(
    existingWorkouts
      .map((workout) => workout.templateItemId)
      .filter((value): value is string => Boolean(value)),
  )

  return template.items.filter((item) => !existingTemplateIds.has(item.templateItemId))
}
