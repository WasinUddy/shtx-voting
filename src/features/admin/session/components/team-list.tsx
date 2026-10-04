"use client";

import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconAdd, IconGrip, IconPencil, IconRemove } from "@/features/xp/icons";
import { GroupBox, ToolbarButton, XpAlert, XpInput } from "@/features/xp/window";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { createTeam, deleteTeam, renameTeam, reorderTeams } from "@/features/admin/session/actions";

export type TeamListItem = {
  id: number;
  name: string;
  orderId: number;
};

type TeamListProps = {
  sessionId: number;
  teams: TeamListItem[];
};

type SortableTeamRowProps = {
  team: TeamListItem;
  editing: boolean;
  draft: string;
  pending: boolean;
  onDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
};

function teamSignature(teams: TeamListItem[]) {
  return teams
    .map((team) => `${team.id}:${team.orderId}:${team.name}`)
    .join("|");
}

export function TeamList({ sessionId, teams: initialTeams }: TeamListProps) {
  const router = useRouter();
  const signature = teamSignature(initialTeams);
  const [teams, setTeams] = useState(initialTeams);
  const [prevSignature, setPrevSignature] = useState(signature);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const skipBlurSave = useRef(false);

  if (signature !== prevSignature) {
    setPrevSignature(signature);
    setTeams(initialTeams);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = teams.findIndex((team) => team.id === active.id);
    const newIndex = teams.findIndex((team) => team.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    const previous = teams;
    const next = arrayMove(teams, oldIndex, newIndex).map((team, index) => ({
      ...team,
      orderId: index + 1,
    }));
    setTeams(next);
    setError(undefined);
    startTransition(async () => {
      const result = await reorderTeams(
        sessionId,
        next.map((team) => team.id),
      );
      if (result) {
        setTeams(previous);
        setError(result);
      }
    });
  }

  function startEdit(team: TeamListItem) {
    skipBlurSave.current = false;
    setEditingId(team.id);
    setDraft(team.name);
    setError(undefined);
  }

  function cancelEdit() {
    skipBlurSave.current = true;
    setEditingId(null);
    setError(undefined);
  }

  function commitEdit(teamId: number) {
    if (skipBlurSave.current) {
      skipBlurSave.current = false;
      return;
    }
    if (editingId !== teamId) {
      return;
    }
    const name = draft.trim();
    if (!name) {
      setError("Team name is required");
      return;
    }
    const current = teams.find((team) => team.id === teamId);
    if (current?.name === name) {
      setEditingId(null);
      setError(undefined);
      return;
    }
    setEditingId(null);
    startTransition(async () => {
      const result = await renameTeam(sessionId, teamId, name);
      if (result) {
        setDraft(name);
        setEditingId(teamId);
        setError(result);
        return;
      }
      setError(undefined);
      setTeams((currentTeams) =>
        currentTeams.map((team) =>
          team.id === teamId ? { ...team, name } : team,
        ),
      );
    });
  }

  function remove(team: TeamListItem) {
    if (!window.confirm(`Remove ${team.name}?`)) {
      return;
    }
    const previous = teams;
    const next = teams
      .filter((item) => item.id !== team.id)
      .map((item, index) => ({ ...item, orderId: index + 1 }));
    setTeams(next);
    if (editingId === team.id) {
      setEditingId(null);
    }
    setError(undefined);
    startTransition(async () => {
      const result = await deleteTeam(sessionId, team.id);
      if (result) {
        setTeams(previous);
        setError(result);
      }
    });
  }

  function addTeam() {
    const name = newTeamName.trim();
    if (!name) {
      setError("Team name is required");
      return;
    }
    setError(undefined);
    const formData = new FormData();
    formData.set("sessionId", String(sessionId));
    formData.set("name", name);
    startTransition(async () => {
      const result = await createTeam(undefined, formData);
      if (result) {
        setError(result);
        return;
      }
      setNewTeamName("");
      router.refresh();
    });
  }

  return (
    <GroupBox label="Teams">
      {error ? <XpAlert>{error}</XpAlert> : null}

      {teams.length === 0 ? (
        <p className="xp-text-dim" style={{ marginBottom: 8 }}>
          No teams yet. Add one below.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={teams.map((team) => team.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="xp-listview" style={{ marginBottom: 8 }}>
              <div
                className="xp-listview__header"
                style={{
                  gridTemplateColumns:
                    "2.25rem 2.5rem minmax(0, 1fr) 4.5rem 4.5rem",
                }}
              >
                <span aria-hidden />
                <span>#</span>
                <span>Name</span>
                <span className="xp-text-right">Edit</span>
                <span className="xp-text-right">Remove</span>
              </div>
              {teams.map((team) => (
                <SortableTeamRow
                  key={team.id}
                  team={team}
                  editing={editingId === team.id}
                  draft={draft}
                  pending={pending}
                  onDraftChange={setDraft}
                  onStartEdit={() => startEdit(team)}
                  onCommitEdit={() => commitEdit(team.id)}
                  onCancelEdit={cancelEdit}
                  onRemove={() => remove(team)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="xp-toolbar-form" style={{ marginTop: 4 }}>
        <span className="xp-toolbar-label">Add team:</span>
        <XpInput
          value={newTeamName}
          onChange={setNewTeamName}
          placeholder="Team name"
          aria-label="New team name"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTeam();
            }
          }}
        />
        <ToolbarButton type="button" disabled={pending} onClick={addTeam}>
          <IconAdd />
          <span>Add</span>
        </ToolbarButton>
      </div>
    </GroupBox>
  );
}

function SortableTeamRow({
  team,
  editing,
  draft,
  pending,
  onDraftChange,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onRemove,
}: SortableTeamRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: team.id, disabled: pending });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: isDragging ? "relative" as const : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      className="xp-listview__row"
      style={{
        ...style,
        gridTemplateColumns: "2.25rem 2.5rem minmax(0, 1fr) 4.5rem 4.5rem",
      }}
    >
      <button
        type="button"
        className="xp-icon-btn"
        aria-label={`Reorder ${team.name}`}
        disabled={pending}
        {...attributes}
        {...listeners}
      >
        <IconGrip />
      </button>
      <span className="xp-tabular xp-text-dim">{team.orderId}</span>
      {editing ? (
        <XpInput
          value={draft}
          onChange={onDraftChange}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              onCancelEdit();
            }
            if (event.key === "Enter") {
              event.preventDefault();
              onCommitEdit();
            }
          }}
          onBlur={onCommitEdit}
          autoFocus
          aria-label="Team name"
          disabled={pending}
        />
      ) : (
        <span className="xp-listview__cell">{team.name}</span>
      )}
      {editing ? (
        <span />
      ) : (
        <span className="xp-text-right">
          <button
            type="button"
            className="xp-icon-btn"
            aria-label={`Rename ${team.name}`}
            disabled={pending}
            onClick={onStartEdit}
          >
            <IconPencil />
          </button>
        </span>
      )}
      <span className="xp-text-right">
        <button
          type="button"
          className="xp-icon-btn"
          aria-label={`Remove ${team.name}`}
          disabled={pending}
          onMouseDown={() => {
            if (editing) {
              onCancelEdit();
            }
          }}
          onClick={onRemove}
        >
          <IconRemove />
        </button>
      </span>
    </div>
  );
}
