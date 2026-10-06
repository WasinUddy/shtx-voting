export type ObsTeamRow = {
  teamId: number;
  orderId: number;
  name: string;
  totalScore: number;
  voteCount: number;
  isActive: boolean;
};

export type ObsState = {
  session: { id: number; name: string } | null;
  activeTeam: {
    teamId: number;
    name: string;
    totalScore: number;
    voteCount: number;
  } | null;
  teams: ObsTeamRow[];
};

export const EMPTY_OBS_STATE: ObsState = {
  session: null,
  activeTeam: null,
  teams: [],
};

export function obsStateSignature(state: ObsState): string {
  const active = state.activeTeam;
  const teamSig = state.teams
    .map(
      (t) =>
        `${t.teamId}:${t.totalScore}:${t.voteCount}:${t.isActive ? 1 : 0}`,
    )
    .join("|");
  return `${state.session?.id ?? "none"}:${active?.teamId ?? "none"}:${active?.totalScore ?? 0}:${active?.voteCount ?? 0}:${teamSig}`;
}
