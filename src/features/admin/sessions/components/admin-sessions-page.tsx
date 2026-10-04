"use client";

import { CreateSessionToolbarForm } from "./create-session-form";
import { SessionsList, type SessionListItem } from "./sessions-list";
import { StatusBarSection } from "@/features/xp/window";

type AdminSessionsPageProps = {
  sessions: SessionListItem[];
  loadFailed: boolean;
};

export function AdminSessionsPage({ sessions, loadFailed }: AdminSessionsPageProps) {
  const inProgress = sessions.some((s) => s.status === "IN_PROGRESS");

  return (
    <>
      <div className="xp-inset-toolbar">
        <CreateSessionToolbarForm />
      </div>

      <h1 className="xp-page-heading">Sessions</h1>

      {loadFailed ? (
        <p className="xp-text-dim">Could not load sessions. Check the server console.</p>
      ) : null}

      {!loadFailed && sessions.length === 0 ? (
        <p className="xp-text-dim">No sessions yet. Create one using the toolbar above.</p>
      ) : null}

      {!loadFailed && sessions.length > 0 ? (
        <SessionsList
          key={sessions.map((session) => session.id).join(",")}
          sessions={sessions}
        />
      ) : null}

      <p className="xp-help-text">
        Click a row to open a session. Use Start or Complete on each row to change status.
        Only one session can be in progress at a time.
      </p>

      <div className="xp-inset-statusbar">
        <StatusBarSection grow>
          {sessions.length} session{sessions.length === 1 ? "" : "s"}
        </StatusBarSection>
        <StatusBarSection>
          {inProgress ? "One session in progress" : "No session in progress"}
        </StatusBarSection>
        <StatusBarSection>Administrator</StatusBarSection>
      </div>
    </>
  );
}
