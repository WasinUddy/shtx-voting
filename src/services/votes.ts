import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { votes } from "@/db/schema";
import { getSessionById } from "@/services/sessions";
import { listTeamsBySession } from "@/services/teams";

const SCORE_MIN = -3;
const SCORE_MAX = 3;

export function isValidVoteScore(score: number): boolean {
  return Number.isInteger(score) && score >= SCORE_MIN && score <= SCORE_MAX;
}

export async function getMyVoteScore(
  sessionId: number,
  teamId: number,
  fingerprint: string,
): Promise<number | null> {
  const trimmed = fingerprint.trim();
  if (!trimmed) {
    return null;
  }
  const rows = await db
    .select({ score: votes.score })
    .from(votes)
    .where(
      and(
        eq(votes.sessionId, sessionId),
        eq(votes.teamId, teamId),
        eq(votes.fingerprint, trimmed),
      ),
    )
    .limit(1);
  return rows[0]?.score ?? null;
}

export type TeamScoreAggregate = {
  teamId: number;
  orderId: number;
  name: string;
  totalScore: number;
  voteCount: number;
  isActive: boolean;
};

export async function aggregateTeamScores(
  sessionId: number,
): Promise<TeamScoreAggregate[]> {
  const session = await getSessionById(sessionId);
  const teams = await listTeamsBySession(sessionId);
  const activeTeamId = session?.activeTeamId ?? null;

  const aggregates = await db
    .select({
      teamId: votes.teamId,
      totalScore: sql<number>`coalesce(sum(${votes.score}), 0)`,
      voteCount: sql<number>`count(*)`,
    })
    .from(votes)
    .where(eq(votes.sessionId, sessionId))
    .groupBy(votes.teamId);

  const byTeamId = new Map(
    aggregates.map((row) => [
      row.teamId,
      { totalScore: Number(row.totalScore), voteCount: Number(row.voteCount) },
    ]),
  );

  return teams.flatMap((team) =>
    team.id == null
      ? []
      : [
          {
            teamId: team.id,
            orderId: team.orderId,
            name: team.name,
            totalScore: byTeamId.get(team.id)?.totalScore ?? 0,
            voteCount: byTeamId.get(team.id)?.voteCount ?? 0,
            isActive: team.id === activeTeamId,
          },
        ],
  );
}

export type UpsertVoteResult =
  | { ok: true }
  | { ok: false; error: string };

export async function upsertVote(
  sessionId: number,
  teamId: number,
  fingerprint: string,
  score: number,
): Promise<UpsertVoteResult> {
  if (!isValidVoteScore(score)) {
    return { ok: false, error: "Invalid score" };
  }

  const trimmedFingerprint = fingerprint.trim();
  if (!trimmedFingerprint) {
    return { ok: false, error: "Invalid voter" };
  }

  const session = await getSessionById(sessionId);
  if (!session || session.status !== "IN_PROGRESS") {
    return { ok: false, error: "Voting is not open" };
  }
  if (session.activeTeamId !== teamId) {
    return { ok: false, error: "This team is not open for voting" };
  }

  await db
    .insert(votes)
    .values({
      sessionId,
      teamId,
      fingerprint: trimmedFingerprint,
      score,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .onConflictDoUpdate({
      target: [votes.sessionId, votes.teamId, votes.fingerprint],
      set: {
        score,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      },
    });

  return { ok: true };
}
