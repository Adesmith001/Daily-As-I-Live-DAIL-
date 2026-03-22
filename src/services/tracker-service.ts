import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type { TrackerDocument, TrackerFormValues } from '@/types/models'

export function subscribeToTrackers(
  uid: string,
  onData: (trackers: TrackerDocument[]) => void,
) {
  const trackersQuery = query(
    collection(db, 'trackers'),
    where('userId', '==', uid),
    orderBy('displayOrder', 'asc'),
  )

  return onSnapshot(trackersQuery, (snapshot) => {
    onData(snapshot.docs.map((item) => item.data() as TrackerDocument))
  })
}

export async function createTracker(
  uid: string,
  values: TrackerFormValues,
  displayOrder: number,
) {
  const trackerRef = doc(collection(db, 'trackers'))

  await setDoc(trackerRef, {
    id: trackerRef.id,
    userId: uid,
    name: values.name.trim(),
    type: values.type,
    description: values.description.trim(),
    isActive: values.isActive,
    displayOrder,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies Omit<TrackerDocument, 'createdAt' | 'updatedAt'> & {
    createdAt: unknown
    updatedAt: unknown
  })
}

export async function updateTracker(
  trackerId: string,
  values: Partial<TrackerFormValues>,
) {
  await updateDoc(doc(db, 'trackers', trackerId), {
    ...(values.name !== undefined ? { name: values.name.trim() } : {}),
    ...(values.description !== undefined
      ? { description: values.description.trim() }
      : {}),
    ...(values.isActive !== undefined ? { isActive: values.isActive } : {}),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTracker(trackerId: string) {
  await deleteDoc(doc(db, 'trackers', trackerId))
}

export async function reorderTracker(
  trackers: TrackerDocument[],
  trackerId: string,
  direction: 'up' | 'down',
) {
  const index = trackers.findIndex((tracker) => tracker.id === trackerId)
  if (index === -1) {
    return
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= trackers.length) {
    return
  }

  const current = trackers[index]
  const target = trackers[targetIndex]
  const batch = writeBatch(db)

  batch.update(doc(db, 'trackers', current.id), {
    displayOrder: target.displayOrder,
    updatedAt: serverTimestamp(),
  })
  batch.update(doc(db, 'trackers', target.id), {
    displayOrder: current.displayOrder,
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
}
