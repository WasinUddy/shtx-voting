"use client";

import type { LiveAudienceState } from "@/lib/audience-state";
import { getVisitorId } from "@/lib/get-visitor-id";
import { loadMyVote, submitVote } from "@/app/vote-actions";
import {
  Alert,
  Button,
  Center,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useCallback, useEffect, useState, useTransition } from "react";

const SCORE_OPTIONS = [3, 2, 1, 0, -1, -2, -3] as const;

function formatScore(score: number): string {
  return score > 0 ? `+${score}` : String(score);
}

type VotingBoardProps = {
  initialAudience: LiveAudienceState;
};

export function VotingBoard({ initialAudience }: VotingBoardProps) {
  const [audience, setAudience] = useState(initialAudience);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const source = new EventSource("/api/live");
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as LiveAudienceState;
        setAudience(data);
      } catch {
        // ignore malformed events
      }
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
    (score: number) => {
      if (!fingerprint || sessionId == null || teamId == null) {
        return;
      }
      setError(null);
      startTransition(async () => {
        const message = await submitVote(
          sessionId,
          teamId,
          fingerprint,
          score,
        );
        if (message) {
          setError(message);
          return;
        }
        setSelectedScore(score);
      });
    },
    [fingerprint, sessionId, teamId],
  );

  const votingOpen =
    audience.session != null && audience.activeTeam != null && fingerprint;

  if (!audience.session) {
    return (
      <Center className="min-h-[50vh] px-4">
        <Text c="dimmed" ta="center" size="lg">
          Waiting for a session to start.
        </Text>
      </Center>
    );
  }

  return (
    <Stack gap="lg" className="mx-auto w-full max-w-md px-4 py-8">
      <Stack gap={4} ta="center">
        <Text size="sm" c="dimmed" tt="uppercase" fw={600}>
          {audience.session.name}
        </Text>
        {audience.activeTeam ? (
          <Title order={2}>{audience.activeTeam.name}</Title>
        ) : (
          <Text c="dimmed" size="lg">
            Waiting for the next team.
          </Text>
        )}
      </Stack>

      {error ? (
        <Alert color="red" variant="light" title="Could not save vote">
          {error}
        </Alert>
      ) : null}

      <SimpleGrid cols={3} spacing="sm" verticalSpacing="sm">
        {SCORE_OPTIONS.map((score) => {
          const isSelected = selectedScore === score;
          return (
            <Button
              key={score}
              type="button"
              size="xl"
              variant={isSelected ? "filled" : "light"}
              color={isSelected ? "blue" : "gray"}
              disabled={!votingOpen || pending}
              className="min-h-12 text-lg font-semibold"
              onClick={() => vote(score)}
            >
              {formatScore(score)}
            </Button>
          );
        })}
      </SimpleGrid>

      {votingOpen ? (
        <Text size="xs" c="dimmed" ta="center">
          Tap a score to vote. Tap again to change your vote.
        </Text>
      ) : null}
    </Stack>
  );
}
