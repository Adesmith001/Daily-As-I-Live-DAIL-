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

import { clampRangeValue } from '@/lib/utils'
import { db } from '@/lib/firebase'
import type { DailyEntryDocument, TrackerDocument } from '@/types/models'

function requireDb() {
  if (!db) {
    throw new Error('Cloud Firestore is not configured.')
  }

  return db
}

export function getDailyEntryId(userId: string, trackerId: string, entryDate: string) {
  return `${userId}_${trackerId}_${entryDate}`
}

export function subscribeToEntriesByDate(
  uid: string,
  entryDate: string,
  onData: (entries: DailyEntryDocument[]) => void,
) {
  if (!db) {
    onData([])
    return () => {}
  }

  const entriesQuery = query(
    collection(db, 'dailyEntries'),
    where('userId', '==', uid),
    where('entryDate', '==', entryDate),
  )

  return onSnapshot(entriesQuery, (snapshot) => {
    onData(snapshot.docs.map((item) => item.data() as DailyEntryDocument))
  })
}

export function subscribeToHistoryEntries(
  uid: string,
  onData: (entries: DailyEntryDocument[]) => void,
) {
  if (!db) {
    onData([])
    return () => {}
  }

  const entriesQuery = query(
    collection(db, 'dailyEntries'),
    where('userId', '==', uid),
    orderBy('entryDate', 'desc'),
  )

  return onSnapshot(entriesQuery, (snapshot) => {
    onData(snapshot.docs.map((item) => item.data() as DailyEntryDocument))
  })
}

export async function upsertDailyEntry(params: {
  userId: string
  tracker: TrackerDocument
  entryDate: string
  value: boolean | number
  existingEntry?: DailyEntryDocument
}) {
  const id = getDailyEntryId(params.userId, params.tracker.id, params.entryDate)
  const entryRef = doc(requireDb(), 'dailyEntries', id)

  await setDoc(entryRef, {
    id,
    userId: params.userId,
    trackerId: params.tracker.id,
    entryDate: params.entryDate,
    checkboxValue:
      params.tracker.type === 'checkbox' ? Boolean(params.value) : null,
    rangeValue:
      params.tracker.type === 'range'
        ? clampRangeValue(Number(params.value))
        : null,
    createdAt: params.existingEntry?.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies Omit<DailyEntryDocument, 'createdAt' | 'updatedAt'> & {
    createdAt: unknown
    updatedAt: unknown
  })
}

export async function clearDailyEntry(
  userId: string,
  trackerId: string,
  entryDate: string,
) {
  await deleteDoc(
    doc(requireDb(), 'dailyEntries', getDailyEntryId(userId, trackerId, entryDate)),
  )
}
