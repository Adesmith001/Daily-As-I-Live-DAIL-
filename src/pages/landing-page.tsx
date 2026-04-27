import { ArrowRight, CheckSquare, Palette, Sparkles, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

import { FirebaseBanner } from '@/components/common/firebase-banner'
import { InstallAppButton } from '@/components/common/install-app-button'
import { LogoMark } from '@/components/common/logo-mark'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { THEME_OPTIONS } from '@/lib/themes'

const featureCards = [
  {
    title: 'Fast daily logging',
    body: 'Tap through checkbox and 0-10 trackers with a calm, uncluttered flow.',
    icon: CheckSquare,
  },
  {
    title: 'Soft personal themes',
    body: 'Choose the atmosphere that fits your rhythm and keep it synced per user.',
    icon: Palette,
  },
  {
    title: 'Scores, streaks, charts',
    body: 'See your day out of 10, weekly summary, streaks, and gentle trend lines.',
    icon: TrendingUp,
  },
]

export function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="app-frame gap-6 pb-12">
      <header className="flex flex-wrap items-center justify-between gap-4 py-2">
        <LogoMark />
        <div className="flex flex-wrap justify-end gap-2">
          <InstallAppButton variant="outline" />
          <Button asChild variant="ghost">
            <Link to={user ? '/today' : '/signin'}>{user ? 'Open app' : 'Sign in'}</Link>
          </Button>
          <Button asChild>
            <Link to={user ? '/today' : '/signup'}>{user ? 'Go to today' : 'Get started'}</Link>
          </Button>
        </div>
      </header>

      <FirebaseBanner />

      <section className="page-header pb-8 pt-4">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-6">
            <p className="theme-chip inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
              <Sparkles className="size-4" />
              Daily As I Live
            </p>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-balance text-5xl sm:text-6xl">
                A premium daily tracker built for the quiet discipline of ordinary days.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                DAIL keeps your daily habits, feelings, and check-ins private,
                elegant, and effortless. Build custom trackers, log today in seconds,
                and revisit your patterns with scores, streaks, charts, and weekly
                summaries.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to={user ? '/today' : '/signup'}>
                  {user ? 'Continue to dashboard' : 'Create your account'}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <InstallAppButton size="lg" variant="outline" />
              <Button asChild variant="outline" size="lg">
                <Link to={user ? '/history' : '/signin'}>See the flow</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="section-block space-y-4">
              <div className="flex items-center justify-between">
                <p className="section-kicker">Snapshot</p>
                <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                  8.4/10
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="theme-card-muted p-4">
                  <p className="section-kicker">Streak</p>
                  <p className="mt-2 text-2xl font-semibold">9</p>
                </div>
                <div className="theme-card-muted p-4">
                  <p className="section-kicker">Week avg</p>
                  <p className="mt-2 text-2xl font-semibold">7.8</p>
                </div>
                <div className="theme-card-muted p-4">
                  <p className="section-kicker">Active</p>
                  <p className="mt-2 text-2xl font-semibold">5</p>
                </div>
              </div>
            </div>

            <div className="section-block space-y-4">
              <div>
                <p className="section-kicker">Theme moods</p>
                <h2 className="mt-2 text-2xl">Choose your tone</h2>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {THEME_OPTIONS.map((theme) => (
                  <div
                    key={theme.name}
                    className="rounded-xl border p-2"
                    style={{
                      backgroundColor: `hsl(${theme.preview.background})`,
                      borderColor: `hsl(${theme.preview.border})`,
                    }}
                  >
                    <div
                      className="mb-2 h-6 rounded-md"
                      style={{ backgroundColor: `hsl(${theme.preview.primary})` }}
                    />
                    <div
                      className="h-3 rounded-md"
                      style={{ backgroundColor: `hsl(${theme.preview.accent})` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {featureCards.map((feature) => (
          <div key={feature.title} className="section-block space-y-4">
            <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-muted text-foreground">
              <feature.icon className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {feature.body}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
