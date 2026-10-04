"use client";

import { Badge, Button, Group, Stack, Text } from "@mantine/core";
import { useTransition } from "react";
import { setActiveTeam } from "./actions";

type TeamRow = {
  id: number;
  name: string;
  orderId: number;
};

type ActiveTeamPickerProps = {
  sessionId: number;
  teams: TeamRow[];
  activeTeamId: number | null;
};

export function ActiveTeamPicker({
  sessionId,
  teams,
  activeTeamId,
}: ActiveTeamPickerProps) {
  const [pending, startTransition] = useTransition();

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
        const isActive = team.id === activeTeamId;
        return (
          <Group key={team.id} justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Text
                size="sm"
                c="dimmed"
                className="w-6 shrink-0 text-right tabular-nums"
              >
                {team.orderId}
              </Text>
              <Text size="sm">{team.name}</Text>
              {isActive ? (
                <Badge size="sm" color="green" variant="light">
                  Active
                </Badge>
              ) : null}
            </Group>
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
        );
      })}
    </Stack>
  );
}
