# VigilOps

**Monitor. Test. Secure. Resolve.**  
A unified workspace for service health, API behavior, security posture, and incident response.

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Hosted%20on-Vercel-black?logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live Status](https://img.shields.io/website?url=https%3A%2F%2Fvigilops.nexovent.tech&label=live%20status)](https://vigilops.nexovent.tech)

**Live application:** [https://vigilops.nexovent.tech](https://vigilops.nexovent.tech)  
**Support:** [contact@nexovent.tech](mailto:contact@nexovent.tech)

## What is VigilOps?

VigilOps brings essential operational signals into one place. Add website and API monitors, inspect endpoint responses, scan TLS certificates and security headers, manage incidents, and review the evidence behind operational changes.

It is built for **Indie Hackers, SaaS founders, web agencies, freelancers, and DevOps engineers** who want a practical operational view without stitching together a collection of separate tools. Workspaces and projects organize services, while Supabase authentication and row-level security help isolate customer data.

The repository includes a live demo flow that creates an anonymous, expiring demo workspace. Monitoring is performed by real server-side HTTP requests; demo fixtures are separate from live service checks.

## Key Features

### Uptime and latency monitoring

- Create monitors for HTTP and HTTPS endpoints, with configurable check intervals, timeouts, expected status codes, and request headers.
- Run a live ping on demand or let the scheduled check endpoint process due monitors.
- Review status codes, latency, response size, errors, and ping history.
- View uptime bars and latency charts for monitored services.
- The application currently enforces a **25-monitor-per-workspace limit**, check intervals from **5 minutes to 24 hours**, and timeouts from **1 to 10 seconds**.

### Security and SSL/TLS scanner

- Scan a domain using live HTTP, HTTPS, and TLS certificate checks.
- Inspect certificate validity, expiry, and negotiated TLS protocol.
- Evaluate security headers, including HSTS, CSP, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy.
- Calculate a score from **0–100**, assign a grade, and save findings with recommendations.

### API Observatory

- Run server-side `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS` requests.
- Configure query parameters, headers, bearer-token or API-key authentication, and request bodies.
- Inspect status, latency, timing, response headers, payload size, and formatted response data.
- Save requests in project collections and review execution history.

### AI Incident Doctor

- Request a diagnosis using evidence from a monitor, incident, API run, or security scan.
- Get a root-cause summary, severity, confidence, likely causes, and remediation steps.
- Sensitive values are redacted before evidence is sent to Groq.
- AI diagnosis is an optional integration and requires a Groq API key.

### Incident management

- Create incidents and track their status through **Investigating**, **Identified**, **Monitoring**, and **Resolved**.
- Add updates to an incident timeline and keep operational context together.
- Monitor lifecycle processing can create or resolve incidents when service health changes.

### Alerts

- Configure email alerts through Resend or webhook alerts for supported Discord and Slack destinations.
- Test alert channels and review delivery history.
- Webhook destinations are encrypted at rest using AES-256-GCM. Email delivery requires both Resend configuration variables.

### Command Center dashboard

- View workspace KPIs and operational data with **24-hour, 7-day, and 30-day** ranges.
- Explore uptime, latency, and traffic charts, incident activity, and recent workspace events.
- Dashboard data refreshes in the client; workspace membership controls access.

### Log Explorer and export

- Search and filter normalized operational logs by service, status group, date range, request ID, and text.
- Explore monitor pings and API activity in a unified view.
- Export filtered results as CSV or JSON.

### Public status pages

- Publish a status page at `/status/[workspaceSlug]`.
- Public visibility is opt-in: the workspace and the projects containing public services must have public status enabled.
- Display service health, uptime history, latency summaries, and public incident history without exposing private request headers or credentials.

### Workspaces, access controls, and demo mode

- Organize services into workspaces and projects, with owner, admin, member, and viewer roles.
- Supabase Row Level Security and application membership checks scope workspace data.
- Server-side URL safety checks block localhost and private or reserved network targets for outbound checks.
- The live demo uses Supabase anonymous authentication and provisions a time-limited workspace. Anonymous sign-ins must be enabled in Supabase Auth.

## Tech Stack and Architecture

| Area | Technologies |
|---|---|
| Application | Next.js 15 App Router, React 19, TypeScript |
| UI | Tailwind CSS, local shadcn-style UI primitives, Lucide icons, CSS/IntersectionObserver reveal effects |
| Data and state | TanStack Query, Zustand, Recharts |
| Validation | Zod |
| Database and authentication | Supabase PostgreSQL, Supabase Auth, RLS, Realtime |
| AI diagnostics | Groq API (`llama-3.3-70b-versatile` by default) |
| Alert delivery | Resend, Discord and Slack webhooks |
| Testing | Vitest, Playwright |
| Hosting and automation | Vercel, GitHub Actions |

```text
Browser
  │
  ▼
Next.js App Router ────── Supabase Auth (session cookies / anonymous demo auth)
  │                              │
  ├─ Protected API routes        ▼
  │   ├─ Monitor checks      PostgreSQL + RLS
  │   ├─ Security scans      Workspaces, projects, monitors,
  │   ├─ API Observatory     logs, incidents, alerts, diagnoses
  │   └─ Incident and alert
  │      workflows
  │
  ├─ Scheduled checks ◄──── GitHub Actions (every 5 minutes)
  │                    ◄──── Vercel Cron (daily schedule in vercel.json)
  │
  ├─ AI diagnosis ─────────► Groq (optional; redacted evidence)
  └─ Alert delivery ────────► Resend / Discord / Slack
```

The GitHub Actions workflow provides the five-minute scheduled check cadence. The Vercel Cron configured in `vercel.json` is daily; deployment plans and provider quotas may affect which scheduler is appropriate for your deployment.

## How to Use VigilOps

1. **Create an account or try the live demo.** Sign up using the configured Supabase Auth providers, or choose the demo flow to create an anonymous workspace. Demo mode requires anonymous sign-ins to be enabled in Supabase.
2. **Create a monitor.** In the workspace, open **Monitors**, choose a project, and enter the endpoint, expected status codes, interval, timeout, and optional headers.
3. **Run a live ping.** Open a monitor and run a check to record its status, latency, response details, and history.
4. **Run a security scan.** Open **Security**, choose a project, and enter a domain to inspect its certificate and response headers.
5. **Test an API.** Use **Observatory** to configure a request, send it through the server-side runner, inspect the response, and optionally save it to a collection.
6. **Set up alerts.** Add an email or webhook channel under **Alerts** and use its test action to verify delivery. Email requires Resend configuration; webhook channels require `ALERT_TOKEN_ENCRYPTION_KEY`.
7. **Enable a public status page.** Enable public status for the workspace and the relevant project. Share the resulting `/status/[workspaceSlug]` URL.

## Project Structure

```text
.
├── .github/
│   └── workflows/             # CI, dependency review, scheduled monitor checks
├── scripts/                   # Environment, Supabase type, demo, and health scripts
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login, signup, password, and auth callback pages
│   │   ├── (marketing)/        # Public landing page
│   │   ├── (workspace)/        # Dashboard and authenticated product pages
│   │   ├── api/                # Authenticated APIs, monitoring, alerts, scans, logs
│   │   └── status/             # Public workspace status pages
│   ├── components/
│   │   ├── ai/ alerts/ dashboard/ incidents/ layout/ logs/
│   │   ├── marketing/ monitors/ observatory/ security/ status/ ui/
│   ├── hooks/                  # Query and feature hooks
│   ├── lib/
│   │   ├── ai/ alerts/ analytics/ auth/ demo/ incidents/ logs/
│   │   ├── network/ observatory/ security/ status/ supabase/ types/
│   │   ├── utils/ validations/
│   ├── middleware.ts
│   └── stores/                 # Workspace, UI, command palette, Observatory state
├── supabase/
│   ├── migrations/             # Database schema, policies, functions, and triggers
│   ├── tests/                  # SQL RLS tests
│   ├── config.toml
│   └── seed.sql
├── tests/
│   ├── e2e/                    # Playwright browser tests
│   ├── integration/            # Vitest integration tests
│   ├── setup/
│   └── unit/                   # Vitest unit tests
├── package.json
├── playwright.config.ts
├── vitest.config.ts
└── vercel.json
```

## Local Setup

### Prerequisites

- Node.js **20.9 or later**
- npm **10 or later**
- A Supabase project, or the Supabase CLI for applying migrations
- Git

### Clone and install

```bash
git clone https://github.com/AshishVail/vigilops.git
cd vigilops
npm ci
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase project URL, anon/publishable key, service-role key, and local application URL. Keep service-role keys and other secrets private; never commit `.env.local`.

### Configure Supabase

Apply all migrations in order. With the Supabase CLI installed and authenticated:

```bash
supabase login
supabase link --project-ref YOUR_SUPABASE_PROJECT_REF
supabase db push
```

The migration files, including workspace bootstrap, are:

1. `supabase/migrations/202611220001_initial.sql`
2. `supabase/migrations/202611220002_indexes.sql`
3. `supabase/migrations/202611220003_rls.sql`
4. `supabase/migrations/202611220004_memberships.sql`
5. `supabase/migrations/202611220005_triggers.sql`
6. `supabase/migrations/202611220006_realtime.sql`
7. `supabase/migrations/202611220007_status.sql`
8. `supabase/migrations/202611220008_demo.sql`
9. `supabase/migrations/202611250001_workspace_bootstrap.sql`

For a fresh project, you can also apply the SQL files in sequence through the Supabase SQL Editor. Do not reapply migrations to an existing database outside your normal migration process.

In Supabase Auth settings, configure the site URL and redirect URLs for your deployment and local development, including `/auth/callback`. Enable the providers you intend to use. Enable anonymous sign-ins to use the live demo.

### Start the application

```bash
npm run check:env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `npm run check:env` validates the core application configuration; optional integrations may be left unset when not in use.

## Environment Variables

Use `.env.example` and `.env.local.example` as references. The example values are for development only; replace them with real credentials where applicable.

| Variable | Required? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL used by browser, server, and admin clients. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon/publishable key used for Supabase Auth and session-scoped requests. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes for full app operation | Server-only service-role key used by privileged server operations. Never expose it to client code. |
| `NEXT_PUBLIC_APP_URL` | Yes for deployment and environment validation | Canonical app URL for auth redirects and Playwright’s default base URL. |
| `CRON_SECRET` | Yes for scheduled endpoints | Bearer token protecting `/api/cron/check-all` and `/api/demo/cleanup`. Use a long random value. |
| `GROQ_API_KEY` | Optional | Enables Groq-powered AI diagnoses. Without it, the API returns a structured unavailable-configuration diagnosis. |
| `GROQ_MODEL` | Optional | Groq model name; defaults to `llama-3.3-70b-versatile`. |
| `ALERT_TOKEN_ENCRYPTION_KEY` | Optional until webhook alerts are configured | A 32-byte key encoded as 64 hexadecimal characters, used to encrypt webhook destinations. Required to create or deliver encrypted webhook channels. |
| `RESEND_API_KEY` | Optional | Resend API key for email alerts. |
| `ALERT_FROM_EMAIL` | Optional | Verified sender address for Resend email alerts. Configure with `RESEND_API_KEY`. |
| `DEMO_WORKSPACE_TTL_HOURS` | Optional | Lifetime for seeded demo workspaces; defaults to 24 hours. |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Optional template value | Included in the environment examples; currently not read by runtime code. |
| `NEXT_PUBLIC_DEMO_ENABLED` | Optional template value | Included in the environment examples; currently not read by runtime code. |
| `DEMO_USER_ID` | Demo scripts only | Supabase user UUID used by the demo seed and reset scripts. |
| `DEMO_WORKSPACE_ID` | Optional; reset script only | Restricts the demo reset operation to the supplied workspace. |
| `SUPABASE_PROJECT_REF` | Supabase type generation only | Project reference used by `npm run supabase:types`. |
| `TEST_DATABASE_URL` | Optional; tests | Test database connection value read by the test database helper. |

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and must remain server-side. `ALERT_TOKEN_ENCRYPTION_KEY` should be generated securely, for example:

```bash
openssl rand -hex 32
```

## Deployment: Vercel, Supabase, and GitHub Actions

### Vercel

1. Import the repository into Vercel and select the Next.js framework preset.
2. Configure the required production variables from the table above in the appropriate Vercel environments.
3. Configure the production domain, such as `vigilops.nexovent.tech`.
4. Deploy the application.
5. Confirm the deployment health endpoint at `/api/health`.

The repository’s `vercel.json` configures `/api/cron/check-all` on a daily schedule. Scheduled requests must be authorized with the configured `CRON_SECRET`.

### Supabase Auth

Set the production site URL and allowed redirect URLs in Supabase Auth settings. Include the production callback URL:

```text
https://vigilops.nexovent.tech/auth/callback
```

For local development, also allow:

```text
http://localhost:3000/auth/callback
```

Configure GitHub OAuth credentials in Supabase if you want to offer GitHub sign-in. Enable anonymous sign-ins if you want the live demo flow.

### GitHub Actions scheduled checks

`.github/workflows/cron-checks.yml` runs every five minutes and calls:

```text
POST https://vigilops.nexovent.tech/api/cron/check-all
Authorization: Bearer <CRON_SECRET>
```

Add a repository Actions secret named `CRON_SECRET` with the same value configured in Vercel. The workflow can also be started manually with `workflow_dispatch`.

The scheduled endpoint selects due active monitors, with a maximum batch of 100 monitors per request. Review your hosting limits and monitoring volume when operating the scheduler.

## Scripts and Testing

### Available npm scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Start the production server after building. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run TypeScript without emitting files. |
| `npm test` | Run Vitest unit and integration test files. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:e2e` | Run Playwright E2E tests. |
| `npm run check:env` | Validate required environment configuration. |
| `npm run supabase:types` | Generate Supabase TypeScript types; requires `SUPABASE_PROJECT_REF` and the Supabase CLI. |

### Focused verification commands

```bash
npx vitest run tests/unit
npx playwright install chromium
npm run test:e2e
npm run build
```

Vitest includes files under `tests/unit/` and `tests/integration/`. Playwright tests use the Chromium project and start the development server when needed.

### Operational scripts

These scripts are run directly with `tsx`; they are not npm scripts:

```bash
npx tsx scripts/healthcheck.ts
npx tsx scripts/seed-demo.ts
npx tsx scripts/reset-demo.ts
```

The health check requests `/api/health` using `NEXT_PUBLIC_APP_URL` (or `http://localhost:3000` if unset). The demo seed and reset scripts require `DEMO_USER_ID`; reset can also take `DEMO_WORKSPACE_ID`. Use these administrative scripts carefully because they create or remove demo data.

## Contributing

Contributions are welcome. Before opening a pull request:

1. Keep changes focused and follow the existing TypeScript and component patterns.
2. Avoid committing secrets or generated local environment files.
3. Run the relevant checks: `npm run lint`, `npm run typecheck`, `npm test`, and, for UI changes, `npm run test:e2e`.
4. Describe behavior changes and any required Supabase or environment configuration.

## License

VigilOps is distributed under the **MIT License**. See [`LICENSE`](LICENSE) for the full text.

---

**Operational note:** Project-level monitor limits and cloud-provider quotas are separate. Check the current Supabase, Vercel, GitHub Actions, Groq, and Resend plan limits before relying on any particular monitoring cadence or volume in production.
