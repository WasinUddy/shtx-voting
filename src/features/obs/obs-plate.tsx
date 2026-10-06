"use client";

import {
  computeObsLean,
  formatObsScore,
  leanFillPercent,
} from "@/features/obs/format";
import { useObsState } from "@/features/obs/use-obs-state";
import { TitleBar } from "@/features/xp/window";
import { useEffect, useRef, useState } from "react";
import "@/features/obs/obs.css";

export function ObsPlate() {
  const { state } = useObsState();
  const active = state.activeTeam;
  const sessionLive = state.session != null;
  const [displayed, setDisplayed] = useState(active);
  const [exiting, setExiting] = useState(false);
  const [scoreBump, setScoreBump] = useState(false);
  const prevScoreRef = useRef<number | null>(null);

  useEffect(() => {
    if (active) {
      setExiting(false);
      setDisplayed(active);
      return;
    }
    if (!sessionLive) {
      setDisplayed(null);
      setExiting(false);
      return;
    }
    if (!displayed) {
      return;
    }
    setExiting(true);
    const timer = setTimeout(() => {
      setDisplayed(null);
      setExiting(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [active, sessionLive, displayed]);

  useEffect(() => {
    if (!displayed) {
      prevScoreRef.current = null;
      return;
    }
    if (
      prevScoreRef.current != null &&
      prevScoreRef.current !== displayed.totalScore
    ) {
      setScoreBump(true);
      const timer = setTimeout(() => setScoreBump(false), 350);
      prevScoreRef.current = displayed.totalScore;
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = displayed.totalScore;
  }, [displayed]);

  if (!displayed) {
    return <div className="obs-root" />;
  }

  const lean = computeObsLean(displayed.totalScore, displayed.voteCount);
  const fill = leanFillPercent(displayed.totalScore, displayed.voteCount);
  const negWidth = Math.max(0, 50 - fill);
  const posWidth = Math.max(0, fill - 50);

  return (
    <div className="obs-root">
      <div className="obs-plate-anchor">
        <div
          className={`xp-window obs-plate-window${exiting ? " obs-plate-window--exit" : " obs-plate-window--enter"}`}
          data-obs="plate"
          data-team={displayed.name}
          data-score={formatObsScore(displayed.totalScore)}
          data-lean={lean}
        >
          <TitleBar title="On stage" />
          <div className="obs-plate-body">
            <p className="obs-plate__name">{displayed.name}</p>
            <p
              className={`obs-plate__score${scoreBump ? " obs-plate__score--bump" : ""}`}
            >
              {formatObsScore(displayed.totalScore)}
            </p>
            <div className="obs-balance" aria-hidden>
              <span className="obs-balance__center" />
              {negWidth > 0 ? (
                <span
                  className="obs-balance__fill obs-balance__fill--neg"
                  style={{ width: `${negWidth}%` }}
                />
              ) : null}
              {posWidth > 0 ? (
                <span
                  className="obs-balance__fill obs-balance__fill--pos"
                  style={{ width: `${posWidth}%` }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
