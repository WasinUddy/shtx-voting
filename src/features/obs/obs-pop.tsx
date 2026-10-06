"use client";

import { formatObsDelta } from "@/features/obs/format";
import { useObsScoreDelta } from "@/features/obs/use-obs-score-delta";
import { useObsState } from "@/features/obs/use-obs-state";
import { useEffect, useState } from "react";
import "@/features/obs/obs.css";

export function ObsPop() {
  const { state } = useObsState();
  const deltaState = useObsScoreDelta(state);
  const [rendered, setRendered] = useState(deltaState);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (deltaState) {
      setRendered(deltaState);
      setFading(false);
      return;
    }
    if (rendered) {
      setFading(true);
      const timer = setTimeout(() => {
        setRendered(null);
        setFading(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [deltaState, rendered]);

  if (!state.session || !state.activeTeam || !rendered) {
    return <div className="obs-root" />;
  }

  return (
    <div className="obs-root">
      <div className="obs-pop-anchor">
        <div
          className={`obs-balloon${fading ? " obs-balloon--out" : ""}`}
          data-obs="pop"
          data-delta={formatObsDelta(rendered.delta)}
          key={rendered.key}
        >
          <span className="obs-balloon__icon" aria-hidden>i</span>
          <span className="obs-balloon__delta">
            {formatObsDelta(rendered.delta)}
          </span>
          <span className="obs-balloon__close" aria-hidden>×</span>
        </div>
      </div>
    </div>
  );
}
