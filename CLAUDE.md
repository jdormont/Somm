# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Somm** is an AI personal sommelier. Users photograph a wine list / store shelf and get ranked, personalized recommendations based on a taste profile, rating history, budget, and occasion. Frontend is React + Vite + Tailwind; backend is Supabase (Postgres + Auth + Edge Functions); AI is OpenAI GPT-4o vision called from Deno edge functions.

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # Production build
npm run lint       # ESLint (flat config in eslint.config.js)
npm run typecheck  # tsc --noEmit -p tsconfig.app.json
npm run preview    # Preview the production build

npx vitest run                                    # Run all tests once
npx vitest run src/pages/__tests__/Scanner.test.tsx   # Single test file
npx vitest                                        # Watch mode
```

Edge functions run on Deno (not Node) and are deployed separately via the Supabase CLI: `supabase functions deploy analyze-wine`. They are **not** covered by `npm run build`/`typecheck`/`lint` — those only touch `src/`. Note `analyze-wine` has `verify_jwt = false` in `supabase/config.toml` (auth is checked manually inside the function).

## Environment & secrets

- **Frontend** (`.env`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- **OpenAI key**: entered per-user in Settings, stored only in browser `localStorage` under `somm_openai_api_key`. It is sent in the request body to the edge function — it never persists server-side.
- **Shared key path**: if a user's `user_profiles.use_shared_key` is true, the edge function ignores the client key and uses the server's `OPENAI_API_KEY` env var (set as a Supabase function secret). Also server-side: `TAVILY_API_KEY` (web research), `SUPABASE_SERVICE_ROLE_KEY` (used to bypass RLS for the profile lookup).

## Architecture

### Three-step AI recommendation pipeline (`supabase/functions/analyze-wine/index.ts`)

This is the core of the product. A single request runs three sequential OpenAI/Tavily passes — understand this flow before changing recommendation behavior:

1. **OCR extraction** — GPT-4o vision extracts *every* wine as raw `{n, y, p}` (name/year/price). Deliberately no reasoning, to maximize recall on long (60+) lists.
2. **Scoring** — A text-only GPT-4o call scores each extracted wine on `s1` (profile match) and `s2` (quality). Candidates are ranked by `s1*1.5 + s2*1.0`; the **top 8** are selected for research. Scores are matched back to wines via `findBestMatch` (exact → accent/punctuation-normalized → token-similarity fuzzy match ≥ 0.4 threshold) — needed because the LLM re-emits names slightly differently between passes.
3. **Research + recommend (RAG)** — Each top-8 wine is researched via Tavily web search; the verified facts + image + user profile go into a final GPT-4o call that returns `wines_detected`, ranked `recommendations` (with `match_score`, `structure`, `reasoning`, `tasting_notes`, `food_pairings`), and a `summary`. Temperature 0.4 for natural-sounding prose.

The response also carries a `debug` block (`allWinesFound`, `researchedWines`) that the frontend persists to `scan_sessions.debug_info`.

**Prompt construction** lives in `buildUserProfile()` and `buildConstraints()`. The system prompt enforces hard rules: budget is a hard ceiling (with ±8% variance applied in `buildConstraints`), food pairing overrides style preferences, and an explicit "no robot speak" tone guide. When changing recommendation logic, these two builders + the system prompt are the levers — see `preference_logic.md` for the intended hierarchy of influence.

`analyze-anchor-wine/index.ts` is a second, simpler function: given a wine name or image, it returns a structural taste profile (body/tannin/acidity/earthiness/oak 1-10) used for taste calibration.

### Taste profile model

Preferences are richer than the original schema. Two layers:
- **Spectrum sliders** (`body`/`sweetness`/`tannins`/`acidity`/`earthiness`, each a 1-10 min/max range) — sent to the AI as *strict* constraints, mapped to descriptive text in `buildUserProfile`.
- **Taste anchors** (favorite wines, `user_taste_anchors` table) — `useTasteCalibration` averages their profile_data to *auto-suggest* spectrum slider values. This is the "calibration" flywheel.

Plus the categorical prefs: `wine_types`, `regions`, `flavor_profiles`, `avoidances`, `adventurousness` (low/medium/high), `varietal_preferences`, and dual budgets (store vs. restaurant). Wine→spectrum mappings live in `src/constants/wine_mappings.ts`.

### Frontend data flow

- **State/data layer**: TanStack React Query. Hooks in `src/hooks/` wrap `src/services/` (which wrap the Supabase client). Pages consume hooks — avoid calling `supabase` directly from pages.
  - `usePreferences` — caches `user_preferences` (5 min staleTime) with optimistic updates; this is the shared source for prefs across the app.
  - `useScans` / `useScannerLogic` — scan history + the orchestration of analyze → save-session.
  - `useTasteCalibration` — derives suggested sliders from anchors.
- **Services**: `scanService` (CRUD on `scan_sessions` + invoking `analyze-wine`), `tasteService` (invoking `analyze-anchor-wine`). Both pass the Supabase session access token explicitly in the `Authorization` header.
- **Auth**: `AuthContext` holds `user`, `session`, and a `profile` (`role`, `approved`, `use_shared_key`). Exposes `isAdmin` / `isApproved`. Routes are gated by `ProtectedRoute` (in `App.tsx`), with `requireAdmin` for `/admin`.
- **Routing**: React Router v7, all page components lazy-loaded in `App.tsx`. Authenticated routes render inside `Layout`.

### Access control

Invite-only by design: new users land in a pending state until an admin approves them (`user_profiles.approved`). Admins manage approvals/roles in `/admin`. This gates OpenAI token spend. All tables use Postgres **Row Level Security** scoped to `auth.uid()` — RLS policies are non-trivial and have had recursion/performance fixes (see the later `supabase/migrations/`), so prefer adding a new migration over editing policies inline.

### Database

Supabase Postgres. Key tables: `user_preferences`, `scan_sessions`, `wine_memories` (rated wines, fed into recommendations — capped at 100 most recent per scan), `user_profiles` (role/approval/shared-key), `user_taste_anchors`, `wine_knowledge_content`. Migrations in `supabase/migrations/` are timestamp-ordered and must be applied in sequence.

## Conventions

- **Design system** is documented in `design-style.md`: dark "high-end wine bar" aesthetic, glassmorphism, serif headings (wine names / verdicts) + sans body. Custom Tailwind colors are namespaced `wine-slate-*`, `somm-red-*`, `champagne-*`, `vine-green` (see `tailwind.config.js`). Match these when building UI.
- **Tests**: Vitest + Testing Library, jsdom env, globals enabled, setup in `src/test/setup.ts`, shared render helpers in `src/test/utils.tsx`. Tests live in `__tests__/` folders next to source.
- `IMPROVEMENTS.md` and `PRD.md` capture product intent and a tiered backlog; `preference_logic.md` is the spec for how preferences feed the AI.
