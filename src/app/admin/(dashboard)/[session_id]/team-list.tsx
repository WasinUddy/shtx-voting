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
import { ActionIcon, Alert, Text, TextInput } from "@mantine/core";
import { GripVertical, Pencil, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { deleteTeam, renameTeam, reorderTeams } from "./actions";

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
  const signature = teamSignature(initialTeams);
  const [teams, setTeams] = useState(initialTeams);
  const [prevSignature, setPrevSignature] = useState(signature);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
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

  if (teams.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        No teams yet.
      </Text>
    );
  }

  return (
    <div>
      {error ? (
        <Alert color="red" mb="sm">
          {error}
        </Alert>
      ) : null}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={teams.map((team) => team.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="m-0 list-none overflow-hidden rounded-md border border-black/[.08] p-0 dark:border-white/[.145]">
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
          </ul>
        </SortableContext>
      </DndContext>
    </div>
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
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-[1.75rem_1.75rem_minmax(0,1fr)_auto_auto] items-center gap-x-2 border-b border-black/[.08] px-2 py-1.5 last:border-b-0 dark:border-white/[.145] ${
        isDragging ? "relative z-10 bg-white opacity-80 dark:bg-black" : ""
      }`}
    >
      <button
        type="button"
        className="flex h-7 w-7 cursor-grab items-center justify-center rounded-sm text-black/55 hover:bg-black/[.04] active:cursor-grabbing disabled:cursor-not-allowed dark:text-white/55 dark:hover:bg-white/[.06]"
        aria-label={`Reorder ${team.name}`}
        disabled={pending}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} strokeWidth={2} aria-hidden />
      </button>
      <Text
        size="sm"
        c="dimmed"
        className="w-7 text-right tabular-nums"
      >
        {team.orderId}
      </Text>
      {editing ? (
        <TextInput
          value={draft}
          onChange={(event) => onDraftChange(event.currentTarget.value)}
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
          size="xs"
          aria-label="Team name"
          disabled={pending}
        />
      ) : (
        <Text size="sm" truncate>
          {team.name}
        </Text>
      )}
      {editing ? (
        <span className="w-7" />
      ) : (
        <ActionIcon
          type="button"
          variant="subtle"
          color="gray"
          size="sm"
          aria-label={`Rename ${team.name}`}
          disabled={pending}
          onClick={onStartEdit}
        >
          <Pencil size={16} strokeWidth={2} />
        </ActionIcon>
      )}
      <ActionIcon
        type="button"
        variant="subtle"
        color="red"
        size="sm"
        aria-label={`Remove ${team.name}`}
        disabled={pending}
        onMouseDown={() => {
          if (editing) {
            onCancelEdit();
          }
        }}
        onClick={onRemove}
      >
        <X size={16} strokeWidth={2} />
      </ActionIcon>
    </li>
  );
}
