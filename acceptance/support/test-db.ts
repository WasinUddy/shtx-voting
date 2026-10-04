import Database from "better-sqlite3";
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const migrationsDir = path.join(repoRoot, "migrations");

export function getAcceptanceDatabasePath(): string {
  const configured = process.env.DATABASE_PATH;
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(repoRoot, configured);
  }
  return path.join(repoRoot, "acceptance.sqlite");
}

function listMigrationFiles(): string[] {
  return readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));
}

export function initializeTestDatabase(): void {
  const databasePath = getAcceptanceDatabasePath();
  const parent = path.dirname(databasePath);
  if (!existsSync(parent) && parent !== repoRoot) {
    mkdirSync(parent, { recursive: true });
  }
  if (existsSync(databasePath)) {
    unlinkSync(databasePath);
  }

  const sqlite = new Database(databasePath);
  sqlite.pragma("foreign_keys = ON");
  for (const file of listMigrationFiles()) {
    const sql = readFileSync(path.join(migrationsDir, file), "utf8");
    sqlite.exec(sql);
  }
  sqlite.close();
}

export function resetTestDatabase(): void {
  const databasePath = getAcceptanceDatabasePath();
  if (!existsSync(databasePath)) {
    initializeTestDatabase();
    return;
  }

  const sqlite = new Database(databasePath);
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec("DELETE FROM votes;");
  sqlite.exec("DELETE FROM teams;");
  sqlite.exec("DELETE FROM sessions;");
  sqlite.close();
}
