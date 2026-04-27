import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type { ExerciseLeaderboardPublicDocument } from '@/types/models'

function requireDb() {
  if (!db) {
    throw new Error('Cloud Firestore is not configured.')
  }

  return db
}

function getLeaderboardRef(uid: string) {
  return doc(requireDb(), 'exerciseLeaderboardPublic', uid)
}

export function sortExerciseLeaderboardRows(rows: ExerciseLeaderboardPublicDocument[]) {
  return [...rows].sort((left, right) => {
    if (right.weeklyXp !== left.weeklyXp) {
      return right.weeklyXp - left.weeklyXp
    }

    if (right.weeklyAdherence !== left.weeklyAdherence) {
      return right.weeklyAdherence - left.weeklyAdherence
    }

    if (right.currentStreak !== left.currentStreak) {
      return right.currentStreak - left.currentStreak
    }

    return left.displayName.localeCompare(right.displayName)
  })
}

export function subscribeToExerciseLeaderboardGlobal(
  onData: (rows: ExerciseLeaderboardPublicDocument[]) => void,
) {
  if (!db) {
    onData([])
    return () => {}
  }

  const leaderboardQuery = query(
    collection(db, 'exerciseLeaderboardPublic'),
    orderBy('weeklyXp', 'desc'),
    orderBy('weeklyAdherence', 'desc'),
    orderBy('currentStreak', 'desc'),
    limit(100),
  )

  return onSnapshot(leaderboardQuery, (snapshot) => {
    onData(
      sortExerciseLeaderboardRows(
        snapshot.docs.map((item) => item.data() as ExerciseLeaderboardPublicDocument),
      ),
    )
  })
}

export async function upsertExerciseLeaderboardPublic(params: {
  uid: string
  displayName: string
  weeklyXp: number
  xpTotal: number
  weeklyAdherence: number
  currentStreak: number
}) {
  await setDoc(
    getLeaderboardRef(params.uid),
    {
      id: params.uid,
      userId: params.uid,
      displayName: params.displayName.trim() || 'DAIL member',
      weeklyXp: params.weeklyXp,
      xpTotal: params.xpTotal,
      weeklyAdherence: params.weeklyAdherence,
      currentStreak: params.currentStreak,
      updatedAt: serverTimestamp(),
    } satisfies Omit<ExerciseLeaderboardPublicDocument, 'updatedAt'> & {
      updatedAt: unknown
    },
    { merge: true },
  )
}
