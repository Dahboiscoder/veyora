# VEYORA — Real Estate, Reimagined

VEYORA is a next-generation real-estate marketplace built for Africa: 3D property
tours, 360° panoramas, live-hosted viewings, TikTok-style video discovery, an
interactive map, verified agents/agencies, real-time messaging, and full
owner/agent/admin dashboards — running across 11 African countries from day one.

**"VEYORA"** is the current brand name — rename freely. Note that the internal npm
workspace package scope (`@nyumba/db`, `@nyumba/shared`, etc.), the project
directory, and a few internal infra identifiers (cookie names, Docker container
names) still say "nyumba" — those are invisible to end users, so renaming them was
left as a mechanical follow-up rather than done automatically; see
[Renaming further](#renaming-further) below if you want to finish that too.

> This is a real, working application, not a mockup. Every feature described below
> has been built end-to-end (database → API → UI) and manually verified against a
> running instance with seeded data. See [What's not built yet](#whats-not-built-yet)
> for an honest list of what's still an extension point rather than a finished
> feature.

## What's implemented

- **Auth & roles** — email/password registration and login, JWT access + rotating
  refresh tokens in httpOnly cookies, five roles (`USER`, `OWNER`, `AGENT`,
  `COMPANY`, `ADMIN`), route-level authorization on every API endpoint.
- **Property marketplace** — Residential/Commercial/Land/Short-Stay categories,
  18 property types, Sale/Rent/Short-Stay listing types, full spec fields
  (bedrooms, bathrooms, size, amenities, furnished status, etc.), draft →
  published → sold/rented/archived lifecycle.
- **3D & 360° tours** — a real interactive Three.js/React Three Fiber viewer.
  Every listing that has a 3D-tour or 360°-tour media entry gets a genuine
  orbit-controlled walkthrough (drag to look around, scroll to zoom on 3D
  models). Uploads of real `.glb`/`.gltf` models and equirectangular photos are
  fully wired through the media pipeline; where a listing doesn't have a real
  scan yet, the viewer renders a generated stylized building/panorama instead
  of a flat fallback image — see [3D/360 media strategy](#3d360-media-strategy).
- **Live property tours** — agents start a live tour from any published
  listing; viewers see a real-time viewer count, live chat, property info
  sidebar, and can request a private viewing — all over Socket.IO. See
  [Live video](#live-video-ingest) for what's simulated vs. real.
- **Video feed** — a full-screen, swipeable, autoplay vertical feed (own route,
  no site chrome) with favorite/share/contact actions and infinite scroll.
- **Interactive map** — MapLibre GL (no API key required), animated price-pill
  markers, floating property preview on click, used on the listings page (split
  view) and every property detail page.
- **Search** — structured filters (location, price, beds/baths, furnished,
  amenities, verified/3D/video/live) plus a real natural-language parser (try
  "3 bedroom apartment in Kigali under $1,000" on `/search`) — regex-based, not
  an LLM call, so it's instant and free.
- **Messaging** — real-time 1:1 conversations over Socket.IO with REST
  fallback, read receipts, property-attached threads, push-style in-app
  notifications.
- **Notifications** — bell dropdown + full page, live-pushed over Socket.IO,
  covering messages, favorites, viewing requests, verification changes.
- **Owner/agent dashboard** — property CRUD, drag-free multi-type media
  upload (photos/video/360°/3D) direct to S3-compatible storage, publish
  workflow, viewing-request inbox, live-tour controls, an analytics overview
  with a real 14-day views chart (hand-built SVG, no charting library).
- **Admin dashboard** — platform stats, user management (verify/suspend/change
  role), property moderation (approve/reject/verify/feature), report queue.
- **Monetization** — Stripe Checkout wired for featured-listing promotion
  ($/day) and agent/agency subscriptions (Pro/Business), a `/pricing` page, a
  billing page with payment history, and a webhook that fulfills both. Runs
  with zero Stripe keys configured (returns a clean, actionable "not
  configured" response) and activates for real the moment you add
  `STRIPE_SECRET_KEY`.
- **Africa-first geography** — Rwanda, Nigeria, Ghana, Kenya, South Africa,
  Uganda, Tanzania, Ethiopia, Cameroon, Senegal, Côte d'Ivoire, each with real
  cities, currencies, and flags, stored as DB rows (not hardcoded enums) —
  adding a country is editing `packages/shared/src/constants.ts` and reseeding.
- **Design system** — dark, cinematic, glass-morphic UI (Bricolage Grotesque +
  Inter), scroll/parallax animations via Framer Motion, a generative Three.js
  hero scene, mobile bottom-tab navigation, `prefers-reduced-motion` support
  throughout.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS |
| 3D | Three.js · React Three Fiber · @react-three/drei |
| Maps | MapLibre GL JS via `react-map-gl` (no API key required) |
| Backend | Next.js Route Handlers (REST) + a standalone Node/Express/Socket.IO service for realtime |
| Database | PostgreSQL + Prisma ORM |
| Storage | S3-compatible object storage (MinIO locally; swap to AWS S3/Cloudflare R2 by changing env vars only) |
| Auth | Custom JWT (access + rotating refresh tokens), bcrypt password hashing |
| Payments | Stripe Checkout + webhooks |
| Realtime | Socket.IO (messaging, live viewer counts/chat, notifications) |

## Project structure

```
nyumba/
  apps/
    web/          Next.js app — all pages + the REST API (app/api/**)
    realtime/      Node/Express/Socket.IO service (messaging, live tours, notifications)
  packages/
    db/            Prisma schema, migrations, seed script
    shared/         Types, zod validation schemas, constants (countries/currencies/property types), NL search parser
  docker-compose.yml   Postgres, MinIO, Redis
```

## Prerequisites

- Node.js 20+
- Docker (for Postgres/MinIO/Redis — or run equivalents yourself and adjust `DATABASE_URL`/`S3_*`)
- npm

## Setup

```bash
# 1. Install all workspace dependencies
npm install

# 2. Copy env files (defaults already match docker-compose.yml)
cp .env.example packages/db/.env
cp .env.example apps/web/.env.local
cp .env.example apps/realtime/.env
# apps/realtime only needs DATABASE_URL, JWT_ACCESS_SECRET, REALTIME_PORT,
# REALTIME_INTERNAL_SECRET, NEXT_PUBLIC_APP_URL — the rest are unused there.

# 3. Start Postgres, MinIO, Redis
docker compose up -d

# 4. Run migrations + seed realistic demo data (~110 properties across 11 countries)
cd packages/db
npx prisma migrate dev
npx tsx prisma/seed.ts
cd ../..

# 5. Start the web app (http://localhost:3000)
npm run dev:web

# 6. In a second terminal, start the realtime service (http://localhost:4001)
npm run dev:realtime
```

If port 3000 is already in use, Next.js will pick the next free port (check the
terminal output) — update `NEXT_PUBLIC_APP_URL` accordingly if so.

### Demo accounts

All seeded accounts use the password `Veyora2026!`.

| Role | Email |
|---|---|
| Admin | `admin@veyora.dev` |
| Buyer/renter | `demo@veyora.dev` |
| Agency owner | `owner@kigali-prime-properties.dev` |
| Agent | `agent1@kigali-prime-properties.dev` |

The seed script also creates independent agents/owners for every launch
country (`agent@rw.veyora.dev`, `owner@ng.veyora.dev`, etc. — see
`packages/db/prisma/seed.ts` for the full list) and ~10 regular buyer
accounts (`buyer1@veyora.dev` … `buyer9@veyora.dev`).

### Useful scripts

```bash
npm run db:studio      # Prisma Studio — browse/edit the DB visually
npm run db:migrate      # create + apply a new migration
npm run build           # production build of every workspace
```

To wipe and reseed from scratch: `cd packages/db && npx prisma migrate reset --force`.

## Architecture notes & extension points

The platform is built so real third-party integrations drop in without
touching business logic — this section is the honest map of what's real vs.
what's a documented seam.

### 3D/360 media strategy

Real uploads work end-to-end today: the media upload pipeline (presigned S3
PUT → MinIO/S3 → registered on the property) accepts real `.glb`/`.gltf`
models and real equirectangular photos/videos, and the viewer
(`components/three/tour/PropertyTourViewer.tsx`) loads and displays them with
full orbit controls.

For seed data, rather than hot-linking external 3D/panorama assets I don't
control (a reliability and correctness risk — the seed script would silently
break the moment any of those files move), properties flagged as having a 3D
or 360° tour are instead paired with a **procedurally generated** building or
panorama (`ProceduralBuilding.tsx`, `Panorama.tsx`) — a real, fully
interactive Three.js scene generated from the property's bedroom count and a
seeded style/accent, with zero external dependencies. The viewer always
prefers a real uploaded asset when one exists and only falls back to the
generated scene when it doesn't — exactly mirroring the spec's own "if a
property doesn't have a 3D model, provide a beautiful experience instead"
principle, just implemented in 3D rather than as a flat image.

### Live video ingest

The full live-tour *product* is real and working: starting a tour, the
🔴 LIVE badge, real-time viewer count, live chat, and ending a tour all run
over Socket.IO against the database. What's simulated is the video frame
itself — there's no camera/RTMP ingest, so the "broadcast" plays the
property's uploaded walkthrough video (or its photo) in a loop rather than an
actual live camera feed. `LiveStream.streamKey` and `LiveStream.playbackUrl`
already exist on the schema for this purpose — wiring in a real provider
(LiveKit, Mux, Agora, or self-hosted RTMP/HLS) means implementing an ingest
endpoint that sets `playbackUrl`, and pointing `LiveVideoStage`/
`LiveRoomClient` at that URL instead of the looped file. No other part of the
live-tour stack needs to change.

### Payments

Stripe Checkout (featured listings + subscriptions) and its webhook are fully
implemented and route real money the moment you set `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Without
them, checkout endpoints return a clean `501` with an actionable message
instead of crashing — verified by testing both states.

### Maps

Defaults to MapLibre GL with the free `tiles.openfreemap.org` style, so maps
work with zero configuration. Swap `NEXT_PUBLIC_MAP_STYLE_URL` for a
Mapbox/MapTiler style + key for production-grade tiles and geocoding — no
component code needs to change.

### Adding a country

Countries and cities are database rows, not hardcoded enums. Add an entry to
`LAUNCH_COUNTRIES` in `packages/shared/src/constants.ts` and reseed (or write
a small upsert script using the same shape) — every filter, form, and map
already reads from the DB.

## What's not built yet

Documented honestly rather than silently skipped:

- **True push notifications** — in-app/real-time notifications work over
  Socket.IO; OS-level web/mobile push (service worker + Push API) isn't wired.
- **i18n/translated UI** — multi-currency and multi-country are real;
  multi-language UI text is not — everything renders in English regardless of
  locale.
- **A native mobile app** — the web app is mobile-first and fully responsive
  (bottom tab bar, swipeable feed, touch-optimized), but there's no React
  Native/Expo build.

Everything else originally listed here — a countries/cities admin UI, admin
moderation for reviews/live streams/payments, a "recently viewed" page,
online/offline presence in messaging, and duplicate-listing detection on
publish — has since been built.

## Production checklist

Before deploying for real: set non-default `JWT_ACCESS_SECRET`/
`JWT_REFRESH_SECRET`/`REALTIME_INTERNAL_SECRET` (the app's `env.ts` fallback
values are clearly named `dev-insecure-*` and should never reach
production), point `S3_*` at real object storage with a CDN in front of it,
set real Stripe keys and register the webhook endpoint with Stripe, and put
the realtime service behind the same domain (or a CORS-permitted subdomain)
as the web app so its cookie-based auth keeps working.

## Renaming further

The user-facing brand is "VEYORA" — every page title, the logo, footer,
marketing copy, and demo account emails/passwords use it. A few internal,
never-user-visible identifiers still say "nyumba" because changing them is a
large mechanical refactor for zero visible benefit:

- The npm workspace package scope (`@nyumba/db`, `@nyumba/shared`) — imported
  in ~50+ files across the monorepo.
- The project's root directory name (`nyumba/`) and the git remote, if any.
- Docker container/volume names (`nyumba-postgres-1`, etc.), the auth cookie
  names (`nyumba_at`/`nyumba_rt`), and the realtime service's health-check
  string and default DB/S3 credentials.

None of these are visible in the running app. If you want them renamed too
(e.g. before open-sourcing the repo, or just for internal consistency), it's
a mechanical find-and-replace of `nyumba`/`Nyumba` across the codebase
followed by `rm -rf node_modules && npm install` to re-link the renamed
workspace packages — just ask.
