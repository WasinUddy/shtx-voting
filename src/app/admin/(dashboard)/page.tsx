import { Text, Title } from "@mantine/core";

export default function AdminPage() {
  return (
    <main>
      <Title order={2} mb="sm">
        Dashboard
      </Title>
      <Text c="dimmed">You are signed in as admin.</Text>
    </main>
  );
}
