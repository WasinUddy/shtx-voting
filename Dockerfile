# -- NEXT.JS build stage
FROM node:22-alpine AS builder

WORKDIR /app

# better-sqlite3 falls back to node-gyp when prebuilds are unavailable
RUN apk add --no-cache python3 make g++ sqlite sqlite-dev

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN mkdir -p /app/data
RUN touch /app/data/db.sqlite

RUN for migration in migrations/*.sql; do sqlite3 /app/data/db.sqlite < "$migration"; done

ENV DATABASE_PATH="/app/data/db.sqlite"
RUN pnpm run build

RUN pnpm prune --prod

# -- NEXT.JS production stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_PATH="/app/data/db.sqlite"

RUN apk add --no-cache sqlite

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/data ./data

EXPOSE 3000

CMD ["node", "node_modules/next/dist/bin/next", "start"]
