"use client";

import { IconBack, IconNext, IconPlay, IconStop } from "@/features/xp/icons";
import { StatusLabel, ToolbarButton, ToolbarSeparator } from "@/features/xp/window";
import { nextSessionStatus, type SessionStatus } from "@/lib/session-status";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateSessionStatus } from "@/features/admin/sessions/actions";
import { setActiveTeam } from "@/features/admin/session/actions";

type SessionDeskToolbarProps = {
  sessionId: number;
  status: SessionStatus;
  teamCount: number;
  activeTeamId: number | null;
  orderedTeamIds: number[];
};

export function SessionDeskToolbar({
  sessionId,
  status,
  teamCount,
  activeTeamId,
  orderedTeamIds,
}: SessionDeskToolbarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function advanceStatus() {
    const next = nextSessionStatus(status);
    const formData = new FormData();
    formData.set("id", String(sessionId));
    formData.set("status", next);
    startTransition(() => {
      void updateSessionStatus(formData)
        .then(() => {
          router.refresh();
        })
        .catch((error) => {
          console.error("Failed to update session status:", error);
        });
    });
  }

  function submitActiveTeam(teamId: string) {
    const formData = new FormData();
    formData.set("sessionId", String(sessionId));
    formData.set("teamId", teamId);
    startTransition(() => {
      void setActiveTeam(formData).then(() => {
        router.refresh();
      });
    });
  }

  function nextTeam() {
    if (orderedTeamIds.length === 0) {
      return;
    }
    if (activeTeamId == null) {
      submitActiveTeam(String(orderedTeamIds[0]));
      return;
    }
    const index = orderedTeamIds.indexOf(activeTeamId);
    const nextIndex = index >= 0 ? index + 1 : 0;
    if (nextIndex < orderedTeamIds.length) {
      submitActiveTeam(String(orderedTeamIds[nextIndex]));
    } else {
      submitActiveTeam(String(orderedTeamIds[0]));
    }
  }

  return (
    <div className="xp-inset-toolbar">
      <Link href="/admin" className="xp-toolbar-btn" title="Back to sessions">
        <IconBack />
        <span>Back</span>
      </Link>
      <ToolbarSeparator />

      {status === "NOT_STARTED" ? (
        <ToolbarButton
          type="button"
          disabled={pending || teamCount === 0}
          title="Start session"
          onClick={advanceStatus}
        >
          <IconPlay />
          <span>Start session</span>
        </ToolbarButton>
      ) : null}

      {status === "IN_PROGRESS" ? (
        <>
          <ToolbarButton
            type="button"
            disabled={pending || teamCount === 0}
            title="Next team"
            onClick={nextTeam}
          >
            <IconNext />
            <span>Next team</span>
          </ToolbarButton>
          <ToolbarButton
            type="button"
            disabled={pending}
            title="Clear stage"
            onClick={() => submitActiveTeam("")}
          >
            <span>Clear stage</span>
          </ToolbarButton>
          <ToolbarButton
            type="button"
            disabled={pending}
            title="End session"
            onClick={advanceStatus}
          >
            <IconStop />
            <span>End session</span>
          </ToolbarButton>
        </>
      ) : null}

      {status === "COMPLETED" ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <StatusLabel status="COMPLETED" />
        </span>
      ) : null}

      {status === "NOT_STARTED" && teamCount === 0 ? (
        <span className="xp-toolbar-label">Add teams before starting</span>
      ) : null}
    </div>
  );
}
