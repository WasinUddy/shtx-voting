"use client";

import { Alert, Button, Group, TextInput } from "@mantine/core";
import { useActionState } from "react";
import { createSession } from "./actions";

export function CreateSessionForm() {
  const [error, action, pending] = useActionState(createSession, undefined);

  return (
    <form action={action}>
      <Group align="flex-end" wrap="wrap">
        {error ? (
          <Alert color="red" w="100%">
            {error}
          </Alert>
        ) : null}
        <TextInput
          name="name"
          label="New session"
          placeholder="Session name"
          required
          style={{ flex: 1, minWidth: 200 }}
        />
        <Button type="submit" loading={pending}>
          Add session
        </Button>
      </Group>
    </form>
  );
}
