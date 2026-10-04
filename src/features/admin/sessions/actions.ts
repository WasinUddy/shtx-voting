"use server";

import { requireAdminSession } from "@/lib/require-admin";
import { isSessionStatus } from "@/lib/session-status";
import {
  createSession as createSessionInDb,
  deleteSession as deleteSessionInDb,
  getSessionById,
  listInProgressSessions,
  updateSessionStatus as updateSessionStatusInDb,
} from "@/services/sessions";
import {
  publishAudienceState,
  publishSessionScores,
} from "@/lib/live-events";
import type { SessionRowPatch } from "@/features/admin/sessions/types";
import { revalidatePath } from "next/cache";
export async function createSession(
  _prev: string | undefined,
  formData: FormData,
) {
  await requireAdminSession();

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) {
    return "Session name is required";
  }

  try {
    await createSessionInDb(name);
    revalidatePath("/admin");
  } catch (error) {
    console.error("createSession failed:", error);
    return "Could not create session. Check the console for details.";
  }
}

function toRowPatch(session: {
  id: number | null;
  status: SessionRowPatch["status"];
  updatedAt: string | null;
}): SessionRowPatch | null {
  if (session.id == null) {
    return null;
  }
  return {
    id: session.id,
    status: session.status,
    updatedAt: session.updatedAt,
  };
}

export async function updateSessionStatus(
  formData: FormData,
): Promise<SessionRowPatch[]> {
  await requireAdminSession();

  const idRaw = formData.get("id");
  const statusRaw = formData.get("status");

  const id = typeof idRaw === "string" ? Number.parseInt(idRaw, 10) : NaN;
  if (!Number.isFinite(id)) {
    return [];
  }

  if (typeof statusRaw !== "string" || !isSessionStatus(statusRaw)) {
    return [];
  }

  try {
    const previouslyInProgress =
      statusRaw === "IN_PROGRESS" ? await listInProgressSessions() : [];

    const updated = await updateSessionStatusInDb(id, statusRaw);
    const patches: SessionRowPatch[] = [];

    const primary = updated ? toRowPatch(updated) : null;
    if (primary) {
      patches.push(primary);
    }

    if (statusRaw === "IN_PROGRESS") {
      for (const prev of previouslyInProgress) {
        if (prev.id === id) {
          continue;
        }
        const refreshed = await getSessionById(prev.id);
        const patch = refreshed ? toRowPatch(refreshed) : null;
        if (patch) {
          patches.push(patch);
        }
      }
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/${id}`);

    await publishAudienceState();
    await publishSessionScores(id);
    for (const prev of previouslyInProgress) {
      if (prev.id != null && prev.id !== id) {
        await publishSessionScores(prev.id);
      }
    }

    return patches;
  } catch (error) {
    console.error("updateSessionStatus failed:", error);
    return [];
  }
}

export async function deleteSession(sessionId: number): Promise<string | undefined> {
  await requireAdminSession();

  if (!Number.isFinite(sessionId)) {
    return "Invalid session";
  }

  const session = await getSessionById(sessionId);
  if (!session) {
    return "Session not found";
  }
  if (session.status !== "COMPLETED") {
    return "Only completed sessions can be deleted";
  }

  try {
    const removed = await deleteSessionInDb(sessionId);
    if (!removed) {
      return "Could not delete session";
    }
    revalidatePath("/admin");
    await publishAudienceState();
  } catch (error) {
    console.error("deleteSession failed:", error);
    return "Could not delete session. Check the console for details.";
  }
}
