ALTER TABLE teams ADD COLUMN order_id INTEGER NOT NULL DEFAULT 0;

UPDATE teams
SET order_id = (
    SELECT COUNT(*)
    FROM teams AS earlier
    WHERE earlier.session_id = teams.session_id
      AND (
        earlier.created_at < teams.created_at
        OR (
            earlier.created_at = teams.created_at
            AND earlier.id <= teams.id
        )
      )
);

CREATE UNIQUE INDEX IF NOT EXISTS teams_session_order_id_unique
    ON teams (session_id, order_id);
