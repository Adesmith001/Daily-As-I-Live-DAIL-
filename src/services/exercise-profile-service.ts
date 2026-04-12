import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type { ExerciseProfileDocument } from '@/types/models'

function requireDb() {
  if (!db) {
    throw new Error('Cloud Firestore is not configured.')
  }

  return db
}

function getProfileRef(uid: string) {
  return doc(requireDb(), 'exerciseProfiles', uid)
}

export function subscribeToExerciseProfile(
  uid: string,
  onData: (profile: ExerciseProfileDocument | null) => void,
  onError?: (error: unknown) => void,
) {
  if (!db) {
    onData(null)
    return () => {}
  }

  return onSnapshot(
    getProfileRef(uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null)
        return
      }

      onData(snapshot.data() as ExerciseProfileDocument)
    },
    (error) => {
      onData(null)
      onError?.(error)
    },
  )
}

export async function getExerciseProfile(uid: string) {
  const snapshot = await getDoc(getProfileRef(uid))
  if (!snapshot.exists()) {
    return null
  }

  return snapshot.data() as ExerciseProfileDocument
}

export async function upsertExerciseProfile(
  uid: string,
  values: Omit<ExerciseProfileDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & {
    defaultTemplateVersionImported?: string | null
  },
) {
  let existing: ExerciseProfileDocument | null = null
  try {
    existing = await getExerciseProfile(uid)
  } catch (error) {
    const code =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : ''

    if (code !== 'permission-denied') {
      throw error
    }
  }

  await setDoc(
    getProfileRef(uid),
    {
      id: uid,
      userId: uid,
      xpTotal: values.xpTotal,
      currentStreak: values.currentStreak,
      bestStreak: values.bestStreak,
      weeklyAdherence: values.weeklyAdherence,
      badges: values.badges,
      defaultTemplateVersionImported:
        values.defaultTemplateVersionImported ??
        existing?.defaultTemplateVersionImported ??
        null,
      createdAt: existing?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    } satisfies Omit<ExerciseProfileDocument, 'createdAt' | 'updatedAt'> & {
      createdAt: unknown
      updatedAt: unknown
    },
  )
}
