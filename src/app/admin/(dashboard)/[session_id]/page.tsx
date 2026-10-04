import { getSessionById } from "@/services/sessions";
import { listTeamsBySession } from "@/services/teams";
import { notFound } from "next/navigation";
import { aggregateTeamScores } from "@/services/votes";
import { CompletedTeams } from "@/features/admin/session/components/completed-teams";
import { InProgressTeams } from "@/features/admin/session/components/in-progress-teams";
import { SessionDeskToolbar } from "@/features/admin/session/components/session-desk-toolbar";
import { TeamList } from "@/features/admin/session/components/team-list";
import { StatusLabel } from "@/features/xp/window";

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
  const scores =
    session.status !== "NOT_STARTED" ? await aggregateTeamScores(id) : [];
  const teamRows = teams.flatMap((team) =>
    team.id == null
      ? []
      : [{ id: team.id, name: team.name, orderId: team.orderId }],
  );
  const orderedTeamIds = [...teamRows]
    .sort((a, b) => a.orderId - b.orderId)
    .map((t) => t.id);

  return (
    <main>
      <SessionDeskToolbar
        sessionId={id}
        status={session.status}
        teamCount={teamRows.length}
        activeTeamId={session.activeTeamId}
        orderedTeamIds={orderedTeamIds}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <h1 className="xp-page-heading" style={{ margin: 0 }}>{session.name}</h1>
        <StatusLabel status={session.status} />
      </div>
      <p className="xp-text-dim" style={{ margin: "0 0 12px", fontSize: "var(--xp-font-sm)" }}>
        Session ID: {session.id}
      </p>

      {session.status === "NOT_STARTED" ? (
        <>
          <TeamList sessionId={id} teams={teamRows} />
          <div className="xp-inset-statusbar">
            <span className="xp-statusbar__section">Not started</span>
            <span className="xp-statusbar__section xp-statusbar__section--grow">
              {teamRows.length} team{teamRows.length === 1 ? "" : "s"} configured
            </span>
            <span className="xp-statusbar__section">Drag to reorder</span>
          </div>
        </>
      ) : null}

      {session.status === "IN_PROGRESS" ? (
        <InProgressTeams
          sessionId={id}
          teams={teamRows}
          activeTeamId={session.activeTeamId}
          initialScores={scores}
        />
      ) : null}

      {session.status === "COMPLETED" ? (
        <CompletedTeams teams={teamRows} scores={scores} />
      ) : null}
    </main>
  );
}
