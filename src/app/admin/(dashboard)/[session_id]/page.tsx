import { getSessionById } from "@/services/sessions";
import { listTeamsBySession } from "@/services/teams";
import { Badge, Group, Paper, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { notFound } from "next/navigation";
import { aggregateTeamScores } from "@/services/votes";
import { InProgressTeams } from "./in-progress-teams";
import { CreateTeamForm } from "./create-team-form";
import { SessionDetailStatus } from "./session-detail-status";
import { TeamList } from "./team-list";

type SessionDetailPageProps = PageProps<"/admin/[session_id]">;

export default async function SessionDetailPage({
  params,
}: SessionDetailPageProps) {
  const { session_id } = await params;
  const id = Number.parseInt(session_id, 10);
  if (!Number.isFinite(id)) {
    notFound();
  }

  const session = await getSessionById(id);
  if (!session) {
    notFound();
  }

  const teams = await listTeamsBySession(id);
  const initialScores =
    session.status === "IN_PROGRESS" ? await aggregateTeamScores(id) : [];
  const teamRows = teams.flatMap((team) =>
    team.id == null
      ? []
      : [{ id: team.id, name: team.name, orderId: team.orderId }],
  );

  return (
    <main>
      <Stack gap="md">
        <Link href="/admin" className="text-sm underline">
          ← Back to sessions
        </Link>
        <Group gap="sm" align="center">
          <Title order={2}>{session.name}</Title>
          <SessionDetailStatus sessionId={id} status={session.status} />
        </Group>
        <Text c="dimmed" size="sm">
          Session ID: {session.id}
        </Text>

        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Title order={4}>Teams</Title>
            {session.status === "NOT_STARTED" ? (
              <TeamList sessionId={id} teams={teamRows} />
            ) : session.status === "IN_PROGRESS" ? (
              <InProgressTeams
                sessionId={id}
                teams={teamRows}
                activeTeamId={session.activeTeamId}
                initialScores={initialScores}
              />
            ) : teamRows.length === 0 ? (
              <Text c="dimmed" size="sm">No teams yet.</Text>
            ) : (
              <Stack gap="xs">
                {teamRows.map((team) => (
                  <Group key={team.id} gap="sm" wrap="nowrap">
                    <Text
                      size="sm"
                      c="dimmed"
                      className="w-6 shrink-0 text-right tabular-nums"
                    >
                      {team.orderId}
                    </Text>
                    <Text size="sm">{team.name}</Text>
                    {team.id === session.activeTeamId ? (
                      <Badge size="sm" color="green" variant="light">
                        Active
                      </Badge>
                    ) : null}
                  </Group>
                ))}
              </Stack>
            )}

            {session.status === "NOT_STARTED" ? (
              <CreateTeamForm sessionId={id} />
            ) : null}
          </Stack>
        </Paper>
      </Stack>
    </main>
  );
}
