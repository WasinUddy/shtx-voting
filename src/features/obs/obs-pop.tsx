"use client";

import { formatObsScore } from "@/features/obs/format";
import { useObsState } from "@/features/obs/use-obs-state";
import { useObsVote } from "@/features/obs/use-obs-vote";
import { useEffect, useRef, useState } from "react";
import "@/features/obs/obs.css";

type VisibleVote = {
  id: number;
  score: number;
};

export function ObsPop() {
  const { state } = useObsState();
  const activeTeamId = state.activeTeam?.teamId ?? null;
  const incoming = useObsVote(activeTeamId);
  const [visible, setVisible] = useState<VisibleVote | null>(null);
  const [fading, setFading] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastShownIdRef = useRef(0);

  useEffect(() => {
    if (!incoming || !state.activeTeam) {
      return;
    }
    if (incoming.id <= lastShownIdRef.current) {
      return;
    }
    lastShownIdRef.current = incoming.id;
    setVisible({ id: incoming.id, score: incoming.score });
    setFading(false);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setFading(true);
      hideTimerRef.current = setTimeout(() => {
        setVisible(null);
        setFading(false);
        hideTimerRef.current = null;
      }, 350);
    }, 2800);
  }, [incoming, state.activeTeam]);

  useEffect(() => {
    if (!state.session || !state.activeTeam) {
      setVisible(null);
      setFading(false);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    }
  }, [state.session, state.activeTeam]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  if (!state.session || !state.activeTeam || !visible) {
    return <div className="obs-root" />;
  }

  return (
    <div className="obs-root obs-root--fill">
      <div className="obs-pop-stage">
        <div
          className={`obs-balloon${fading ? " obs-balloon--out" : ""}`}
          data-obs="pop"
          data-vote={formatObsScore(visible.score)}
          key={visible.id}
        >
          <span className="obs-balloon__icon" aria-hidden>i</span>
          <span className="obs-balloon__delta">
            {formatObsScore(visible.score)}
          </span>
          <span className="obs-balloon__close" aria-hidden>×</span>
        </div>
      </div>
    </div>
  );
}
