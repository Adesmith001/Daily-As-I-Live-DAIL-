import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type { ExerciseEntryDocument } from '@/types/models'

function requireDb() {
  if (!db) {
    throw new Error('Cloud Firestore is not configured.')
  }

  return db
}

export function getExerciseEntryId(
  userId: string,
  workoutId: string,
  entryDate: string,
) {
  return `${userId}_${workoutId}_${entryDate}`
}

export function subscribeToExerciseEntriesByDate(
  uid: string,
  entryDate: string,
  onData: (entries: ExerciseEntryDocument[]) => void,
) {
  if (!db) {
    onData([])
    return () => {}
  }

  const entriesQuery = query(
    collection(db, 'exerciseEntries'),
    where('userId', '==', uid),
    where('entryDate', '==', entryDate),
  )

  return onSnapshot(entriesQuery, (snapshot) => {
    onData(snapshot.docs.map((item) => item.data() as ExerciseEntryDocument))
  })
}

export function subscribeToExerciseHistoryEntries(
  uid: string,
  onData: (entries: ExerciseEntryDocument[]) => void,
) {
  if (!db) {
    onData([])
    return () => {}
  }

  const entriesQuery = query(
    collection(db, 'exerciseEntries'),
    where('userId', '==', uid),
    orderBy('entryDate', 'desc'),
  )

  return onSnapshot(entriesQuery, (snapshot) => {
    onData(snapshot.docs.map((item) => item.data() as ExerciseEntryDocument))
  })
}

export async function setExerciseCompletion(params: {
  userId: string
  workoutId: string
  entryDate: string
  isCompleted: boolean
  existingEntry?: ExerciseEntryDocument
}) {
  const id = getExerciseEntryId(params.userId, params.workoutId, params.entryDate)
  const entryRef = doc(requireDb(), 'exerciseEntries', id)

  if (!params.isCompleted) {
    await deleteDoc(entryRef)
    return
  }

  await setDoc(entryRef, {
    id,
    userId: params.userId,
    workoutId: params.workoutId,
    entryDate: params.entryDate,
    isCompleted: true,
    createdAt: params.existingEntry?.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies Omit<ExerciseEntryDocument, 'createdAt' | 'updatedAt'> & {
    createdAt: unknown
    updatedAt: unknown
  })
}
