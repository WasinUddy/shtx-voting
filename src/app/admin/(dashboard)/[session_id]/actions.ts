"use server";

import { requireAdminSession } from "@/lib/require-admin";
import { getSessionById, setActiveTeam as setActiveTeamInDb } from "@/services/sessions";
import {
  createTeam as createTeamInDb,
  deleteTeam as deleteTeamInDb,
  getTeamById,
  renameTeam as renameTeamInDb,
  reorderTeams as reorderTeamsInDb,
} from "@/services/teams";
import { publishAudienceAndScores } from "@/lib/live-events";
import { revalidatePath } from "next/cache";

function revalidateSessionDetail(sessionId: number) {
  revalidatePath(`/admin/${sessionId}`);
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("UNIQUE constraint failed") ||
      error.message.includes("SQLITE_CONSTRAINT_UNIQUE"))
  );
}

async function assertNotStarted(
  sessionId: number,
  blockedMessage: string,
): Promise<string | undefined> {
  if (!Number.isFinite(sessionId)) {
    return "Invalid session";
  }
  const session = await getSessionById(sessionId);
  if (!session) {
    return "Session not found";
  }
  if (session.status !== "NOT_STARTED") {
    return blockedMessage;
  }
}

export async function createTeam(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  await requireAdminSession();

  const sessionIdRaw = formData.get("sessionId");
  const name = formData.get("name");

  const sessionId =
    typeof sessionIdRaw === "string"
      ? Number.parseInt(sessionIdRaw, 10)
      : NaN;
  const blocked = await assertNotStarted(
    sessionId,
    "Teams can only be added before the session starts",
  );
  if (blocked) {
    return blocked;
  }

  if (typeof name !== "string" || !name.trim()) {
    return "Team name is required";
  }

  try {
    await createTeamInDb(sessionId, name);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return "Team name already exists";
    }
    throw error;
  }

  revalidateSessionDetail(sessionId);
}

export async function renameTeam(
  sessionId: number,
  teamId: number,
  name: string,
): Promise<string | undefined> {
  await requireAdminSession();

  const blocked = await assertNotStarted(
    sessionId,
    "Teams can only be renamed before the session starts",
  );
  if (blocked) {
    return blocked;
  }
  if (!Number.isInteger(teamId)) {
    return "Invalid team";
  }
  if (typeof name !== "string" || !name.trim()) {
    return "Team name is required";
  }

  try {
    await renameTeamInDb(sessionId, teamId, name);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return "Team name already exists";
    }
    if (error instanceof Error && error.message === "Team not found") {
      return error.message;
    }
    throw error;
  }

  revalidateSessionDetail(sessionId);
}

export async function deleteTeam(
  sessionId: number,
  teamId: number,
): Promise<string | undefined> {
  await requireAdminSession();

  const blocked = await assertNotStarted(
    sessionId,
    "Teams can only be removed before the session starts",
  );
  if (blocked) {
    return blocked;
  }
  if (!Number.isInteger(teamId)) {
    return "Invalid team";
  }

  try {
    await deleteTeamInDb(sessionId, teamId);
  } catch (error) {
    if (error instanceof Error && error.message === "Team not found") {
      return error.message;
    }
    throw error;
  }

  revalidateSessionDetail(sessionId);
}

export async function reorderTeams(
  sessionId: number,
  orderedIds: number[],
): Promise<string | undefined> {
  await requireAdminSession();

  const blocked = await assertNotStarted(
    sessionId,
    "Teams can only be reordered before the session starts",
  );
  if (blocked) {
    return blocked;
  }
  if (
    !Array.isArray(orderedIds) ||
    orderedIds.some((id) => !Number.isInteger(id))
  ) {
    return "Team order does not match this session";
  }

  try {
    await reorderTeamsInDb(sessionId, orderedIds);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Team order does not match this session"
    ) {
      return error.message;
    }
    throw error;
  }

  revalidateSessionDetail(sessionId);
}

export async function setActiveTeam(formData: FormData): Promise<void> {
  await requireAdminSession();

  const sessionIdRaw = formData.get("sessionId");
  const teamIdRaw = formData.get("teamId");

  const sessionId =
    typeof sessionIdRaw === "string"
      ? Number.parseInt(sessionIdRaw, 10)
      : NaN;
  if (!Number.isFinite(sessionId)) {
    return;
  }

  const session = await getSessionById(sessionId);
  if (!session || session.status !== "IN_PROGRESS") {
    return;
  }

  let teamId: number | null = null;
  if (typeof teamIdRaw === "string" && teamIdRaw.trim() !== "") {
    const parsed = Number.parseInt(teamIdRaw, 10);
    if (!Number.isFinite(parsed)) {
      return;
    }
    const team = await getTeamById(parsed);
    if (!team || team.sessionId !== sessionId) {
      return;
    }
    teamId = parsed;
  }

  await setActiveTeamInDb(sessionId, teamId);
  revalidateSessionDetail(sessionId);
  await publishAudienceAndScores(sessionId);
}
