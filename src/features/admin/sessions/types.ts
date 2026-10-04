import type { SessionStatus } from "@/lib/session-status";

export type SessionRowPatch = {
  id: number;
  status: SessionStatus;
  updatedAt: string | null;
};
