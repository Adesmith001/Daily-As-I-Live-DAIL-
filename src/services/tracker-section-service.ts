import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type { TrackerSectionDocument } from '@/types/models'

function requireDb() {
  if (!db) {
    throw new Error('Cloud Firestore is not configured.')
  }

  return db
}

export function subscribeToTrackerSections(
  uid: string,
  onData: (sections: TrackerSectionDocument[]) => void,
) {
  if (!db) {
    onData([])
    return () => {}
  }

  const sectionsQuery = query(
    collection(db, 'trackerSections'),
    where('userId', '==', uid),
    orderBy('displayOrder', 'asc'),
  )

  return onSnapshot(sectionsQuery, (snapshot) => {
    onData(snapshot.docs.map((item) => item.data() as TrackerSectionDocument))
  })
}

export async function createTrackerSection(
  uid: string,
  name: string,
  displayOrder: number,
) {
  const database = requireDb()
  const sectionRef = doc(collection(database, 'trackerSections'))

  await setDoc(sectionRef, {
    id: sectionRef.id,
    userId: uid,
    name: name.trim(),
    displayOrder,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies Omit<TrackerSectionDocument, 'createdAt' | 'updatedAt'> & {
    createdAt: unknown
    updatedAt: unknown
  })
}
