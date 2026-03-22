import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'

import { auth } from '@/lib/firebase'
import { ensureUserDocument } from '@/services/user-service'

const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
  prompt: 'select_account',
})

function requireAuth() {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured.')
  }

  return auth
}

export async function signUpWithEmail(params: {
  displayName: string
  email: string
  password: string
}) {
  const credentials = await createUserWithEmailAndPassword(
    requireAuth(),
    params.email,
    params.password,
  )

  await updateProfile(credentials.user, {
    displayName: params.displayName.trim(),
  })

  await ensureUserDocument(credentials.user, params.displayName)
  return credentials.user
}

export async function signInWithEmail(params: {
  email: string
  password: string
}) {
  const credentials = await signInWithEmailAndPassword(
    requireAuth(),
    params.email,
    params.password,
  )

  return credentials.user
}

export async function signInWithGoogle() {
  const credentials = await signInWithPopup(requireAuth(), googleProvider)
  await ensureUserDocument(credentials.user)
  return credentials.user
}

export async function signOutUser() {
  await signOut(requireAuth())
}
