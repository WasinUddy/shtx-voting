"use client";

import { Alert, Button, PasswordInput, Stack } from "@mantine/core";
import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, undefined);

  return (
    <form action={action}>
      <Stack>
        {error ? <Alert color="red">{error}</Alert> : null}
        <PasswordInput
          name="password"
          label="Password"
          placeholder="Admin password"
          required
          autoFocus
        />
        <Button type="submit" loading={pending}>
          Sign in
        </Button>
      </Stack>
    </form>
  );
}
