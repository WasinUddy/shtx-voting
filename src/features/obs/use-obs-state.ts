"use client";

import type { ObsState } from "@/lib/obs-state-types";
import { EMPTY_OBS_STATE, obsStateSignature } from "@/lib/obs-state-types";
import { useEffect, useRef, useState } from "react";

export function useObsState(initial?: ObsState) {
  const [state, setState] = useState<ObsState>(initial ?? EMPTY_OBS_STATE);
  const [connected, setConnected] = useState(true);
  const signatureRef = useRef<string | null>(null);

  useEffect(() => {
    const source = new EventSource("/api/obs");
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ObsState;
        const sig = obsStateSignature(data);
        if (signatureRef.current === sig) {
          return;
        }
        signatureRef.current = sig;
        setState(data);
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
  }, []);

  return { state, connected };
}
