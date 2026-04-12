import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'

import { getExerciseWeekdayOrder } from '@/lib/date'
import { db } from '@/lib/firebase'
import type {
  ExerciseWorkoutDocument,
  ExerciseWorkoutFormValues,
} from '@/types/models'

function requireDb() {
  if (!db) {
    throw new Error('Cloud Firestore is not configured.')
  }

  return db
}

export function subscribeToExerciseWorkouts(
  uid: string,
  onData: (workouts: ExerciseWorkoutDocument[]) => void,
) {
  if (!db) {
    onData([])
    return () => {}
  }

  const workoutsQuery = query(
    collection(db, 'exerciseWorkouts'),
    where('userId', '==', uid),
    orderBy('weekdayOrder', 'asc'),
    orderBy('displayOrder', 'asc'),
  )

  return onSnapshot(workoutsQuery, (snapshot) => {
    onData(snapshot.docs.map((item) => item.data() as ExerciseWorkoutDocument))
  })
}

export async function createExerciseWorkout(
  uid: string,
  values: ExerciseWorkoutFormValues,
  displayOrder: number,
  templateItemId?: string | null,
) {
  const database = requireDb()
  const workoutRef = doc(collection(database, 'exerciseWorkouts'))

  await setDoc(workoutRef, {
    id: workoutRef.id,
    userId: uid,
    templateItemId: templateItemId ?? null,
    name: values.name.trim(),
    weekday: values.weekday,
    weekdayOrder: getExerciseWeekdayOrder(values.weekday),
    category: values.category,
    description: values.description.trim(),
    target: values.target.trim(),
    videoUrl: values.videoUrl.trim(),
    videoSearchQuery: values.videoSearchQuery.trim(),
    isActive: values.isActive,
    displayOrder,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies Omit<ExerciseWorkoutDocument, 'createdAt' | 'updatedAt'> & {
    createdAt: unknown
    updatedAt: unknown
  })
}

export async function updateExerciseWorkout(
  workoutId: string,
  values: Partial<ExerciseWorkoutFormValues> & { displayOrder?: number },
) {
  const updatePayload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  }

  if (values.name !== undefined) {
    updatePayload.name = values.name.trim()
  }

  if (values.weekday !== undefined) {
    updatePayload.weekday = values.weekday
    updatePayload.weekdayOrder = getExerciseWeekdayOrder(values.weekday)
  }

  if (values.category !== undefined) {
    updatePayload.category = values.category
  }

  if (values.description !== undefined) {
    updatePayload.description = values.description.trim()
  }

  if (values.target !== undefined) {
    updatePayload.target = values.target.trim()
  }

  if (values.videoUrl !== undefined) {
    updatePayload.videoUrl = values.videoUrl.trim()
  }

  if (values.videoSearchQuery !== undefined) {
    updatePayload.videoSearchQuery = values.videoSearchQuery.trim()
  }

  if (values.isActive !== undefined) {
    updatePayload.isActive = values.isActive
  }

  if (values.displayOrder !== undefined) {
    updatePayload.displayOrder = values.displayOrder
  }

  await updateDoc(doc(requireDb(), 'exerciseWorkouts', workoutId), updatePayload)
}

export async function deleteExerciseWorkout(workoutId: string) {
  await deleteDoc(doc(requireDb(), 'exerciseWorkouts', workoutId))
}

export async function reorderExerciseWorkout(
  workoutsForDay: ExerciseWorkoutDocument[],
  workoutId: string,
  direction: 'up' | 'down',
) {
  const index = workoutsForDay.findIndex((workout) => workout.id === workoutId)
  if (index === -1) {
    return
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= workoutsForDay.length) {
    return
  }

  const current = workoutsForDay[index]
  const target = workoutsForDay[targetIndex]
  const database = requireDb()
  const batch = writeBatch(database)

  batch.update(doc(database, 'exerciseWorkouts', current.id), {
    displayOrder: target.displayOrder,
    updatedAt: serverTimestamp(),
  })

  batch.update(doc(database, 'exerciseWorkouts', target.id), {
    displayOrder: current.displayOrder,
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
}
