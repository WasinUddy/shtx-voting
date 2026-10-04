import { sql } from "drizzle-orm";
import {
  check,
  integer,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable(
  "sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    status: text("status", {
      enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
    }).notNull(),
    createdAt: text("created_at").default(sql.raw("CURRENT_TIMESTAMP")),
    updatedAt: text("updated_at").default(sql.raw("CURRENT_TIMESTAMP")),
  },
  () => [
    check(
      "sessions_status_check",
      sql.raw("status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')"),
    ),
  ],
);

export const teams = sqliteTable(
  "teams",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: integer("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: text("created_at").default(sql.raw("CURRENT_TIMESTAMP")),
    updatedAt: text("updated_at").default(sql.raw("CURRENT_TIMESTAMP")),
  },
  (table) => [unique().on(table.sessionId, table.name)],
);

export const votes = sqliteTable(
  "votes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: integer("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    fingerprint: text("fingerprint").notNull(),
    score: integer("score").notNull(),
    createdAt: text("created_at").default(sql.raw("CURRENT_TIMESTAMP")),
    updatedAt: text("updated_at").default(sql.raw("CURRENT_TIMESTAMP")),
  },
  (table) => [
    unique().on(table.sessionId, table.teamId, table.fingerprint),
    check("votes_score_check", sql.raw("score >= -3 AND score <= 3")),
  ],
);
