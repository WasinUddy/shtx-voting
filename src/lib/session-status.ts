export const SESSION_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

export function isSessionStatus(value: string): value is SessionStatus {
  return SESSION_STATUSES.includes(value as SessionStatus);
}

export function nextSessionStatus(current: SessionStatus): SessionStatus {
  if (current === "COMPLETED") {
    return "COMPLETED";
  }
  const index = SESSION_STATUSES.indexOf(current);
  return SESSION_STATUSES[index + 1];
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};
