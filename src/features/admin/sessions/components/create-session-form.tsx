"use client";

import { IconAdd } from "@/features/xp/icons";
import { ToolbarButton, XpAlert, XpInput } from "@/features/xp/window";
import { useActionState } from "react";
import { createSession } from "@/features/admin/sessions/actions";

export function CreateSessionToolbarForm() {
  const [error, action, pending] = useActionState(createSession, undefined);

  return (
    <form action={action} className="xp-toolbar-form">
      {error ? <XpAlert>{error}</XpAlert> : null}
      <span className="xp-toolbar-label">New session:</span>
      <XpInput name="name" placeholder="Session name" required aria-label="Session name" />
      <ToolbarButton type="submit" disabled={pending} title="Add session">
        <IconAdd />
        <span>{pending ? "Adding…" : "Add"}</span>
      </ToolbarButton>
    </form>
  );
}
