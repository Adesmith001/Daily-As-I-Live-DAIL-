import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { useAuth } from '@/contexts/auth-context'
import { DEFAULT_THEME } from '@/lib/themes'
import { updateUserTheme } from '@/services/user-service'
import type { AppTheme } from '@/types/models'

interface ThemeContextValue {
  theme: AppTheme
  applyTheme: (theme: AppTheme) => Promise<void>
  savingTheme: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const [theme, setTheme] = useState<AppTheme>(DEFAULT_THEME)
  const [savingTheme, setSavingTheme] = useState(false)

  useEffect(() => {
    setTheme(profile?.theme ?? DEFAULT_THEME)
  }, [profile?.theme])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const applyTheme = useCallback(async (nextTheme: AppTheme) => {
    const previousTheme = theme
    setTheme(nextTheme)

    if (!user) {
      return
    }

    setSavingTheme(true)
    try {
      await updateUserTheme(user.uid, nextTheme)
    } catch (error) {
      setTheme(previousTheme)
      throw error
    } finally {
      setSavingTheme(false)
    }
  }, [theme, user])

  const value = useMemo(
    () => ({
      theme,
      applyTheme,
      savingTheme,
    }),
    [applyTheme, savingTheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
