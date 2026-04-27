import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { LoadingScreen } from '@/components/common/loading-screen'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { formatDateLabel } from '@/lib/date'
import { calculateDailyScore } from '@/lib/score'
import { subscribeToEntriesByDate } from '@/services/daily-entry-service'
import { subscribeToTrackers } from '@/services/tracker-service'
import type { DailyEntryDocument, TrackerDocument } from '@/types/models'

export function DailyDetailPage() {
  const { user } = useAuth()
  const { date = '' } = useParams()
  const [trackers, setTrackers] = useState<TrackerDocument[]>([])
  const [entries, setEntries] = useState<DailyEntryDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !date) {
      return
    }

    const unsubscribeTrackers = subscribeToTrackers(user.uid, setTrackers)
    const unsubscribeEntries = subscribeToEntriesByDate(user.uid, date, (nextEntries) => {
      setEntries(nextEntries)
      setLoading(false)
    })

    return () => {
      unsubscribeTrackers()
      unsubscribeEntries()
    }
  }, [date, user])

  const trackersById = useMemo(
    () => new Map(trackers.map((tracker) => [tracker.id, tracker])),
    [trackers],
  )
  const sortedEntries = useMemo(
    () =>
      [...entries].sort((left, right) => {
        const leftOrder =
          trackersById.get(left.trackerId)?.displayOrder ?? Number.MAX_SAFE_INTEGER
        const rightOrder =
          trackersById.get(right.trackerId)?.displayOrder ?? Number.MAX_SAFE_INTEGER
        return leftOrder - rightOrder
      }),
    [entries, trackersById],
  )
  const score = calculateDailyScore(entries)

  if (loading) {
    return <LoadingScreen fullscreen={false} label="Loading this day..." />
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost">
        <Link to="/history">
          <ArrowLeft className="size-4" />
          Back to history
        </Link>
      </Button>

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Daily detail
          </p>
          <h2 className="text-4xl">{formatDateLabel(date)}</h2>
          <p className="text-sm text-muted-foreground">
            Daily score: {score !== null ? `${score}/10` : 'No score recorded'}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sortedEntries.map((entry) => {
          const tracker = trackersById.get(entry.trackerId)
          const value =
            entry.checkboxValue !== null
              ? entry.checkboxValue
                ? 'Completed'
                : 'Not today'
              : `${entry.rangeValue}/10`

          return (
            <Card key={entry.id}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <h3 className="break-words text-2xl">
                    {tracker?.name ?? 'Deleted tracker'}
                  </h3>
                  <p className="mt-1 break-words text-sm text-muted-foreground">
                    {tracker?.description || 'Past entry retained in history.'}
                  </p>
                </div>
                <Badge>{value}</Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
