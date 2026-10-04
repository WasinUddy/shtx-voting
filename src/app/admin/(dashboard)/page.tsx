import { AdminSessionsPage } from "@/features/admin/sessions/components/admin-sessions-page";
import type { SessionListItem } from "@/features/admin/sessions/components/sessions-list";
import { formatSessionUpdatedAt } from "@/lib/format-session-time";
import { listSessions } from "@/services/sessions";

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
      <AdminSessionsPage sessions={sessions} loadFailed={loadFailed} />
    </main>
  );
}
