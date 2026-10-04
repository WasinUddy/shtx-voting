import { CreateSessionForm } from "./create-session-form";
import { SessionsList, type SessionListItem } from "./sessions-list";
import { formatSessionUpdatedAt } from "@/lib/format-session-time";
import { listSessions } from "@/services/sessions";
import { Paper, Stack, Text, Title } from "@mantine/core";

export default async function AdminPage() {
  let sessions: SessionListItem[] = [];
  let loadFailed = false;

  try {
    const sessionList = await listSessions();
    sessions = sessionList
      .filter((session) => session.id != null)
      .map((session) => ({
        id: session.id,
        name: session.name,
        status: session.status,
        updatedAtLabel: formatSessionUpdatedAt(session.updatedAt),
      }));
  } catch (error) {
    loadFailed = true;
    console.error("Failed to load sessions for /admin:", error);
  }

  return (
    <main>
      <Stack gap="md">
        <Title order={2}>Sessions</Title>

        {loadFailed ? (
          <Text c="dimmed" size="sm">
            Could not load sessions. Check the server console for details.
          </Text>
        ) : null}

        <Paper withBorder p="sm" radius="md">
          <CreateSessionForm />
        </Paper>

        {!loadFailed && sessions.length === 0 ? (
          <Text c="dimmed" size="sm">No sessions yet. Create one above.</Text>
        ) : null}

        {!loadFailed && sessions.length > 0 ? (
          <SessionsList sessions={sessions} />
        ) : null}

        <Text size="xs" c="dimmed">
          Click a status pill to advance it. Completed sessions stay completed.
          Only one session can be in progress at a time.
        </Text>
      </Stack>
    </main>
  );
}
