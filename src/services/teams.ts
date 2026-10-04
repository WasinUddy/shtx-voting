import { and, asc, eq, max, sql } from "drizzle-orm";
import { db } from "@/db";
import { teams } from "@/db/schema";

export type Team = typeof teams.$inferSelect;

type TeamTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function listTeamsBySession(sessionId: number): Promise<Team[]> {
  return db
    .select()
    .from(teams)
    .where(eq(teams.sessionId, sessionId))
    .orderBy(asc(teams.orderId), asc(teams.id));
}

export async function createTeam(
  sessionId: number,
  name: string,
): Promise<Team> {
  const trimmed = name.trim();
  const created = db.transaction((tx) => {
    const row = tx
      .select({ maxOrder: max(teams.orderId) })
      .from(teams)
      .where(eq(teams.sessionId, sessionId))
      .get();
    const orderId = (row?.maxOrder ?? 0) + 1;
    const rows = tx
      .insert(teams)
      .values({
        sessionId,
        name: trimmed,
        orderId,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .returning()
      .all();
    return rows[0];
  });
  if (!created) {
    throw new Error("Failed to create team");
  }
  return created;
}

export async function getTeamById(id: number): Promise<Team | undefined> {
  const rows = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return rows[0];
}

export async function renameTeam(
  sessionId: number,
  teamId: number,
  name: string,
): Promise<void> {
  const trimmed = name.trim();
  const rows = await db
    .update(teams)
    .set({
      name: trimmed,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(and(eq(teams.id, teamId), eq(teams.sessionId, sessionId)))
    .returning();
  if (!rows[0]) {
    throw new Error("Team not found");
  }
}

export async function deleteTeam(
  sessionId: number,
  teamId: number,
): Promise<void> {
  const removed = db.transaction((tx) => {
    const result = tx
      .delete(teams)
      .where(and(eq(teams.id, teamId), eq(teams.sessionId, sessionId)))
      .run();
    if (result.changes === 0) {
      return false;
    }
    const remaining = tx
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.sessionId, sessionId))
      .orderBy(asc(teams.orderId), asc(teams.id))
      .all();
    writeOrder(
      tx,
      sessionId,
      remaining.flatMap((team) => (team.id == null ? [] : [team.id])),
    );
    return true;
  });
  if (!removed) {
    throw new Error("Team not found");
  }
}

export async function reorderTeams(
  sessionId: number,
  orderedIds: number[],
): Promise<void> {
  const existing = await listTeamsBySession(sessionId);
  const existingIds = existing.flatMap((team) =>
    team.id == null ? [] : [team.id],
  );
  const existingIdSet = new Set(existingIds);
  const matches =
    orderedIds.length === existingIds.length &&
    new Set(orderedIds).size === orderedIds.length &&
    orderedIds.every((id) => existingIdSet.has(id));
  if (!matches) {
    throw new Error("Team order does not match this session");
  }
  db.transaction((tx) => {
    writeOrder(tx, sessionId, orderedIds);
  });
}

function writeOrder(tx: TeamTx, sessionId: number, orderedIds: number[]) {
  for (const [index, id] of orderedIds.entries()) {
    tx.update(teams)
      .set({ orderId: -(index + 1) })
      .where(and(eq(teams.id, id), eq(teams.sessionId, sessionId)))
      .run();
  }
  for (const [index, id] of orderedIds.entries()) {
    tx.update(teams)
      .set({
        orderId: index + 1,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(and(eq(teams.id, id), eq(teams.sessionId, sessionId)))
      .run();
  }
}
