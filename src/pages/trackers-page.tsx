import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { LoadingScreen } from "@/components/common/loading-screen";
import { TrackerFormDialog } from "@/components/trackers/tracker-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import {
  createTrackerSection,
  subscribeToTrackerSections,
} from "@/services/tracker-section-service";
import {
  createTracker,
  deleteTracker,
  reorderTracker,
  subscribeToTrackers,
  updateTracker,
} from "@/services/tracker-service";
import type {
  TrackerDocument,
  TrackerFormValues,
  TrackerSectionDocument,
} from "@/types/models";

export function TrackersPage() {
  const { user } = useAuth();
  const [trackers, setTrackers] = useState<TrackerDocument[]>([]);
  const [sections, setSections] = useState<TrackerSectionDocument[]>([]);
  const [trackersLoaded, setTrackersLoaded] = useState(false);
  const [sectionsLoaded, setSectionsLoaded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTracker, setEditingTracker] = useState<TrackerDocument | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [creatingSection, setCreatingSection] = useState(false);

  useEffect(() => {
    if (!user) {
      setTrackers([]);
      setSections([]);
      setTrackersLoaded(true);
      setSectionsLoaded(true);
      return;
    }

    setTrackersLoaded(false);
    setSectionsLoaded(false);

    const unsubscribeTrackers = subscribeToTrackers(
      user.uid,
      (nextTrackers) => {
        setTrackers(nextTrackers);
        setTrackersLoaded(true);
      },
    );
    const unsubscribeSections = subscribeToTrackerSections(
      user.uid,
      (nextSections) => {
        setSections(nextSections);
        setSectionsLoaded(true);
      },
    );

    return () => {
      unsubscribeTrackers();
      unsubscribeSections();
    };
  }, [user]);

  const nextDisplayOrder = useMemo(
    () =>
      trackers.length > 0
        ? Math.max(...trackers.map((tracker) => tracker.displayOrder)) + 1
        : 0,
    [trackers],
  );

  const nextSectionDisplayOrder = useMemo(
    () =>
      sections.length > 0
        ? Math.max(...sections.map((section) => section.displayOrder)) + 1
        : 0,
    [sections],
  );

  const trackerIndexById = useMemo(
    () => new Map(trackers.map((tracker, index) => [tracker.id, index])),
    [trackers],
  );

  const sectionNameById = useMemo(
    () => new Map(sections.map((section) => [section.id, section.name])),
    [sections],
  );

  const sectionGroups = useMemo(() => {
    const groupedTrackers = new Map<string, TrackerDocument[]>();
    const unsectionedTrackers: TrackerDocument[] = [];

    for (const tracker of trackers) {
      if (tracker.sectionId && sectionNameById.has(tracker.sectionId)) {
        const existing = groupedTrackers.get(tracker.sectionId) ?? [];
        groupedTrackers.set(tracker.sectionId, [...existing, tracker]);
      } else {
        unsectionedTrackers.push(tracker);
      }
    }

    const groups = sections.map((section) => ({
      id: section.id,
      name: section.name,
      trackers: groupedTrackers.get(section.id) ?? [],
    }));

    if (unsectionedTrackers.length > 0) {
      groups.push({
        id: "unsectioned",
        name: "Unsectioned",
        trackers: unsectionedTrackers,
      });
    }

    return groups;
  }, [sectionNameById, sections, trackers]);

  const loading = !trackersLoaded || !sectionsLoaded;

  async function handleSubmit(values: TrackerFormValues) {
    if (!user) {
      return;
    }

    setSaving(true);
    try {
      if (editingTracker) {
        await updateTracker(editingTracker.id, values);
        toast.success("Tracker updated");
      } else {
        await createTracker(user.uid, values, nextDisplayOrder);
        toast.success("Tracker created");
      }

      setDialogOpen(false);
      setEditingTracker(null);
    } catch {
      toast.error("Could not save that tracker.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tracker: TrackerDocument) {
    const confirmed = window.confirm(`Delete "${tracker.name}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteTracker(tracker.id);
      toast.success("Tracker deleted");
    } catch {
      toast.error("Could not delete that tracker.");
    }
  }

  async function handleMove(trackerId: string, direction: "up" | "down") {
    try {
      await reorderTracker(trackers, trackerId, direction);
    } catch {
      toast.error("Could not reorder trackers right now.");
    }
  }

  async function handleToggle(tracker: TrackerDocument, isActive: boolean) {
    try {
      await updateTracker(tracker.id, { isActive });
    } catch {
      toast.error("Could not update tracker status.");
    }
  }

  async function handleCreateSection() {
    if (!user) {
      return;
    }

    const name = newSectionName.trim();
    if (!name) {
      toast.error("Section name is required.");
      return;
    }

    if (name.length > 120) {
      toast.error("Section name must be 120 characters or fewer.");
      return;
    }

    const sectionExists = sections.some(
      (section) => section.name.toLowerCase() === name.toLowerCase(),
    );
    if (sectionExists) {
      toast.error("A section with this name already exists.");
      return;
    }

    setCreatingSection(true);
    try {
      await createTrackerSection(user.uid, name, nextSectionDisplayOrder);
      setNewSectionName("");
      toast.success("Section created");
    } catch {
      toast.error("Could not create section.");
    } finally {
      setCreatingSection(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="section-kicker">Habit studio</p>
          <h2 className="mt-1 text-3xl tracking-[-0.05em]">Your trackers</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Build the stack you want to see every day.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTracker(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          New
        </Button>
      </section>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl tracking-[-0.05em]">
            Arrange your daily flow
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Activate, reorder, and tune the trackers that shape your day.
          </p>
        </div>
      </div>

      <section className="section-block space-y-3">
          <div>
            <h3 className="text-lg font-medium">Sections</h3>
            <p className="text-sm text-muted-foreground">
              Add sections and assign trackers to them from the tracker form.
            </p>
          </div>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void handleCreateSection();
            }}
          >
            <Input
              maxLength={120}
              placeholder="Morning routine"
              value={newSectionName}
              onChange={(event) => setNewSectionName(event.target.value)}
            />
            <Button
              disabled={creatingSection || !newSectionName.trim()}
              type="submit"
            >
              <Plus className="size-4" />
              {creatingSection ? "Adding..." : "Add section"}
            </Button>
          </form>
      </section>

      {loading ? (
        <LoadingScreen fullscreen={false} label="Loading trackers..." />
      ) : trackers.length === 0 && sections.length === 0 ? (
        <EmptyState
          actionLabel="Create tracker"
          description="Create your first checkbox or 0-10 range tracker to start using DAIL."
          onAction={() => {
            setEditingTracker(null);
            setDialogOpen(true);
          }}
          title="No trackers yet"
        />
      ) : (
        <div className="space-y-6">
          {sectionGroups.map((sectionGroup) => (
            <section key={sectionGroup.id} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl tracking-[-0.03em]">
                    {sectionGroup.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {sectionGroup.trackers.length}{" "}
                    {sectionGroup.trackers.length === 1
                      ? "tracker"
                      : "trackers"}
                  </p>
                </div>
              </div>

              {sectionGroup.trackers.length === 0 ? (
                <Card>
                  <CardContent className="p-5 text-sm text-muted-foreground">
                    No trackers in this section yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sectionGroup.trackers.map((tracker) => {
                    const index = trackerIndexById.get(tracker.id) ?? -1;
                    return (
                      <Card key={tracker.id} className="overflow-hidden rounded-[1.6rem]">
                        <CardContent className="space-y-4 p-5">
                          <div className="space-y-3">
                            <h3 className="wrap-break-words whitespace-pre-wrap text-2xl leading-tight">
                              {tracker.name}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary">{tracker.type}</Badge>
                              {!tracker.isActive ? (
                                <Badge variant="outline">inactive</Badge>
                              ) : null}
                            </div>

                            {tracker.description ? (
                              <p className="wrap-break-words text-sm text-muted-foreground">
                                {tracker.description}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No description added yet.
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                Active
                              </span>
                              <Switch
                                checked={tracker.isActive}
                                onCheckedChange={(checked) =>
                                  void handleToggle(tracker, checked)
                                }
                              />
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Button
                                disabled={index <= 0}
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  void handleMove(tracker.id, "up")
                                }
                              >
                                <ArrowUp className="size-4" />
                                Up
                              </Button>
                              <Button
                                disabled={
                                  index === -1 || index >= trackers.length - 1
                                }
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  void handleMove(tracker.id, "down")
                                }
                              >
                                <ArrowDown className="size-4" />
                                Down
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingTracker(tracker);
                                  setDialogOpen(true);
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
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <TrackerFormDialog
        key={
          editingTracker?.id
            ? `${editingTracker.id}-${dialogOpen ? "open" : "closed"}`
            : dialogOpen
            ? "create-open"
            : "create-closed"
        }
        isSaving={saving}
        open={dialogOpen}
        tracker={editingTracker}
        sections={sections}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingTracker(null);
          }
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
