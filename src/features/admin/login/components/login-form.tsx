"use client";

import { IconKey } from "@/features/xp/icons";
import { XpAlert, XpButton, XpInput } from "@/features/xp/window";
import { useActionState } from "react";
import { login } from "@/features/admin/login/actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, undefined);

  return (
    <form action={action}>
      <div className="xp-login-body">
        <IconKey size={32} />
        <div className="xp-login-fields">
          {error ? <XpAlert>{error}</XpAlert> : null}
          <div className="xp-field">
            <label className="xp-field__label" htmlFor="admin-password">
              Password:
            </label>
            <XpInput
              id="admin-password"
              name="password"
              type="password"
              placeholder="Admin password"
              required
              autoFocus
              aria-label="Password"
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <XpButton type="submit" variant="primary" disabled={pending}>
              {pending ? "Signing in…" : "OK"}
            </XpButton>
          </div>
        </div>
      </div>
    </form>
  );
}
