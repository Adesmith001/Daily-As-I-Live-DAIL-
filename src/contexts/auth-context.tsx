import {
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { auth } from '@/lib/firebase'
import { subscribeToUserProfile } from '@/services/user-service'
import type { UserDocument } from '@/types/models'

interface AuthContextValue {
  user: User | null
  profile: UserDocument | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserDocument | null>(null)
  const [loading, setLoading] = useState(Boolean(auth))

  useEffect(() => {
    if (!auth) {
      return
    }

    let unsubscribeProfile: () => void = () => {}

    const unsubscribeAuth = onAuthStateChanged(auth, (nextUser) => {
      unsubscribeProfile()

      if (!nextUser) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setUser(nextUser)
      setLoading(true)

      unsubscribeProfile = subscribeToUserProfile(nextUser.uid, (nextProfile) => {
        setProfile(nextProfile)
        setLoading(false)
      })
    })

    return () => {
      unsubscribeAuth()
      unsubscribeProfile()
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
    }),
    [loading, profile, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
