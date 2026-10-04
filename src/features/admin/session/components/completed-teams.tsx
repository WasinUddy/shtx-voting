"use client";

import { FitText } from "@/features/xp/fit-text";
import type { TeamScoreAggregate } from "@/services/votes";

type TeamRow = {
  id: number;
  name: string;
  orderId: number;
};

type CompletedTeamsProps = {
  teams: TeamRow[];
  scores: TeamScoreAggregate[];
};

function formatScore(total: number): string {
  return total > 0 ? `+${total}` : String(total);
}

export function CompletedTeams({ teams, scores }: CompletedTeamsProps) {
  const scoreByTeamId = new Map(scores.map((row) => [row.teamId, row]));

  const rows = [...teams].sort((a, b) => {
    const sa = scoreByTeamId.get(a.id)?.totalScore ?? 0;
    const sb = scoreByTeamId.get(b.id)?.totalScore ?? 0;
    return sb - sa;
  });

  if (rows.length === 0) {
    return <p className="xp-text-dim">No teams in this session.</p>;
  }

  const totalVotes = scores.reduce((sum, row) => sum + row.voteCount, 0);

  return (
    <>
      <div className="xp-listview">
        <div
          className="xp-listview__header"
          style={{
            gridTemplateColumns: "2.5rem minmax(0, 1fr) 5rem 5.5rem",
          }}
        >
          <span>Rank</span>
          <span>Team</span>
          <span className="xp-text-right">Score</span>
          <span className="xp-text-right">Votes</span>
        </div>
        {rows.map((team, index) => {
          const stats = scoreByTeamId.get(team.id);
          return (
            <div
              key={team.id}
              className="xp-listview__row"
              style={{
                gridTemplateColumns: "2.5rem minmax(0, 1fr) 5rem 5.5rem",
              }}
            >
              <span className="xp-tabular xp-text-dim">{index + 1}</span>
              <FitText
                text={team.name}
                className="xp-listview__cell"
                minFontSizePx={12}
              />
              <span className="xp-text-right xp-tabular" style={{ fontWeight: "bold" }}>
                {formatScore(stats?.totalScore ?? 0)}
              </span>
              <span className="xp-text-right xp-tabular xp-text-dim">
                {stats?.voteCount ?? 0}
              </span>
            </div>
          );
        })}
      </div>
      <div className="xp-inset-statusbar">
        <span className="xp-statusbar__section">Completed</span>
        <span className="xp-statusbar__section xp-statusbar__section--grow">
          Final results
        </span>
        <span className="xp-statusbar__section">{totalVotes} votes total</span>
      </div>
    </>
  );
}
