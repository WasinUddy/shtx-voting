import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import type { SessionStatus } from "@/lib/session-status";

export type Session = typeof sessions.$inferSelect;

export async function listSessions(): Promise<Session[]> {
  return db.select().from(sessions).orderBy(desc(sessions.updatedAt));
}

export async function listInProgressSessions(): Promise<Session[]> {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.status, "IN_PROGRESS"));
}

export async function getSessionById(id: number): Promise<Session | undefined> {
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1);
  return rows[0];
}

export async function createSession(name: string): Promise<Session> {
  const trimmed = name.trim();
  const rows = await db
    .insert(sessions)
    .values({
      name: trimmed,
      status: "NOT_STARTED",
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .returning();
  const created = rows[0];
  if (!created) {
    throw new Error("Failed to create session");
  }
  return created;
}

export async function updateSessionStatus(
  id: number,
  status: SessionStatus,
): Promise<Session | undefined> {
  const rows = await db
    .update(sessions)
    .set({
      status,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(sessions.id, id))
    .returning();
  return rows[0];
}
