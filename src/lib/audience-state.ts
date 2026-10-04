import { getTeamById } from "@/services/teams";
import { getInProgressSession } from "@/services/sessions";

export type LiveAudienceState = {
  session: { id: number; name: string } | null;
  activeTeam: { id: number; name: string } | null;
};

export async function getLiveAudienceState(): Promise<LiveAudienceState> {
  const session = await getInProgressSession();
  if (!session?.id) {
    return { session: null, activeTeam: null };
  }

  const sessionPayload = { id: session.id, name: session.name };

  if (session.activeTeamId == null) {
    return { session: sessionPayload, activeTeam: null };
  }

  const team = await getTeamById(session.activeTeamId);
  if (!team || team.sessionId !== session.id) {
    return { session: sessionPayload, activeTeam: null };
  }

  if (team.id == null) {
    return { session: sessionPayload, activeTeam: null };
  }

  return {
    session: sessionPayload,
    activeTeam: { id: team.id, name: team.name },
  };
}
