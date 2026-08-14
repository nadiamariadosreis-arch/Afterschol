# CLAUDE.md

Guidance for future Claude Code sessions working in this repo.

## What this is

Método A.P.F.A — a member platform for Catholic families to run a monthly
finance ritual (Avaliar → Planejar → Fazer Acontecer → Acompanhar). Full
method spec lives in the original task/issue that created this project;
the code is the source of truth for exact data shapes.

## Architecture

- Next.js 16 App Router, Tailwind v4, Supabase (auth + Postgres + storage).
  Same stack/conventions as the other independent platforms on this
  account — see `src/lib/supabase/*`, `src/proxy.ts`, `src/lib/auth.ts`.
- **One row per family per month** in `public.cycles` (unique on
  `family_id, year, month`). Each pilar's guided data lives in a `jsonb`
  column (`avaliar`, `planejar`, `fazer_acontecer`, `acompanhar`) — see
  `src/lib/apfa/types.ts` for the authoritative shape of each, and
  `src/lib/apfa/schemas.ts` for the zod validation used by server actions.
- A pilar counts as done when its `completed_at` is set. Each pilar's page
  is a single form that saves the whole jsonb blob at once (no partial
  autosave) and redirects to the next pilar.
- `src/lib/apfa/calc.ts` holds pure, client-safe helpers (no `server-only`)
  — comparativo, progress, checklist generation. `src/lib/apfa/ciclo.ts`
  holds the Supabase-backed helpers (`server-only`) and re-exports the
  calc.ts functions for server-side callers. Client components must import
  from `calc.ts` directly, never from `ciclo.ts`.
- `getOrCreateActiveCycle` is the "date intelligence": it keeps the family
  on the most recent unfinished cycle even across a month boundary, and
  only opens a new cycle once the latest one is fully closed — carrying
  forward `percentuais` (which Acompanhar may have recalibrated).
- No admin area — the product is sold anonymously/self-serve. Signup is
  direct (`/cadastro`); the Kiwify webhook (`src/app/api/webhooks/kiwify`)
  is a placeholder for when paid checkout is wired up, mirroring the invite
  pattern used on the other platforms in this account.

## Conventions to keep

- Visual: cream background, orange accent, `font-display-italic` (Fraunces
  italic) for headings, plain Tailwind utility classes, pill buttons — see
  `src/app/globals.css` and `src/components/ui/*`.
- Forms: client components hold all field state, serialize the full
  payload into a hidden `<input type="hidden">` JSON field, and submit via
  a `"use server"` action using `useActionState`. Keeps each pilar's save
  atomic and the server action dumb (parse → zod validate → upsert).
- Don't add an admin/CMS area unless explicitly asked — there's no content
  to manage, only per-family cycle data already covered by RLS.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
