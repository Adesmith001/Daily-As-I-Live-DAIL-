import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/common/empty-state'
import { TrackerFormDialog } from '@/components/trackers/tracker-form-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/auth-context'
import {
  createTracker,
  deleteTracker,
  reorderTracker,
  subscribeToTrackers,
  updateTracker,
} from '@/services/tracker-service'
import type { TrackerDocument, TrackerFormValues } from '@/types/models'

export function TrackersPage() {
  const { user } = useAuth()
  const [trackers, setTrackers] = useState<TrackerDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTracker, setEditingTracker] = useState<TrackerDocument | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      return
    }

    return subscribeToTrackers(user.uid, (nextTrackers) => {
      setTrackers(nextTrackers)
      setLoading(false)
    })
  }, [user])

  const nextDisplayOrder = useMemo(
    () =>
      trackers.length > 0
        ? Math.max(...trackers.map((tracker) => tracker.displayOrder)) + 1
        : 0,
    [trackers],
  )

  async function handleSubmit(values: TrackerFormValues) {
    if (!user) {
      return
    }

    setSaving(true)
    try {
      if (editingTracker) {
        await updateTracker(editingTracker.id, values)
        toast.success('Tracker updated')
      } else {
        await createTracker(user.uid, values, nextDisplayOrder)
        toast.success('Tracker created')
      }

      setDialogOpen(false)
      setEditingTracker(null)
    } catch {
      toast.error('Could not save that tracker.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(tracker: TrackerDocument) {
    const confirmed = window.confirm(`Delete "${tracker.name}"?`)
    if (!confirmed) {
      return
    }

    try {
      await deleteTracker(tracker.id)
      toast.success('Tracker deleted')
    } catch {
      toast.error('Could not delete that tracker.')
    }
  }

  async function handleMove(trackerId: string, direction: 'up' | 'down') {
    try {
      await reorderTracker(trackers, trackerId, direction)
    } catch {
      toast.error('Could not reorder trackers right now.')
    }
  }

  async function handleToggle(tracker: TrackerDocument, isActive: boolean) {
    try {
      await updateTracker(tracker.id, { isActive })
    } catch {
      toast.error('Could not update tracker status.')
    }
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <CardContent className="flex items-center justify-between gap-3 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Habit studio
            </p>
            <h2 className="mt-1 text-3xl tracking-[-0.05em]">Your trackers</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Build the stack you want to see every day.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingTracker(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="size-4" />
            New
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl tracking-[-0.05em]">Arrange your daily flow</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Activate, reorder, and tune the trackers that shape your day.
          </p>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            Loading trackers...
          </CardContent>
        </Card>
      ) : trackers.length === 0 ? (
        <EmptyState
          actionLabel="Create tracker"
          description="Create your first checkbox or 0-10 range tracker to start using DAIL."
          onAction={() => {
            setEditingTracker(null)
            setDialogOpen(true)
          }}
          title="No trackers yet"
        />
      ) : (
        <div className="space-y-4">
          {trackers.map((tracker, index) => (
            <Card key={tracker.id} className="overflow-hidden">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl">{tracker.name}</h3>
                      <Badge variant="secondary">{tracker.type}</Badge>
                      {!tracker.isActive ? <Badge variant="outline">inactive</Badge> : null}
                    </div>
                    {tracker.description ? (
                      <p className="text-sm text-muted-foreground">{tracker.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No description added yet.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Active
                    </span>
                    <Switch
                      checked={tracker.isActive}
                      onCheckedChange={(checked) => void handleToggle(tracker, checked)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={index === 0}
                    size="sm"
                    variant="outline"
                    onClick={() => void handleMove(tracker.id, 'up')}
                  >
                    <ArrowUp className="size-4" />
                    Up
                  </Button>
                  <Button
                    disabled={index === trackers.length - 1}
                    size="sm"
                    variant="outline"
                    onClick={() => void handleMove(tracker.id, 'down')}
                  >
                    <ArrowDown className="size-4" />
                    Down
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingTracker(tracker)
                      setDialogOpen(true)
                    }}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void handleDelete(tracker)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TrackerFormDialog
        key={
          editingTracker?.id
            ? `${editingTracker.id}-${dialogOpen ? 'open' : 'closed'}`
            : dialogOpen
              ? 'create-open'
              : 'create-closed'
        }
        isSaving={saving}
        open={dialogOpen}
        tracker={editingTracker}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingTracker(null)
          }
        }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
