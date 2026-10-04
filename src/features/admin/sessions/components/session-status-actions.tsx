"use client";

import {
  nextSessionStatus,
  type SessionStatus,
} from "@/lib/session-status";
import type { SessionRowPatch } from "@/features/admin/sessions/types";
import { IconRemove } from "@/features/xp/icons";
import { XpButton } from "@/features/xp/window";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  deleteSession,
  updateSessionStatus,
} from "@/features/admin/sessions/actions";

type SessionStatusActionsProps = {
  sessionId: number;
  sessionName: string;
  status: SessionStatus;
  onPatched: (patches: SessionRowPatch[]) => void;
  onDeleted: (sessionId: number) => void;
};

export function SessionStatusActions({
  sessionId,
  sessionName,
  status,
  onPatched,
  onDeleted,
}: SessionStatusActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (status === "COMPLETED") {
    function remove() {
      if (!window.confirm(`Remove ${sessionName}?`)) {
        return;
      }
      startTransition(() => {
        void deleteSession(sessionId)
          .then((message) => {
            if (message) {
              console.error("Failed to delete session:", message);
              window.alert(message);
              return;
            }
            onDeleted(sessionId);
            router.refresh();
          })
          .catch((error) => {
            console.error("Failed to delete session:", error);
          });
      });
    }

    return (
      <span
        role="presentation"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <button
          type="button"
          className="xp-icon-btn"
          aria-label={`Remove ${sessionName}`}
          disabled={pending}
          onClick={() => remove()}
        >
          <IconRemove />
        </button>
      </span>
    );
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
