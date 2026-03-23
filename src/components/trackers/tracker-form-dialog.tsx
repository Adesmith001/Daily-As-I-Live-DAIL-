import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { TrackerDocument, TrackerFormValues, TrackerSectionDocument } from '@/types/models'

const defaultValues: TrackerFormValues = {
  name: '',
  sectionId: '',
  type: 'checkbox',
  description: '',
  isActive: true,
}

export function TrackerFormDialog({
  open,
  onOpenChange,
  onSubmit,
  tracker,
  isSaving,
  sections,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: TrackerFormValues) => Promise<void>
  tracker?: TrackerDocument | null
  isSaving: boolean
  sections: TrackerSectionDocument[]
}) {
  const [values, setValues] = useState<TrackerFormValues>(() =>
    tracker
      ? {
          name: tracker.name,
          sectionId: tracker.sectionId ?? '',
          type: tracker.type,
          description: tracker.description,
          isActive: tracker.isActive,
        }
      : defaultValues,
  )
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!values.name.trim()) {
      setError('Tracker name is required.')
      return
    }

    if (values.name.length > 4096) {
      setError('Tracker name must be 4096 characters or fewer.')
      return
    }

    setError('')
    await onSubmit(values)
  }

  const sectionExists = sections.some((section) => section.id === values.sectionId)
  const selectSectionValue =
    values.sectionId && sectionExists ? values.sectionId : 'unsectioned'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tracker ? 'Edit tracker' : 'New tracker'}</DialogTitle>
          <DialogDescription>
            Keep it simple, clear, and easy to complete in one hand.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="tracker-name">Name</Label>
            <Textarea
              id="tracker-name"
              maxLength={4096}
              className="min-h-[88px] resize-y"
              placeholder="Hydration"
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({ ...current, name: event.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">{values.name.length}/4096</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracker-section">Section</Label>
            <Select
              value={selectSectionValue}
              onValueChange={(value) =>
                setValues((current) => ({
                  ...current,
                  sectionId: value === 'unsectioned' ? '' : value,
                }))
              }
            >
              <SelectTrigger id="tracker-section">
                <SelectValue placeholder="Choose a section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unsectioned">No section</SelectItem>
                {!sectionExists && values.sectionId ? (
                  <SelectItem value={values.sectionId}>Missing section</SelectItem>
                ) : null}
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracker-type">Type</Label>
            <Select
              disabled={Boolean(tracker)}
              value={values.type}
              onValueChange={(value) =>
                setValues((current) => ({
                  ...current,
                  type: value as TrackerFormValues['type'],
                }))
              }
            >
              <SelectTrigger id="tracker-type">
                <SelectValue placeholder="Select tracker type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="range">Range 0 to 10</SelectItem>
              </SelectContent>
            </Select>
            {tracker ? (
              <p className="text-xs text-muted-foreground">
                Type stays locked after creation so historical scores remain consistent.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracker-description">Description</Label>
            <Textarea
              id="tracker-description"
              maxLength={140}
              placeholder="Optional context for what this tracker means."
              value={values.description}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Active today</p>
              <p className="text-xs text-muted-foreground">
                Inactive trackers stay in history but disappear from the Today page.
              </p>
            </div>
            <Switch
              checked={values.isActive}
              onCheckedChange={(checked) =>
                setValues((current) => ({ ...current, isActive: checked }))
              }
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : tracker ? 'Save changes' : 'Create tracker'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
