import type { LiveAudienceState } from "@/lib/audience-state";
import { getLiveAudienceState } from "@/lib/audience-state";
import type { TeamScoreAggregate } from "@/services/votes";
import { aggregateTeamScores } from "@/services/votes";

type Listener<T> = (payload: T) => void;

type LiveEventsStore = {
  audienceListeners: Set<Listener<LiveAudienceState>>;
  scoreListeners: Map<number, Set<Listener<SessionScoresPayload>>>;
};

export type SessionScoresPayload = {
  sessionId: number;
  teams: TeamScoreAggregate[];
};

const STORE_KEY = "__shtxLiveEventsStore__";

function getStore(): LiveEventsStore {
  const g = globalThis as typeof globalThis & {
    [STORE_KEY]?: LiveEventsStore;
  };
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = {
      audienceListeners: new Set(),
      scoreListeners: new Map(),
    };
  }
  return g[STORE_KEY];
}

export function subscribeAudience(
  listener: Listener<LiveAudienceState>,
): () => void {
  const store = getStore();
  store.audienceListeners.add(listener);
  return () => {
    store.audienceListeners.delete(listener);
  };
}

export function subscribeSessionScores(
  sessionId: number,
  listener: Listener<SessionScoresPayload>,
): () => void {
  const store = getStore();
  let set = store.scoreListeners.get(sessionId);
  if (!set) {
    set = new Set();
    store.scoreListeners.set(sessionId, set);
  }
  set.add(listener);
  return () => {
    set!.delete(listener);
    if (set!.size === 0) {
      store.scoreListeners.delete(sessionId);
    }
  };
}

export async function buildSessionScoresPayload(
  sessionId: number,
): Promise<SessionScoresPayload> {
  const teams = await aggregateTeamScores(sessionId);
  return { sessionId, teams };
}

export async function publishAudienceState(): Promise<void> {
  const payload = await getLiveAudienceState();
  const store = getStore();
  for (const listener of store.audienceListeners) {
    listener(payload);
  }
}

export async function publishSessionScores(sessionId: number): Promise<void> {
  const payload = await buildSessionScoresPayload(sessionId);
  const store = getStore();
  const set = store.scoreListeners.get(sessionId);
  if (!set) {
    return;
  }
  for (const listener of set) {
    listener(payload);
  }
}

export async function publishAudienceAndScores(
  sessionId: number,
): Promise<void> {
  await publishAudienceState();
  await publishSessionScores(sessionId);
}
