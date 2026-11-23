# VigilOps

VigilOps is a production-oriented DevOps and API observability platform.

**Production:** https://vigilops.nexovent.tech
**Support:** contact@nexovent.tech

## Features

- Uptime and latency monitors with scheduled live HTTP checks
- Incident lifecycle management and webhook/email alert delivery
- Server-side API Observatory with saved collections and execution history
- SSL certificate and security header scanning
- Unified operational log explorer with CSV and JSON exports
- Opt-in public status pages
- Groq-powered AI incident diagnosis
- Supabase email authentication and GitHub OAuth
- Isolated, auto-expiring anonymous demo workspaces

## Architecture

- Next.js 15 App Router and TypeScript
- Tailwind CSS and shadcn-style UI primitives
- Supabase PostgreSQL, SSR auth, Realtime, and Row Level Security
- TanStack Query and Zustand
- Recharts
- Groq for AI diagnostics
- Resend for optional email alerts
- Vercel Cron and GitHub Actions scheduling

## Local Setup

Requirements:

- Node.js 20.9 or later
- npm 10 or later
- Supabase CLI

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_APP_URL`.

## Environment Variables

Use `.env.example` as the complete production template.

Required for authentication and core data:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://vigilops.nexovent.tech
```

Required for scheduled monitoring:

```dotenv
CRON_SECRET=
```

Optional for AI and notifications:

```dotenv
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
RESEND_API_KEY=
ALERT_FROM_EMAIL=VigilOps <contact@nexovent.tech>
ALERT_TOKEN_ENCRYPTION_KEY=
```

Generate `ALERT_TOKEN_ENCRYPTION_KEY` with:

```bash
openssl rand -hex 32
```

Generate a Cron secret with:

```bash
openssl rand -hex 32
```

## Supabase Setup

Apply migrations sequentially in the Supabase SQL Editor:

1. `supabase/migrations/202611220001_initial.sql`
2. `supabase/migrations/202611220002_indexes.sql`
3. `supabase/migrations/202611220003_rls.sql`
4. `supabase/migrations/202611220004_memberships.sql`
5. `supabase/migrations/202611220005_triggers.sql`
6. `supabase/migrations/202611220006_realtime.sql`
7. `supabase/migrations/202611220007_status.sql`
8. `supabase/migrations/202611220008_demo.sql`

Enable Email/Password authentication in Supabase.

GitHub OAuth is wired through `/auth/callback`. Enable the GitHub provider in Supabase, set the callback URL to `<SUPABASE_URL>/auth/v1/callback`, and configure the application redirect URLs in Auth settings.

Anonymous authentication must be enabled for guest demo mode.

## Deployment

1. Import the GitHub repository into Vercel.
2. Set all production environment variables.
3. Set the framework preset to Next.js.
4. Deploy `main`.
5. Configure `vigilops.nexovent.tech` as the production domain.
6. Add the GitHub Actions `CRON_SECRET` repository secret.

Vercel Cron is configured in `vercel.json` for `/api/cron/check-all`. GitHub Actions also runs every five minutes as a fallback.

The GitHub Actions cron calls:

```bash
curl --fail-with-body --max-time 300 \
  --request POST \
  --header "Authorization: Bearer $CRON_SECRET" \
  https://vigilops.nexovent.tech/api/cron/check-all
```

## Scripts

```bash
npm run check:env
npm run supabase:types
npx tsx scripts/seed-demo.ts
npx tsx scripts/reset-demo.ts
npx tsx scripts/healthcheck.ts
```

The demo scripts require `DEMO_USER_ID`. Reset also accepts `DEMO_WORKSPACE_ID`.

## Verification

```bash
npm run lint
npm run typecheck
npx vitest run tests/unit
npx playwright install --with-deps chromium
npm run test:e2e
npm run build
```

## Free-Tier Limits

- Maximum 25 monitors per workspace
- Minimum monitor interval: 5 minutes
- Maximum monitor/API timeout: 10 seconds
- Maximum HTTP response body: 1 MB
- Demo workspaces expire after 24 hours by default

## Security

Monitor and Observatory targets are validated against loopback, private, reserved, link-local, and metadata addresses. Redirects and response sizes are constrained. Webhook destinations are encrypted at rest with AES-256-GCM, and all workspace data is protected by Supabase RLS.
