"use client";

import type { ObsVoteEvent } from "@/lib/obs-vote-types";
import { useEffect, useState } from "react";

export function useObsVote(activeTeamId: number | null): ObsVoteEvent | null {
  const [latest, setLatest] = useState<ObsVoteEvent | null>(null);

  useEffect(() => {
    const source = new EventSource("/api/obs/votes");
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ObsVoteEvent;
        if (activeTeamId == null || data.teamId !== activeTeamId) {
          return;
        }
        setLatest(data);
      } catch {
        // ignore malformed events
      }
    };
    return () => {
      source.close();
    };
  }, [activeTeamId]);

  useEffect(() => {
    if (activeTeamId == null) {
      setLatest(null);
    }
  }, [activeTeamId]);

  return latest;
}
