import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAcceptanceDatabasePath } from "./test-db.js";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

let serverProcess: ChildProcess | null = null;

export function getBaseUrl(): string {
  return process.env.BASE_URL ?? `http://localhost:${getAcceptancePort()}`;
}

export function getAcceptancePort(): string {
  return process.env.ACCEPTANCE_PORT ?? "3001";
}

function acceptanceEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_ENV: "production",
    DATABASE_PATH: getAcceptanceDatabasePath(),
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "admin",
    AUTH_SECRET:
      process.env.AUTH_SECRET ??
      "acceptance-test-auth-secret-32chars-min",
    PORT: getAcceptancePort(),
  };
}

async function waitForServer(url: string, timeoutMs = 120_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.ok || response.status === 307 || response.status === 308) {
        return;
      }
    } catch {
      // server not ready
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for server at ${url}`);
}

export async function ensureProductionBuild(): Promise<void> {
  if (process.env.SKIP_ACCEPTANCE_BUILD === "1") {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const build = spawn("pnpm", ["run", "build"], {
      cwd: repoRoot,
      env: acceptanceEnv(),
      stdio: "inherit",
    });
    build.on("error", reject);
    build.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`next build failed with exit code ${code ?? "unknown"}`));
      }
    });
  });
}

export async function startAcceptanceServer(): Promise<void> {
  if (process.env.BASE_URL) {
    await waitForServer(process.env.BASE_URL);
    return;
  }

  if (serverProcess) {
    return;
  }

  await ensureProductionBuild();

  serverProcess = spawn(
    "pnpm",
    ["exec", "next", "start", "-p", getAcceptancePort()],
    {
      cwd: repoRoot,
      env: acceptanceEnv(),
      stdio: "pipe",
    },
  );

  serverProcess.stdout?.on("data", (chunk) => {
    if (process.env.ACCEPTANCE_DEBUG === "1") {
      process.stdout.write(chunk);
    }
  });
  serverProcess.stderr?.on("data", (chunk) => {
    if (process.env.ACCEPTANCE_DEBUG === "1") {
      process.stderr.write(chunk);
    }
  });

  await waitForServer(getBaseUrl());
}

export async function stopAcceptanceServer(): Promise<void> {
  if (!serverProcess) {
    return;
  }
  serverProcess.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    serverProcess?.on("exit", () => resolve());
    setTimeout(resolve, 5_000);
  });
  serverProcess = null;
}
