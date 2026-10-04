"use client";

import type { SessionStatus } from "@/lib/session-status";
import { SessionStatusPill } from "@/features/admin/sessions/components/session-status-pill";
import { useRouter } from "next/navigation";

type SessionDetailStatusProps = {
  sessionId: number;
  status: SessionStatus;
};

export function SessionDetailStatus({
  sessionId,
  status,
}: SessionDetailStatusProps) {
  const router = useRouter();

  return (
    <SessionStatusPill
      sessionId={sessionId}
      status={status}
      onPatched={() => {
        router.refresh();
      }}
    />
  );
}
