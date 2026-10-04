import { Paper, Title } from "@mantine/core";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Paper withBorder shadow="sm" p="xl" w="100%" maw={400} radius="md">
        <Title order={2} mb="lg">
          Admin login
        </Title>
        <LoginForm />
      </Paper>
    </main>
  );
}
