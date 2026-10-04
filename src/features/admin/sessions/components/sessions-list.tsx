"use client";

import { StatusLabel } from "@/features/xp/window";
import type { SessionRowPatch } from "@/features/admin/sessions/types";
import type { SessionStatus } from "@/lib/session-status";
import { formatSessionUpdatedAt } from "@/lib/format-session-time";
import { SessionStatusActions } from "./session-status-actions";
import Link from "next/link";
import { useState } from "react";

export type SessionListItem = {
  id: number;
  name: string;
  status: SessionStatus;
  updatedAtLabel: string;
};

type SessionsListProps = {
  sessions: SessionListItem[];
};

function applyPatches(
  items: SessionListItem[],
  patches: SessionRowPatch[],
): SessionListItem[] {
  if (patches.length === 0) {
    return items;
  }
  const byId = new Map(patches.map((patch) => [patch.id, patch]));
  return items.map((item) => {
    const patch = byId.get(item.id);
    if (!patch) {
      return item;
    }
    return {
      ...item,
      status: patch.status,
      updatedAtLabel: formatSessionUpdatedAt(patch.updatedAt),
    };
  });
}

export function SessionsList({ sessions: initialSessions }: SessionsListProps) {
  const [sessions, setSessions] = useState(initialSessions);

  function handlePatched(patches: SessionRowPatch[]) {
    if (patches.length === 0) {
      return;
    }
    setSessions((current) => applyPatches(current, patches));
  }

  function handleDeleted(sessionId: number) {
    setSessions((current) => current.filter((session) => session.id !== sessionId));
  }

  return (
    <div className="xp-listview">
      <div
        className="xp-listview__header"
        style={{
          gridTemplateColumns:
            "minmax(0, 1fr) 9rem 10rem minmax(7rem, auto)",
        }}
      >
        <span>Name</span>
        <span>Status</span>
        <span className="xp-text-right">Updated</span>
        <span className="xp-text-right">Actions</span>
      </div>
      {sessions.map((session) => (
        <Link
          key={session.id}
          href={`/admin/${session.id}`}
          className="xp-listview__row"
          style={{
            gridTemplateColumns:
              "minmax(0, 1fr) 9rem 10rem minmax(7rem, auto)",
          }}
        >
          <span className="xp-listview__cell" style={{ fontWeight: "bold" }}>
            {session.name}
          </span>
          <span>
            <StatusLabel status={session.status} />
          </span>
          <span className="xp-listview__cell xp-text-right xp-tabular xp-text-dim">
            {session.updatedAtLabel}
          </span>
          <span
            className="xp-row-actions"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <SessionStatusActions
              sessionId={session.id}
              sessionName={session.name}
              status={session.status}
              onPatched={handlePatched}
              onDeleted={handleDeleted}
            />
          </span>
        </Link>
      ))}
    </div>
  );
}
