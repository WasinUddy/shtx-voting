"use client";

import {
  SESSION_STATUS_COLORS,
  SESSION_STATUS_LABELS,
  nextSessionStatus,
  type SessionStatus,
} from "@/lib/session-status";
import type { SessionRowPatch } from "./session-row-patch";
import { Badge, UnstyledButton } from "@mantine/core";
import { useTransition } from "react";
import { updateSessionStatus } from "./actions";

type SessionStatusPillProps = {
  sessionId: number;
  status: SessionStatus;
  onPatched: (patches: SessionRowPatch[]) => void;
};

export function SessionStatusPill({
  sessionId,
  status,
  onPatched,
}: SessionStatusPillProps) {
  const [pending, startTransition] = useTransition();
  const isTerminal = status === "COMPLETED";

  const badge = (
    <Badge
      size="sm"
      radius="xl"
      variant="light"
      color={SESSION_STATUS_COLORS[status]}
      className={isTerminal ? "normal-case" : "cursor-pointer normal-case"}
    >
      {SESSION_STATUS_LABELS[status]}
    </Badge>
  );

  if (isTerminal) {
    return (
      <span
        className="shrink-0 rounded-full"
        aria-label={`Status: ${SESSION_STATUS_LABELS[status]}`}
      >
        {badge}
      </span>
    );
  }

  return (
    <UnstyledButton
      type="button"
      disabled={pending}
      aria-label={`Status: ${SESSION_STATUS_LABELS[status]}. Click to change.`}
      onClick={() => {
        const next = nextSessionStatus(status);
        const formData = new FormData();
        formData.set("id", String(sessionId));
        formData.set("status", next);
        startTransition(async () => {
          const patches = await updateSessionStatus(formData);
          onPatched(patches);
        });
      }}
      className="shrink-0 rounded-full disabled:opacity-60"
    >
      {badge}
    </UnstyledButton>
  );
}
