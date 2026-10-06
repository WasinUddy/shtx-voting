# ShtX-Popular-Voting System

Popular voting system for the Thailand 10th Stupid Hackathon pitching session. Built with love — this event always brings me great fun.

## Features

- **Live audience voting** — Attendees score the team on stage from **-3** to **+3** and can change their vote until the stage moves on.
- **Real-time updates** — Admin desk and voting clients stay in sync over **Server-Sent Events** (no manual refresh).
- **Session management** — Admins create sessions, add teams, reorder the lineup, start or complete runs, and view final results.
- **Stage control** — Open a team on stage, clear the stage, and watch the audience UI follow (waiting states when nothing is live).
- **One active session** — Starting a new session automatically completes any other session that was still in progress.
- **Fair-ish device limits** — Votes are keyed by a browser **fingerprint** so each device gets one score per team per session.
- **Admin authentication** — Password-protected admin area (NextAuth) separate from the public voting page.
- **Persistent storage** — **SQLite** with **Drizzle ORM**; ready to run locally or in **Docker**.

## Design

The UI is a deliberate throwback: **Windows XP**–style windows, title bars, list views, Luna colors, and chunky buttons (`xp-*` components and theme tokens in `globals.css`).

> **Note:** The Windows XP visual design was created with help from **Anthropic Claude**.

- **Audience** — Full-screen “desktop” with a voting window and score pad.
- **Admin** — Console-style sessions list and per-session desk for teams, stage, and live score totals.

## OBS browser sources

Use separate **Browser Source** layers in OBS (or similar) so you can move, crop, and resize each piece. Every overlay page fills the source rectangle you give it and uses a **transparent** background outside the graphic. Typography scales with the source size (`vmin` / `clamp`), so you are not locked to 1920×1080—pick any width and height in OBS.

In OBS: add a Browser Source, point it at your app URL, enable **transparent background** if your OBS version exposes that option, and set width/height to taste.

| URL | Role |
| --- | --- |
| `/obs/frame?title=…` | Luna window frame; client area stays see-through for camera or game capture underneath. |
| `/obs/frame?title=…&trans=true` | **Title bar only** (no window chrome). Same `title` query as above. `trans` also accepts `1` or `yes`. |
| `/obs/plate` | On-stage team name, **running total** score, and red/green **lean** bar (room average, not the raw total). |
| `/obs/board` | Leaderboard for all teams in the active session (sorted by score). Hidden when no team is on stage. |
| `/obs/pop` | XP balloon for each **incoming vote** on the current team (`+2`, `-1`, etc.). Not the change in total when someone revotes. Hidden when the stage is empty. |

**Live data**

- `/api/obs` — SSE snapshot of session, stage, and team aggregates (plate + board).
- `/api/obs/votes` — SSE **per vote** events for the pop (no backlog when a source connects mid-show).

Plate, board, and pop render nothing when there is no in-progress session or nobody is on stage. The frame is always visible if you load it.

**Example** (production host `vote.example.com`):

```text
https://vote.example.com/obs/frame?title=SHTX%20Live
https://vote.example.com/obs/frame?title=SHTX%20Live&trans=true
https://vote.example.com/obs/plate
https://vote.example.com/obs/board
https://vote.example.com/obs/pop
```

Acceptance coverage: `acceptance/features/obs_overlays.feature`.

## Development

### Prerequisites

- **Node.js 22** (matches CI and the Docker image)
- **pnpm 10** — enable via Corepack: `corepack enable` (version is pinned in `package.json` as `pnpm@10.30.3`)
- **SQLite CLI** (`sqlite3`) — used to apply SQL migrations to your local database file
- **Native build tools** — required to compile `better-sqlite3` if a prebuilt binary is not available (on Linux/Docker: `python3`, `make`, `g++`, `sqlite-dev`; on macOS, Xcode Command Line Tools are usually enough)

### Run locally

1. Install dependencies:

   ```bash
   corepack enable
   pnpm install
   ```

