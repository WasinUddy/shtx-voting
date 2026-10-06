"use client";

import { formatObsScore, sortObsTeams } from "@/features/obs/format";
import { useObsState } from "@/features/obs/use-obs-state";
import { TitleBar } from "@/features/xp/window";
import { useEffect, useState } from "react";
import "@/features/obs/obs.css";

export function ObsBoard() {
  const { state } = useObsState();
  const hasStage = state.activeTeam != null && state.session != null;
  const sessionLive = state.session != null;
  const [visible, setVisible] = useState(hasStage);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (hasStage) {
      setExiting(false);
      setVisible(true);
      return;
    }
    if (!sessionLive) {
      setVisible(false);
      setExiting(false);
      return;
    }
    if (!visible) {
      return;
    }
    setExiting(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [hasStage, sessionLive, visible]);

  if (!visible || !state.session) {
    return <div className="obs-root" />;
  }

  const rows = sortObsTeams(state.teams);

  return (
    <div className="obs-root obs-root--fill">
      <div
        className={`xp-window xp-window--maximized obs-window--fill obs-board-window${exiting ? " obs-plate-window--exit" : " obs-plate-window--enter"}`}
        data-obs="board"
      >
        <TitleBar title={`Scores — ${state.session.name}`} />
        <div className="xp-client obs-board-body">
            <table className="obs-board-table">
              <thead>
                <tr>
                  <th scope="col">Team</th>
                  <th scope="col" className="obs-board-table__score">Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.teamId}
                    data-obs-row
                    data-team={row.name}
                    data-score={formatObsScore(row.totalScore)}
                    data-active={row.isActive ? "true" : "false"}
                  >
                    <td>{row.name}</td>
                    <td className="obs-board-table__score">
                      {formatObsScore(row.totalScore)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
