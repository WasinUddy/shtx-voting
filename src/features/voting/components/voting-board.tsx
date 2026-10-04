"use client";

import type { LiveAudienceState } from "@/lib/audience-state";
import { getVisitorId } from "@/lib/get-visitor-id";
import { loadMyVote, submitVote } from "@/features/voting/actions";
import { FitText } from "@/features/xp/fit-text";
import {
  AppWindow,
  StatusBarSection,
  XpAlert,
  XpButton,
} from "@/features/xp/window";
import { useCallback, useEffect, useRef, useState } from "react";

const SCORE_OPTIONS = [3, 2, 1, 0, -1, -2, -3] as const;

function formatScore(score: number): string {
  return score > 0 ? `+${score}` : String(score);
}

function scoreButtonClass(score: number): string {
  if (score > 0) {
    return `xp-btn--score-pos-${score}`;
  }
  if (score < 0) {
    return `xp-btn--score-neg-${Math.abs(score)}`;
  }
  return "xp-btn--score-zero";
}

type VotingBoardProps = {
  initialAudience: LiveAudienceState;
};

export function VotingBoard({ initialAudience }: VotingBoardProps) {
  const [audience, setAudience] = useState(initialAudience);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(true);
  const submitInFlight = useRef(false);

  useEffect(() => {
    const source = new EventSource("/api/live");
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as LiveAudienceState;
        setAudience(data);
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

  useEffect(() => {
    let cancelled = false;
    getVisitorId()
      .then((id) => {
        if (!cancelled) {
          setFingerprint(id);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not identify this device. Refresh and try again.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sessionId = audience.session?.id;
  const teamId = audience.activeTeam?.id;

  useEffect(() => {
    if (!fingerprint || sessionId == null || teamId == null) {
      setSelectedScore(null);
      return;
    }

    let cancelled = false;
    loadMyVote(sessionId, teamId, fingerprint).then((score) => {
      if (!cancelled) {
        setSelectedScore(score);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fingerprint, sessionId, teamId]);

  const vote = useCallback(
    async (score: number) => {
      if (!fingerprint || sessionId == null || teamId == null) {
        return;
      }
      if (submitInFlight.current) {
        return;
      }
      submitInFlight.current = true;
      setError(null);
      let rollbackScore: number | null = null;
      setSelectedScore((prev) => {
        rollbackScore = prev;
        return score;
      });
      const message = await submitVote(sessionId, teamId, fingerprint, score);
      submitInFlight.current = false;
      if (message) {
        setError(message);
        setSelectedScore(rollbackScore);
      }
    },
    [fingerprint, sessionId, teamId],
  );

  const votingOpen =
    audience.session != null && audience.activeTeam != null && fingerprint;

  const statusBar = (
    <>
      <StatusBarSection>
        {connected ? "Connected" : "Reconnecting…"}
      </StatusBarSection>
      <StatusBarSection grow>
        {audience.session?.name ?? "No session"}
      </StatusBarSection>
      <StatusBarSection>
        {selectedScore != null
          ? `Your vote: ${formatScore(selectedScore)}`
          : votingOpen
            ? "No vote yet"
            : "—"}
      </StatusBarSection>
    </>
  );

  return (
    <AppWindow
      title="SHTX Popular Voting"
      statusBar={statusBar}
      className="xp-app--audience"
    >
      {!audience.session ? (
        <div className="xp-waiting">Waiting for a session to start.</div>
      ) : (
        <>
          <div className="xp-vote-header">
            {audience.activeTeam ? (
              <FitText
                text={audience.activeTeam.name}
                as="h1"
                className="xp-vote-header__team"
                minFontSizePx={18}
              />
            ) : (
              <p className="xp-waiting" style={{ margin: "8px 0 0" }}>
                Waiting for the next team.
              </p>
            )}
          </div>

          {error ? (
            <XpAlert title="Could not save vote">{error}</XpAlert>
          ) : null}

          <div className="xp-vote-stack">
            {SCORE_OPTIONS.map((score) => {
              const isSelected = selectedScore === score;
              return (
                <XpButton
                  key={score}
                  type="button"
                  pressed={isSelected}
                  disabled={!votingOpen}
                  className={`xp-btn--score ${scoreButtonClass(score)}`}
                  onClick={() => vote(score)}
                >
                  {formatScore(score)}
                </XpButton>
              );
            })}
          </div>

          {votingOpen ? (
            <p className="xp-vote-hint">
              Tap a score to vote. Tap again to change your vote.
            </p>
          ) : null}
        </>
      )}
    </AppWindow>
  );
}
