"use client";

import { Alert, Button, Group, TextInput } from "@mantine/core";
import { useActionState } from "react";
import { createTeam } from "./actions";

type CreateTeamFormProps = {
  sessionId: number;
};

export function CreateTeamForm({ sessionId }: CreateTeamFormProps) {
  const [error, action, pending] = useActionState(createTeam, undefined);

  return (
    <form action={action}>
      <input type="hidden" name="sessionId" value={sessionId} />
      <Group align="flex-end" wrap="wrap">
        {error ? (
          <Alert color="red" w="100%">
            {error}
          </Alert>
        ) : null}
        <TextInput
          name="name"
          label="Add team"
          placeholder="Team name"
          required
          style={{ flex: 1, minWidth: 200 }}
        />
        <Button type="submit" loading={pending}>
          Add team
        </Button>
      </Group>
    </form>
  );
}