2. Create a database and apply migrations (default path `./data.sqlite`):

   ```bash
   export DATABASE_PATH=./data.sqlite
   touch "$DATABASE_PATH"
   for migration in migrations/*.sql; do sqlite3 "$DATABASE_PATH" < "$migration"; done
   ```

3. Configure environment variables (see table below). For day-to-day dev, put them in `.env.local` in the project root — Next.js loads that file automatically:

   ```bash
   # .env.local
   DATABASE_PATH=./data.sqlite
   ADMIN_PASSWORD=admin
   AUTH_SECRET=dev-auth-secret-at-least-32-characters-long
   ```

4. Start the dev server:

   ```bash
   pnpm dev
   ```

5. Open the app:

   | URL | Purpose |
   | --- | --- |
   | [http://localhost:3000](http://localhost:3000) | Audience voting |
   | [http://localhost:3000/admin/login](http://localhost:3000/admin/login) | Admin console (use `ADMIN_PASSWORD`) |

Other useful scripts: `pnpm build` / `pnpm start` (production mode), `pnpm lint`.

### Docker

Build and run the production image (migrations run at image build time; DB lives at `/app/data/db.sqlite` inside the container):

```bash
docker build -t shtx-voting .
docker run --rm -p 3000:3000 \
  -e ADMIN_PASSWORD=admin \
  -e AUTH_SECRET=dev-auth-secret-at-least-32-characters-long \
  shtx-voting
```

### Environment variables

#### Application (local dev, `pnpm start`, Docker)

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_PATH` | No | `./data.sqlite` | Path to the SQLite database file used by the app. |
| `ADMIN_PASSWORD` | **Yes** | — | Password for admin sign-in at `/admin/login`. If unset, login always fails. |
| `AUTH_SECRET` | **Yes** | — | Secret for NextAuth JWT/session signing. Use a long random string (32+ characters recommended). |

`NODE_ENV` is set automatically by Next.js (`development` for `pnpm dev`, `production` for `pnpm start` / Docker).

#### Acceptance tests only

Used by `pnpm run test:acceptance` (see `acceptance/support/server.ts` and `package.json`). The test script already sets `DATABASE_PATH`, `ADMIN_PASSWORD`, and `AUTH_SECRET` unless you override them.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_PATH` | No | `./acceptance.sqlite` | SQLite file for the test server (recreated per run). |
| `ADMIN_PASSWORD` | No | `admin` | Admin password during acceptance runs. |
| `AUTH_SECRET` | No | `acceptance-test-auth-secret-32chars-min` | NextAuth secret for the test server. |
| `ACCEPTANCE_PORT` | No | `3001` | Port for `next start` spawned by Cucumber hooks. |
| `BASE_URL` | No | `http://localhost:<ACCEPTANCE_PORT>` | If set, tests use this URL and **do not** start a local server. |
| `SKIP_ACCEPTANCE_BUILD` | No | — | Set to `1` to skip `pnpm build` before acceptance (useful if you already built). |
| `ACCEPTANCE_DEBUG` | No | — | Set to `1` to print the acceptance server stdout/stderr. |
| `HEADED` | No | — | Set to `1` to run Playwright in headed mode (not headless). |
| `CI` | No | — | Set to `true` in GitHub Actions; affects tooling behavior where relevant. |

## CI

GitHub Actions workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

| Stage | What it does |
| --- | --- |
| **Playwright cache** | Installs dependencies and warms the Chromium browser cache for acceptance tests. |
| **Acceptance tests** | **Cucumber** scenarios run in parallel (Playwright-backed) for `admin_sessions`, `client_voting`, `live_voting_sync`, and `obs_overlays`. |
| **Pull requests** | After acceptance passes, a **Docker build** (`linux/amd64`) runs as a merge gate (image is not pushed). |
| **Push to `main` / manual dispatch** | Multi-arch **GHCR** publish (`amd64` + `arm64`), manifest tags `latest` and short commit SHA; temporary `-build` images are cleaned up afterward. |

**Triggers:** `pull_request`, `push` to `main`, and `workflow_dispatch`.

**Run acceptance tests locally:**

```bash
pnpm install
pnpm run test:acceptance
```
