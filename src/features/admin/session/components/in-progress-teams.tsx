"use client";

import type { TeamScoreAggregate } from "@/services/votes";
import { FitText } from "@/features/xp/fit-text";
import { GroupBox, XpButton } from "@/features/xp/window";
import { IconOpen } from "@/features/xp/icons";
import { useEffect, useState, useTransition } from "react";
import { setActiveTeam } from "@/features/admin/session/actions";

type TeamRow = {
  id: number;
  name: string;
  orderId: number;
};

type InProgressTeamsProps = {
  sessionId: number;
  teams: TeamRow[];
  activeTeamId: number | null;
  initialScores: TeamScoreAggregate[];
};

function formatScore(total: number): string {
  return total > 0 ? `+${total}` : String(total);
}

export function InProgressTeams({
  sessionId,
  teams,
  activeTeamId,
  initialScores,
}: InProgressTeamsProps) {
  const [scores, setScores] = useState(initialScores);
  const [connected, setConnected] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const source = new EventSource(
      `/api/admin/sessions/${sessionId}/scores`,
    );
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as {
          teams: TeamScoreAggregate[];
        };
        setScores(data.teams);
        setConnected(true);
      } catch {
        // ignore malformed events
      }
    };
    source.onerror = () => {
      setConnected(false);
    };
    return () => {
      source.close();
    };
  }, [sessionId]);

  const scoreByTeamId = new Map(scores.map((row) => [row.teamId, row]));

  function submit(teamId: string) {
    const formData = new FormData();
    formData.set("sessionId", String(sessionId));
    formData.set("teamId", teamId);
    startTransition(async () => {
      await setActiveTeam(formData);
    });
  }

  if (teams.length === 0) {
    return (
      <p className="xp-text-dim">
        No teams in this session. Add teams before starting the session.
      </p>
    );
  }

  const activeTeam =
    teams.find((t) => t.id === activeTeamId) ??
    teams.find((t) => scoreByTeamId.get(t.id)?.isActive);

  const activeStats = activeTeam ? scoreByTeamId.get(activeTeam.id) : undefined;
  const totalVotes = scores.reduce((sum, row) => sum + row.voteCount, 0);
  const activeIndex = activeTeam
    ? teams.findIndex((t) => t.id === activeTeam.id) + 1
    : 0;

  return (
    <>
      <GroupBox label="On stage">
        {activeTeam ? (
          <div className="xp-on-stage">
            <FitText
              text={activeTeam.name}
              className="xp-on-stage__name"
              minFontSizePx={15}
            />
            <span className="xp-on-stage__stat">
              Total score:{" "}
              <strong>
                {formatScore(activeStats?.totalScore ?? 0)}
              </strong>
            </span>
            <span className="xp-on-stage__stat xp-text-dim">
              {activeStats?.voteCount ?? 0}{" "}
              {(activeStats?.voteCount ?? 0) === 1 ? "vote" : "votes"}
            </span>
          </div>
        ) : (
          <p className="xp-text-dim">No team on stage. Use Next team or Open below.</p>
        )}
      </GroupBox>

      <div className="xp-listview">
        <div
          className="xp-listview__header"
          style={{
            gridTemplateColumns:
              "2.5rem minmax(0, 1fr) 5rem 5.5rem minmax(6rem, auto)",
          }}
        >
          <span>#</span>
          <span>Team</span>
          <span className="xp-text-right">Score</span>
          <span className="xp-text-right">Votes</span>
          <span className="xp-text-right">Action</span>
        </div>
        {teams.map((team) => {
          const stats = scoreByTeamId.get(team.id);
          const isActive =
            stats?.isActive ?? team.id === activeTeamId;
          const totalScore = stats?.totalScore ?? 0;
          const voteCount = stats?.voteCount ?? 0;
          return (
            <div
              key={team.id}
              className={`xp-listview__row${isActive ? " xp-listview__row--selected" : ""}`}
              style={{
                gridTemplateColumns:
                  "2.5rem minmax(0, 1fr) 5rem 5.5rem minmax(6rem, auto)",
              }}
            >
              <span className="xp-tabular xp-text-dim">{team.orderId}</span>
              <FitText
                text={team.name}
                className="xp-listview__cell"
                minFontSizePx={12}
              />
              <span className="xp-text-right xp-tabular" style={{ fontWeight: "bold" }}>
                {formatScore(totalScore)}
              </span>
              <span className="xp-text-right xp-tabular xp-text-dim">
                {voteCount}
              </span>
              <span className="xp-row-actions">
                {isActive ? (
                  <XpButton
                    type="button"
                    className="xp-btn--compact"
                    disabled={pending}
                    onClick={() => submit("")}
                  >
                    Clear
                  </XpButton>
                ) : (
                  <XpButton
                    type="button"
                    variant="primary"
                    className="xp-btn--compact"
                    disabled={pending}
                    onClick={() => submit(String(team.id))}
                  >
                    <IconOpen size={14} />
                    Open
                  </XpButton>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <SessionDeskStatus
        connected={connected}
        activeIndex={activeIndex}
        teamCount={teams.length}
        totalVotes={totalVotes}
        statusLabel="In progress"
      />
    </>
  );
}

type SessionDeskStatusProps = {
  connected: boolean;
  activeIndex: number;
  teamCount: number;
  totalVotes: number;
  statusLabel: string;
};

export function SessionDeskStatus({
  connected,
  activeIndex,
  teamCount,
  totalVotes,
  statusLabel,
}: SessionDeskStatusProps) {
  return (
    <div className="xp-inset-statusbar">
      <span className="xp-statusbar__section">{statusLabel}</span>
      <span className="xp-statusbar__section xp-statusbar__section--grow">
        {activeIndex > 0
          ? `Team ${activeIndex} of ${teamCount}`
          : `${teamCount} team${teamCount === 1 ? "" : "s"}`}
      </span>
      <span className="xp-statusbar__section">{totalVotes} votes total</span>
      <span className="xp-statusbar__section">
        {connected ? "Scores: connected" : "Scores: reconnecting"}
      </span>
    </div>
  );
}
