import { Flame, Sparkles, Target } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface ExerciseProgressHeaderProps {
  todayCompletion: number
  currentStreak: number
  xpTotal: number
  weeklyXp: number
  weeklyAdherence: number
  badges: string[]
  pulse?: boolean
}

export function ExerciseProgressHeader({
  todayCompletion,
  currentStreak,
  xpTotal,
  weeklyXp,
  weeklyAdherence,
  badges,
  pulse = false,
}: ExerciseProgressHeaderProps) {
  const progressPercent = Math.max(0, Math.min(100, todayCompletion))

  return (
    <section className={cn('section-block space-y-5', pulse && 'ring-2 ring-primary/40')}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="theme-chip inline-flex items-center gap-2 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
            <Sparkles className="size-3.5" />
            Exercise progress
          </p>
          <div>
            <h2 className="text-3xl tracking-[-0.05em]">Current training week</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Clear completion, visible streaks, and a sharper view of consistency.
            </p>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="section-kicker">Today completion</span>
            <span className="font-semibold text-foreground">{progressPercent}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="theme-card-muted p-4">
          <p className="section-kicker">Current streak</p>
          <p className="mt-3 flex items-center gap-2 text-2xl font-semibold">
            <Flame className="size-5" />
            {currentStreak}
          </p>
        </div>
        <div className="theme-card-muted p-4">
          <p className="section-kicker">Weekly XP</p>
          <p className="mt-3 text-2xl font-semibold">{weeklyXp}</p>
        </div>
        <div className="theme-card-muted p-4">
          <p className="section-kicker">XP total</p>
          <p className="mt-3 text-2xl font-semibold">{xpTotal}</p>
        </div>
        <div className="theme-card-muted p-4">
          <p className="section-kicker">Weekly adherence</p>
          <p className="mt-3 flex items-center gap-2 text-2xl font-semibold">
            <Target className="size-5" />
            {weeklyAdherence}%
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {badges.length === 0 ? (
          <Badge variant="outline">No badges yet</Badge>
        ) : (
          badges.map((badge) => (
            <Badge key={badge} variant="secondary">
              {badge}
            </Badge>
          ))
        )}
      </div>
    </section>
  )
}
