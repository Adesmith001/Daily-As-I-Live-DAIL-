import { FirebaseError } from 'firebase/app'

export function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.'
  }

  switch (error.code) {
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Google sign in. Add it in Firebase Authentication > Settings > Authorized domains.'
    case 'auth/popup-blocked':
      return 'The Google popup was blocked by your browser. Allow popups and try again.'
    case 'auth/popup-closed-by-user':
      return 'The Google popup was closed before sign in completed.'
    case 'auth/operation-not-allowed':
      return 'Google sign in is not enabled for this Firebase project.'
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.'
    case 'auth/cancelled-popup-request':
      return 'Another sign-in popup is already open. Close it and try again.'
    case 'auth/network-request-failed':
      return 'A network error stopped Google sign in. Check your connection and try again.'
    default:
      return `${error.code}: ${error.message}`
  }
}
