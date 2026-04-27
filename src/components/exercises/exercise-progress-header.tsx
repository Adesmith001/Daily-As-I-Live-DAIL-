import { Flame, Sparkles, Target } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

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
    <Card className={pulse ? 'ring-2 ring-primary/50 transition' : 'transition'}>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="theme-chip inline-flex items-center gap-2 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
              <Sparkles className="size-3.5" />
              Exercise progress
            </p>
            <h2 className="text-3xl tracking-[-0.05em]">Keep the momentum gentle</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Clear completion, visible streaks, and a calm feedback loop.
            </p>
          </div>

          <div className="relative size-26 shrink-0">
            <div
              className="absolute inset-0 rounded-full transition-[background] duration-500"
              style={{
                background: `conic-gradient(hsl(var(--brand-start)) ${progressPercent}%, hsl(var(--muted)) ${progressPercent}% 100%)`,
              }}
            />
            <div className="absolute inset-1.5 grid place-items-center rounded-full bg-card text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                Today
              </p>
              <p className="text-2xl font-semibold tracking-[-0.04em]">{progressPercent}%</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="theme-card-muted rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Current streak</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
              <Flame className="size-5" />
              {currentStreak}
            </p>
          </div>
          <div className="theme-card-muted rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Weekly XP</p>
            <p className="mt-2 text-2xl font-semibold">{weeklyXp}</p>
          </div>
          <div className="theme-card-muted rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">XP total</p>
            <p className="mt-2 text-2xl font-semibold">{xpTotal}</p>
          </div>
          <div className="theme-card-muted rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Weekly adherence</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
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
              <Badge key={badge} className="rounded-full px-3 py-1" variant="secondary">
                {badge}
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
