import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'

import { db } from '@/lib/firebase'
import { DEFAULT_THEME } from '@/lib/themes'
import type { AppTheme, UserDocument } from '@/types/models'

export async function createUserDocument(user: User, displayName?: string) {
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    displayName: displayName?.trim() || user.displayName || 'DAIL member',
    email: user.email || '',
    theme: DEFAULT_THEME,
    createdAt: serverTimestamp(),
  } satisfies Omit<UserDocument, 'createdAt'> & { createdAt: unknown })
}

export async function ensureUserDocument(user: User, displayName?: string) {
  const userRef = doc(db, 'users', user.uid)
  const existingUser = await getDoc(userRef)

  if (!existingUser.exists()) {
    await createUserDocument(user, displayName)
    return
  }

  const existingData = existingUser.data() as UserDocument
  const nextDisplayName =
    displayName?.trim() || user.displayName || existingData.displayName || 'DAIL member'

  if (nextDisplayName && nextDisplayName !== existingData.displayName) {
    await updateDoc(userRef, {
      displayName: nextDisplayName,
    })
  }
}

export function subscribeToUserProfile(
  uid: string,
  onData: (user: UserDocument | null) => void,
) {
  return onSnapshot(doc(db, 'users', uid), (snapshot) => {
    onData(snapshot.exists() ? (snapshot.data() as UserDocument) : null)
  })
}

export async function updateUserTheme(uid: string, theme: AppTheme) {
  await updateDoc(doc(db, 'users', uid), {
    theme,
  })
}

export async function updateUserDisplayName(uid: string, displayName: string) {
  await updateDoc(doc(db, 'users', uid), {
    displayName: displayName.trim(),
  })
}
