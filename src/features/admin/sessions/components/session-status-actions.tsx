"use client";

import {
  nextSessionStatus,
  type SessionStatus,
} from "@/lib/session-status";
import type { SessionRowPatch } from "@/features/admin/sessions/types";
import { XpButton } from "@/features/xp/window";
import { useTransition } from "react";
import { updateSessionStatus } from "@/features/admin/sessions/actions";

type SessionStatusActionsProps = {
  sessionId: number;
  status: SessionStatus;
  onPatched: (patches: SessionRowPatch[]) => void;
};

export function SessionStatusActions({
  sessionId,
  status,
  onPatched,
}: SessionStatusActionsProps) {
  const [pending, startTransition] = useTransition();

  if (status === "COMPLETED") {
    return null;
  }

  function advance() {
    const next = nextSessionStatus(status);
    const formData = new FormData();
    formData.set("id", String(sessionId));
    formData.set("status", next);
    startTransition(() => {
      void updateSessionStatus(formData)
        .then((patches) => {
          onPatched(patches);
        })
        .catch((error) => {
          console.error("Failed to update session status:", error);
        });
    });
  }

  const label = status === "NOT_STARTED" ? "Start" : "Complete";

  return (
    <span
      role="presentation"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <XpButton
        type="button"
        variant="primary"
        className="xp-btn--compact"
        disabled={pending}
        onClick={() => advance()}
      >
        {pending ? "…" : label}
      </XpButton>
    </span>
  );
}
