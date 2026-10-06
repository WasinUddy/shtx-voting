import type { ObsState, ObsTeamRow } from "@/lib/obs-state-types";
import { getInProgressSession } from "@/services/sessions";
import {
  aggregateTeamScores,
  type TeamScoreAggregate,
} from "@/services/votes";

export type { ObsState, ObsTeamRow } from "@/lib/obs-state-types";
export { EMPTY_OBS_STATE, obsStateSignature } from "@/lib/obs-state-types";

function toObsTeamRow(row: TeamScoreAggregate): ObsTeamRow {
  return {
    teamId: row.teamId,
    orderId: row.orderId,
    name: row.name,
    totalScore: row.totalScore,
    voteCount: row.voteCount,
    isActive: row.isActive,
  };
}

export async function getObsState(): Promise<ObsState> {
  const session = await getInProgressSession();
  if (!session?.id) {
    return { session: null, activeTeam: null, teams: [] };
  }

  const aggregates = await aggregateTeamScores(session.id);
  const teams = aggregates.map(toObsTeamRow);
  const activeRow = aggregates.find((row) => row.isActive);

  return {
    session: { id: session.id, name: session.name },
    activeTeam:
      activeRow == null
        ? null
        : {
            teamId: activeRow.teamId,
            name: activeRow.name,
            totalScore: activeRow.totalScore,
            voteCount: activeRow.voteCount,
          },
    teams,
  };
}
