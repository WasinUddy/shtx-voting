import { getSessionById } from "@/services/sessions";
import { Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { notFound } from "next/navigation";

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

  return (
    <main>
      <Stack gap="md">
        <Link href="/admin" className="text-sm underline">
          ← Back to sessions
        </Link>
        <Title order={2}>{session.name}</Title>
        <Text c="dimmed">Session ID: {session.id}</Text>
        <Text>Session detail coming soon.</Text>
      </Stack>
    </main>
  );
}
