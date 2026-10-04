"use server";

import { auth } from "@/auth";
import { isSessionStatus } from "@/lib/session-status";
import {
  createSession as createSessionInDb,
  getSessionById,
  listInProgressSessions,
  updateSessionStatus as updateSessionStatusInDb,
} from "@/services/sessions";
import type { SessionRowPatch } from "./session-row-patch";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
}

export async function createSession(
  _prev: string | undefined,
  formData: FormData,
) {
  await requireAdminSession();

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) {
    return "Session name is required";
  }

  await createSessionInDb(name);
  revalidatePath("/admin");
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

  return patches;
}
