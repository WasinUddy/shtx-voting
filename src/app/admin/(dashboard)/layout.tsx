import { auth, signOut } from "@/auth";
import { AppWindow } from "@/features/xp/window";
import { XpMenu, XpMenuItem } from "@/features/xp/menu";
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

  const menu = (
    <XpMenu label="File">
      <form action={logout} id="admin-logout-form">
        <XpMenuItem type="submit">Log out</XpMenuItem>
      </form>
    </XpMenu>
  );

  return (
    <AppWindow title="SHTX Voting Console" menu={menu} className="xp-app--admin">
      {children}
    </AppWindow>
  );
}
