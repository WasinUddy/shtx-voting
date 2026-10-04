"use client";

import { SessionStatusPill } from "./session-status-pill";
import type { SessionRowPatch } from "./session-row-patch";
import type { SessionStatus } from "@/lib/session-status";
import { formatSessionUpdatedAt } from "@/lib/format-session-time";
import { Text } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    setSessions(initialSessions);
  }, [initialSessions]);

  function handlePatched(patches: SessionRowPatch[]) {
    setSessions((current) => applyPatches(current, patches));
  }

  return (
    <div className="overflow-hidden rounded-md border border-black/[.08] dark:border-white/[.145]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-3 border-b border-black/[.08] bg-black/[.02] px-3 py-1.5 text-xs font-medium text-black/50 dark:border-white/[.145] dark:bg-white/[.02] dark:text-white/50">
        <span>Name</span>
        <span className="w-[7.5rem] text-center">Status</span>
        <span className="w-[8.5rem] text-right">Updated</span>
        <span className="w-7" aria-hidden />
      </div>
      <ul className="divide-y divide-black/[.08] dark:divide-white/[.145]">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-3 px-3 py-2 text-sm"
          >
            <Text size="sm" fw={500} truncate className="min-w-0">
              {session.name}
            </Text>
            <div className="flex w-[7.5rem] justify-center">
              <SessionStatusPill
                sessionId={session.id}
                status={session.status}
                onPatched={handlePatched}
              />
            </div>
            <Text
              size="xs"
              c="dimmed"
              className="w-[8.5rem] shrink-0 text-right tabular-nums"
            >
              {session.updatedAtLabel}
            </Text>
            <Link
              href={`/admin/${session.id}`}
              aria-label={`Open ${session.name}`}
              className="flex w-7 items-center justify-center rounded-sm text-black/55 transition-colors hover:bg-black/[.04] hover:text-black dark:text-white/55 dark:hover:bg-white/[.06] dark:hover:text-white"
            >
              <ChevronRight size={16} strokeWidth={2} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
