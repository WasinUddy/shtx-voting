"use client";

import type { TeamScoreAggregate } from "@/services/votes";
import { Badge, Button, Group, Stack, Text } from "@mantine/core";
import { useEffect, useState, useTransition } from "react";
import { setActiveTeam } from "./actions";

type TeamRow = {
  id: number;
  name: string;
  orderId: number;
};

type InProgressTeamsProps = {
  sessionId: number;
  teams: TeamRow[];
  activeTeamId: number | null;
  initialScores: TeamScoreAggregate[];
};

export function InProgressTeams({
  sessionId,
  teams,
  activeTeamId,
  initialScores,
}: InProgressTeamsProps) {
  const [scores, setScores] = useState(initialScores);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const source = new EventSource(
      `/api/admin/sessions/${sessionId}/scores`,
    );
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as {
          teams: TeamScoreAggregate[];
        };
        setScores(data.teams);
      } catch {
        // ignore malformed events
      }
    };
    return () => {
      source.close();
    };
  }, [sessionId]);

  const scoreByTeamId = new Map(scores.map((row) => [row.teamId, row]));

  function submit(teamId: string) {
    const formData = new FormData();
    formData.set("sessionId", String(sessionId));
    formData.set("teamId", teamId);
    startTransition(async () => {
      await setActiveTeam(formData);
    });
  }

  if (teams.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        No teams in this session. Add teams before starting the session.
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        Active team (open for voting)
      </Text>
      {teams.map((team) => {
        const stats = scoreByTeamId.get(team.id);
        const isActive =
          stats?.isActive ?? team.id === activeTeamId;
        const totalScore = stats?.totalScore ?? 0;
        const voteCount = stats?.voteCount ?? 0;
        return (
          <Group key={team.id} justify="space-between" wrap="wrap" gap="sm">
            <Group gap="sm" wrap="nowrap" className="min-w-0 flex-1">
              <Text
                size="sm"
                c="dimmed"
                className="w-6 shrink-0 text-right tabular-nums"
              >
                {team.orderId}
              </Text>
              <Text size="sm" className="min-w-0 truncate">
                {team.name}
              </Text>
              {isActive ? (
                <Badge size="sm" color="green" variant="light">
                  Active
                </Badge>
              ) : null}
            </Group>
            <Group gap="md" wrap="nowrap">
              <Text size="sm" className="tabular-nums" fw={600}>
                {totalScore > 0 ? `+${totalScore}` : totalScore}
              </Text>
              <Text size="xs" c="dimmed" className="tabular-nums">
                {voteCount} {voteCount === 1 ? "vote" : "votes"}
              </Text>
              {isActive ? (
                <Button
                  type="button"
                  variant="subtle"
                  size="compact-sm"
                  disabled={pending}
                  onClick={() => submit("")}
                >
                  Clear
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="light"
                  size="compact-sm"
                  disabled={pending}
                  onClick={() => submit(String(team.id))}
                >
                  Set active
                </Button>
              )}
            </Group>
          </Group>
        );
      })}
    </Stack>
  );
}
