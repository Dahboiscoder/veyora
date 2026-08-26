# Build context is the monorepo root (Railway: set Root Directory to "." and
# Dockerfile Path to "apps/realtime/Dockerfile") so npm workspace hoisting
# and the @nyumba/db / @nyumba/shared symlinks resolve correctly.
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/realtime apps/realtime
COPY apps/web/package.json apps/web/package.json
COPY packages/db packages/db
COPY packages/shared packages/shared

# packages/db's postinstall runs `prisma generate`, which needs its schema
# file present — so the full source (not just package.json) must be copied
# in before `npm ci` runs.
RUN npm ci

ENV NODE_ENV=production
EXPOSE 4001

CMD ["npm", "run", "start", "--workspace=apps/realtime"]
