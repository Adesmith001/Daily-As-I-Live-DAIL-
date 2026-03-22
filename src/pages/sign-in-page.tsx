import { useState, type FormEvent } from 'react'
import { Chrome } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isEmail } from '@/lib/utils'
import { signInWithEmail, signInWithGoogle } from '@/services/auth-service'

export function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isEmail(email)) {
      setError('Enter a valid email address.')
      return
    }

    if (!password) {
      setError('Enter your password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await signInWithEmail({ email, password })
      toast.success('Welcome back')
      navigate('/today', { replace: true })
    } catch {
      setError('That sign in attempt failed. Check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError('')

    try {
      await signInWithGoogle()
      toast.success('Welcome in')
      navigate('/today', { replace: true })
    } catch {
      setError('Google sign in could not be completed. Check the provider setup and try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <AuthCard
      title="Sign in"
      description="Return to your private daily space."
      footerLabel="Create account"
      footerLink="/signup"
      footerText="New to DAIL?"
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
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              autoComplete="email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <Input
              id="signin-password"
              autoComplete="current-password"
              placeholder="Your password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button className="w-full" disabled={loading || googleLoading} type="submit">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </AuthCard>
  )
}
