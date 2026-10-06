"use client";

import type { ObsState } from "@/lib/obs-state-types";
import { useEffect, useRef, useState } from "react";

type DeltaState = {
  delta: number;
  key: number;
};

export function useObsScoreDelta(state: ObsState): DeltaState | null {
  const [visible, setVisible] = useState<DeltaState | null>(null);
  const prevTeamIdRef = useRef<number | null>(null);
  const prevTotalRef = useRef<number | null>(null);
  const readyRef = useRef(false);
  const keyRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const active = state.activeTeam;
    if (!active) {
      prevTeamIdRef.current = null;
      prevTotalRef.current = null;
      readyRef.current = false;
      setVisible(null);
      return;
    }

    if (prevTeamIdRef.current !== active.teamId) {
      prevTeamIdRef.current = active.teamId;
      prevTotalRef.current = active.totalScore;
      readyRef.current = true;
      setVisible(null);
      return;
    }

    if (!readyRef.current) {
      prevTotalRef.current = active.totalScore;
      readyRef.current = true;
      return;
    }

    const prevTotal = prevTotalRef.current ?? active.totalScore;
    if (active.totalScore === prevTotal) {
      return;
    }

    const delta = active.totalScore - prevTotal;
    prevTotalRef.current = active.totalScore;
    keyRef.current += 1;
    setVisible({ delta, key: keyRef.current });

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setVisible(null);
      hideTimerRef.current = null;
    }, 2800);
  }, [state]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return visible;
}
