import type { LiveAudienceState } from "@/lib/audience-state";
import { getLiveAudienceState } from "@/lib/audience-state";
import type { ObsState } from "@/lib/obs-state";
import { getObsState } from "@/lib/obs-state";
import type { ObsVoteEvent } from "@/lib/obs-vote-types";
import type { TeamScoreAggregate } from "@/services/votes";
import { aggregateTeamScores } from "@/services/votes";

type Listener<T> = (payload: T) => void;

type LiveEventsStore = {
  audienceListeners: Set<Listener<LiveAudienceState>>;
  scoreListeners: Map<number, Set<Listener<SessionScoresPayload>>>;
  obsListeners: Set<Listener<ObsState>>;
  obsVoteListeners: Set<Listener<ObsVoteEvent>>;
  nextObsVoteId: number;
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
      obsListeners: new Set(),
      obsVoteListeners: new Set(),
      nextObsVoteId: 1,
    };
  }
  const store = g[STORE_KEY]!;
  if (!store.obsVoteListeners) {
    store.obsVoteListeners = new Set();
    store.nextObsVoteId = 1;
  }
  return store;
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

export function subscribeObsState(listener: Listener<ObsState>): () => void {
  const store = getStore();
  store.obsListeners.add(listener);
  return () => {
    store.obsListeners.delete(listener);
  };
}

export async function publishObsState(): Promise<void> {
  const payload = await getObsState();
  const store = getStore();
  for (const listener of store.obsListeners) {
    listener(payload);
  }
}

export function subscribeObsVotes(
  listener: Listener<ObsVoteEvent>,
): () => void {
  const store = getStore();
  store.obsVoteListeners.add(listener);
  return () => {
    store.obsVoteListeners.delete(listener);
  };
}

export function publishObsVote(event: {
  teamId: number;
  score: number;
}): void {
  const store = getStore();
  const payload: ObsVoteEvent = {
    id: store.nextObsVoteId++,
    teamId: event.teamId,
    score: event.score,
  };
  for (const listener of store.obsVoteListeners) {
    listener(payload);
  }
}

export async function publishAudienceState(): Promise<void> {
  const payload = await getLiveAudienceState();
  const store = getStore();
  for (const listener of store.audienceListeners) {
    listener(payload);
  }
  await publishObsState();
}

export async function publishSessionScores(sessionId: number): Promise<void> {
  const payload = await buildSessionScoresPayload(sessionId);
  const store = getStore();
  const set = store.scoreListeners.get(sessionId);
  if (set) {
    for (const listener of set) {
      listener(payload);
    }
  }
  await publishObsState();
}

export async function publishAudienceAndScores(
  sessionId: number,
): Promise<void> {
  await publishAudienceState();
  await publishSessionScores(sessionId);
}
