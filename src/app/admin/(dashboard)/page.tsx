import { CreateSessionForm } from "./create-session-form";
import { SessionsList } from "./sessions-list";
import { formatSessionUpdatedAt } from "@/lib/format-session-time";
import { listSessions } from "@/services/sessions";
import { Paper, Stack, Text, Title } from "@mantine/core";

export default async function AdminPage() {
  const sessionList = await listSessions();

  const sessions = sessionList
    .filter((session) => session.id != null)
    .map((session) => ({
      id: session.id,
      name: session.name,
      status: session.status,
      updatedAtLabel: formatSessionUpdatedAt(session.updatedAt),
    }));

  return (
    <main>
      <Stack gap="md">
        <Title order={2}>Sessions</Title>

        <Paper withBorder p="sm" radius="md">
          <CreateSessionForm />
        </Paper>

        {sessions.length === 0 ? (
          <Text c="dimmed" size="sm">No sessions yet. Create one above.</Text>
        ) : (
          <SessionsList sessions={sessions} />
        )}

        <Text size="xs" c="dimmed">
          Click a status pill to advance it. Completed sessions stay completed.
          Only one session can be in progress at a time.
        </Text>
      </Stack>
    </main>
  );
}
