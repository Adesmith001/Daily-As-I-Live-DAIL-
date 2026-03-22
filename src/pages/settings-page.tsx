import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { ThemePicker } from '@/components/settings/theme-picker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { updateUserDisplayName } from '@/services/user-service'

export function SettingsPage() {
  const { user, profile } = useAuth()
  const { theme, applyTheme, savingTheme } = useTheme()
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    setDisplayName(profile?.displayName ?? '')
  }, [profile?.displayName])

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) {
      return
    }

    if (!displayName.trim()) {
      toast.error('Display name cannot be empty.')
      return
    }

    setSavingProfile(true)
    try {
      await updateUserDisplayName(user.uid, displayName)
      toast.success('Profile updated')
    } catch {
      toast.error('Could not update your profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleThemeChange(nextTheme: typeof theme) {
    try {
      await applyTheme(nextTheme)
      toast.success(`${nextTheme} theme applied`)
    } catch {
      toast.error('Could not save your theme.')
    }
  }

  return (
    <div className="space-y-6">
      <ThemePicker saving={savingTheme} value={theme} onChange={handleThemeChange} />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSaveProfile}>
            <div className="space-y-2">
              <Label htmlFor="settings-display-name">Display name</Label>
              <Input
                id="settings-display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input disabled id="settings-email" value={profile?.email ?? ''} />
            </div>

            <Button disabled={savingProfile} type="submit">
              {savingProfile ? 'Saving...' : 'Save profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
