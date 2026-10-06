"use server";

import { publishObsVote, publishSessionScores } from "@/lib/live-events";
import { getMyVoteScore, upsertVote } from "@/services/votes";

export async function submitVote(
  sessionId: number,
  teamId: number,
  fingerprint: string,
  score: number,
): Promise<string | undefined> {
  if (!Number.isFinite(sessionId) || !Number.isFinite(teamId)) {
    return "Invalid request";
  }

  const result = await upsertVote(sessionId, teamId, fingerprint, score);
  if (!result.ok) {
    return result.error;
  }

  publishObsVote({ teamId, score });
  await publishSessionScores(sessionId);
}

export async function loadMyVote(
  sessionId: number,
  teamId: number,
  fingerprint: string,
): Promise<number | null> {
  if (!Number.isFinite(sessionId) || !Number.isFinite(teamId)) {
    return null;
  }
  return getMyVoteScore(sessionId, teamId, fingerprint);
}
