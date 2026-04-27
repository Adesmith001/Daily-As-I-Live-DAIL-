import { useEffect, useMemo, useState } from 'react'
import { Trophy } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/common/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'
import { subscribeToExerciseLeaderboardGlobal } from '@/services/exercise-leaderboard-service'
import {
  setExerciseProfileRival,
  subscribeToExerciseProfile,
} from '@/services/exercise-profile-service'
import type {
  ExerciseLeaderboardPublicDocument,
  ExerciseProfileDocument,
} from '@/types/models'

const NO_RIVAL_VALUE = '__none__'

function formatRank(value: number) {
  if (value <= 0) {
    return '-'
  }

  return `#${value}`
}

export function LeaderboardPage() {
  const { user } = useAuth()
  const [globalRows, setGlobalRows] = useState<ExerciseLeaderboardPublicDocument[]>([])
  const [exerciseProfile, setExerciseProfile] = useState<ExerciseProfileDocument | null>(null)
  const [loadingGlobal, setLoadingGlobal] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingRival, setSavingRival] = useState(false)

  useEffect(() => {
    if (!user) {
      setGlobalRows([])
      setExerciseProfile(null)
      setLoadingGlobal(false)
      setLoadingProfile(false)
      return
    }

    setLoadingGlobal(true)
    setLoadingProfile(true)

    const unsubscribeGlobal = subscribeToExerciseLeaderboardGlobal((rows) => {
      setGlobalRows(rows)
      setLoadingGlobal(false)
    })

    const unsubscribeProfile = subscribeToExerciseProfile(user.uid, (profile) => {
      setExerciseProfile(profile)
      setLoadingProfile(false)
    })

    return () => {
      unsubscribeGlobal()
      unsubscribeProfile()
    }
  }, [user])

  const rowByUserId = useMemo(
    () => new Map(globalRows.map((row, index) => [row.userId, { row, rank: index + 1 }])),
    [globalRows],
  )

  const selfStanding = user ? rowByUserId.get(user.uid) : undefined
  const rivalStanding = exerciseProfile?.rivalUid
    ? rowByUserId.get(exerciseProfile.rivalUid)
    : undefined

  const rivalOptions = useMemo(() => {
    if (!user) {
      return []
    }

    return globalRows.filter((row) => row.userId !== user.uid)
  }, [globalRows, user])

  const loading = loadingGlobal || loadingProfile

  async function handleRivalChange(nextValue: string) {
    if (!user) {
      return
    }

    const rivalUid = nextValue === NO_RIVAL_VALUE ? null : nextValue

    setSavingRival(true)
    try {
      await setExerciseProfileRival(user.uid, rivalUid)
      toast.success(rivalUid ? 'Rival updated' : 'Rival cleared')
    } catch (error) {
      console.error('Could not update rival', error)
      toast.error('Could not update rival right now.')
    } finally {
      setSavingRival(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          Loading leaderboard...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <CardContent className="space-y-3 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Exercise leaderboard
          </p>
          <h2 className="text-3xl tracking-[-0.05em]">Compare weekly progress</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Rankings use weekly XP, then weekly adherence and streak as tiebreakers.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="global">
        <TabsList className="grid-cols-2">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="head-to-head">Head-to-Head</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          {globalRows.length === 0 ? (
            <EmptyState
              title="No leaderboard data yet"
              description="Complete exercises this week to populate rankings."
            />
          ) : (
            globalRows.map((row, index) => {
              const isCurrentUser = row.userId === user?.uid

              return (
                <Card key={row.userId} className={isCurrentUser ? 'ring-1 ring-primary/50' : ''}>
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{formatRank(index + 1)}</p>
                      <p className="text-lg font-semibold">{row.displayName}</p>
                      {isCurrentUser ? <Badge variant="secondary">You</Badge> : null}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold">{row.weeklyXp}</p>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Weekly XP</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.weeklyAdherence}% adherence | {row.currentStreak} day streak
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="head-to-head" className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Choose rival</p>
              <Select
                disabled={savingRival}
                value={exerciseProfile?.rivalUid ?? NO_RIVAL_VALUE}
                onValueChange={(value) => {
                  void handleRivalChange(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick rival from global list" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_RIVAL_VALUE}>No rival</SelectItem>
                  {rivalOptions.map((option) => (
                    <SelectItem key={option.userId} value={option.userId}>
                      {option.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {!selfStanding || !rivalStanding ? (
            <EmptyState
              title="Head-to-head not ready"
              description="Pick a rival who has weekly progress data so both of you can compare."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {[selfStanding, rivalStanding].map((standing) => (
                <Card key={standing.row.userId} className={standing.row.userId === user?.uid ? 'ring-1 ring-primary/50' : ''}>
                  <CardContent className="space-y-2 p-5">
                    <p className="text-sm text-muted-foreground">{formatRank(standing.rank)}</p>
                    <p className="text-xl font-semibold">{standing.row.displayName}</p>
                    <p className="flex items-center gap-2 text-2xl font-semibold">
                      <Trophy className="size-5" />
                      {standing.row.weeklyXp}
                    </p>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Weekly XP</p>
                    <p className="text-sm text-muted-foreground">
                      Adherence: {standing.row.weeklyAdherence}% | Streak: {standing.row.currentStreak}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
