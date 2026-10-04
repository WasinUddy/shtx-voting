import { auth, signOut } from "@/auth";
import { Button, Group, Title } from "@mantine/core";
import { redirect } from "next/navigation";

async function logout() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}

export default async function AdminDashboardLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-black/[.08] px-6 py-3 dark:border-white/[.145]">
        <Group justify="space-between">
          <Title order={3}>Admin Session Management</Title>
          <form action={logout}>
            <Button type="submit" variant="default">
              Log out
            </Button>
          </form>
        </Group>
      </header>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
