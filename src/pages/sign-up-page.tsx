import { useState, type FormEvent } from 'react'
import { Chrome } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isEmail } from '@/lib/utils'
import { signInWithGoogle, signUpWithEmail } from '@/services/auth-service'

export function SignUpPage() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!displayName.trim()) {
      setError('Add a display name.')
      return
    }

    if (!isEmail(email)) {
      setError('Enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setError('Use at least 6 characters for the password.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await signUpWithEmail({ displayName, email, password })
      toast.success('Account created')
      navigate('/today', { replace: true })
    } catch {
      setError('That sign up attempt failed. Try again with a different email.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError('')

    try {
      await signInWithGoogle()
      toast.success('Account created with Google')
      navigate('/today', { replace: true })
    } catch {
      setError('Google sign in could not be completed. Check the provider setup and try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <AuthCard
      title="Create account"
      description="Start your private daily tracker in a minute."
      footerLabel="Sign in"
      footerLink="/signin"
      footerText="Already have an account?"
    >
      <div className="space-y-5">
        <Button
          className="w-full"
          disabled={googleLoading || loading}
          type="button"
          variant="outline"
          onClick={() => void handleGoogleSignIn()}
        >
          <Chrome className="size-4" />
          {googleLoading ? 'Connecting Google...' : 'Continue with Google'}
        </Button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="signup-name">Display name</Label>
            <Input
              id="signup-name"
              autoComplete="name"
              placeholder="Amina"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              autoComplete="email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              autoComplete="new-password"
              placeholder="Create a password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-confirm">Confirm password</Label>
            <Input
              id="signup-confirm"
              autoComplete="new-password"
              placeholder="Repeat password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button className="w-full" disabled={loading || googleLoading} type="submit">
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </div>
    </AuthCard>
  )
}
