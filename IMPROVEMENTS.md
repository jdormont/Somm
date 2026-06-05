# Improvements
_Last assessment: 2026-06-03_
_Last knowledge sync: 2026-06-03_
_Assessment based on: full review of 30 most recent commits, all 5 closed PRs, complete IMPROVEMENTS.md history, key source files (ScanDetail.tsx, Scanner.tsx, Settings.tsx, Cellar.tsx, Dashboard.tsx, Preferences.tsx, useScannerLogic.ts, analyze-wine edge function), and migration history._

## Current Sprint
**Close the "I Chose This" feedback loop in the edge function** — [IN PROGRESS — branch: claude/vibrant-allen-geySJ, started: 2026-06-05]

## Recently Completed ✓

| Item | Status | Notes |
|------|--------|-------|
| React Error Boundaries (was Tier 1.1) | [DONE — merged: 2026-06-01, PR: #3] | `ErrorBoundary.tsx` + scanner-specific fallback UI |
| CI/CD Pipeline (was Tier 1.4) | [DONE — merged: 2026-06-01, PR: #3] | `.github/workflows/ci.yml` — lint, typecheck, vitest in parallel |
| Scan History Search and Filter (was Tier 1.2) | [DONE — merged: 2026-06-02, PR: #5] | `Dashboard.tsx` — search, context filter, date range filter |
| Fix chosenWine stale initialization in ScanDetail | [DONE — merged: 2026-06-05, PR: #8] | `ScanDetail.tsx` — `useEffect` sync after React Query resolves; fixes "I Chose This" toggle on direct URL navigation |
| "I Chose This" feedback button (was Tier 1.3) | [DONE — merged: 2026-06-02, PR: #5] | `RecommendationCard` toggle, `scan_sessions.chosen_wine_name` migration, `scanService.updateChosenWine` |

---

## Tier 1 — Quick Wins

### Close the "I Chose This" feedback loop in the edge function — [OPEN]
- **What:** The `chosen_wine_name` column was added to `scan_sessions` and the UI captures the user's choice, but the `analyze-wine` Supabase Edge Function does not query or use this data. The PRD's stated goal was to feed chosen wines back into future recommendations as a learning signal. Right now the data flywheel is only half-built: data is collected but never acted on.
- **Why now:** The choice data is being written but immediately discarded from the recommendation loop. Each new scan could be personalized using actual purchase behavior — this is a high-leverage AI quality improvement that requires only ~15 lines added to the edge function's system prompt builder.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "In `supabase/functions/analyze-wine/index.ts`, after the user's `wine_memories` are resolved (around line 229), query `scan_sessions` using the admin Supabase client for the authenticated user's last 15 records where `chosen_wine_name IS NOT NULL`, ordered by `created_at DESC`. Add a new `buildChosenWineSignal(chosenWines: string[]): string` helper function (similar to `buildUserProfile`) that returns a `[CHOSEN_WINE_HISTORY]` block listing the wine names the user has actually selected in real situations. Inject this block into the system prompt between `[USER_PROFILE]` and `[CURRENT_CONSTRAINTS]`. The LLM instruction should read: 'These are wines this user actually chose and purchased — weight recommendations that share similar style, region, or variety more heavily.' Run `supabase functions deploy analyze-wine` after the change."

### Add CLAUDE.md project context file — [OPEN]
- **What:** The Somm repo still has no `CLAUDE.md`. Every AI-assisted development session starts cold with no knowledge of the stack, design system, admin-approval flow, API key model, or branching conventions. This has been noted in each of the past three assessments (June 1, June 2, June 3) without action.
- **Why now:** Three consecutive assessments without movement makes this a staleness risk. As a 30-minute task it has the best effort-to-session-productivity ratio of anything in the backlog.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "Create `CLAUDE.md` at the root of the Somm repository. Include: (1) **Project overview** — 'Somm is a React + TypeScript + Supabase + Vite SPA. Users photograph wine lists with their phone camera and receive AI-powered recommendations based on their individual taste profile.'; (2) **Commands** — `npm run dev` (Vite dev server), `npm run build`, `npx vitest run`, `npx tsc --noEmit`, `npx eslint src/`; (3) **Tech stack** — Vite, React 18, TypeScript strict, Tailwind CSS, Supabase (Auth + Postgres + Edge Functions), React Query v5, Vitest + Testing Library; (4) **Architecture** — services in `src/services/` (`scanService.ts`, `tasteService.ts`), pages in `src/pages/`, Edge Functions in `supabase/functions/` (Deno runtime, excluded from `tsconfig.app.json` compilation scope); (5) **API key model** — the `use_shared_key` boolean on `user_profiles` determines whether a user is served via the pooled `OPENAI_API_KEY` Supabase secret or must supply their own key via `localStorage`; (6) **Design system** — dark wine-themed palette (Warm Charcoal `#121011` background, Playfair Display headings, `champagne-*` / `somm-red-*` / `wine-slate-*` color tokens), full tokens in `design-style.md`; (7) **Key constraints** — admin approval required for new user access (`user_profiles.status`); `chosen_wine_name` on `scan_sessions` tracks actual purchase decisions for future recommendation learning; (8) **Branching** — CI (lint + typecheck + vitest) must pass before merge to `main`."

### Cellar text search — [OPEN]
- **What:** `Cellar.tsx` offers only a 1–5 star rating filter. A user with 50+ cellar entries has no way to find a specific wine by name, producer, or region. The cellar is pitched as a personal wine journal, but without text search it degrades from a reference tool to a scrollable list. All data is already client-side — no backend changes needed.
- **Why now:** The scan history Dashboard received search in PR #5. The Cellar page is the other primary browsing surface and has the same gap. Parallel treatment brings UX consistency.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "In `src/pages/Cellar.tsx`, add a text search input above the star-rating filter row. Add a `searchQuery` state variable (`useState('')`). Modify the `filtered` derivation to also filter by `searchQuery`: match against `memory.name`, `memory.producer`, and `memory.region` (all case-insensitive). Add a debounced input (300ms, or use a simple controlled input — no library needed). Use the same input styling as `Dashboard.tsx` for visual consistency (dark glass-morphism card with placeholder 'Search by name, producer, or region…'). Show a 'No results' empty state with a clear-search button when filtered is empty but memories is not. No Supabase queries needed — all data is already in local state."

---

## Tier 2 — Next Sprint

### Complete the pooled API key migration — [OPEN]
- **What:** The `analyze-wine` edge function correctly falls back to `Deno.env.get('OPENAI_API_KEY')` for users where `use_shared_key = true` on their profile. However, the Settings page still shows a prominent API key input with a warning banner ("Your key is stored locally") for all users, regardless of whether they have shared-key access. New users who are approved but not granted `use_shared_key = true` still face the per-user API key barrier. The pooled model is implemented at the infrastructure level but not surfaced in the UX, and there is no daily scan quota enforced when the shared key is used.
- **Why now:** This is the single largest remaining onboarding friction point. Every non-technical user who signs up hits a dead end unless an admin manually toggles their `use_shared_key` flag. The edge function guard is already there — the gaps are the Settings page UI and quota enforcement.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "In Somm, complete the pooled API key UX in three parts: (1) In `src/pages/Settings.tsx`, check `profile?.use_shared_key` (from `useAuth`). If true, replace the API key input section with a read-only card: 'You are using Somm's shared scanning service — no API key required.' styled with the existing champagne/green success palette. If false, keep the existing input but update the help text to note that the API key requirement may be removed in future. (2) In `src/pages/Dashboard.tsx`, update the setup-warning logic so `hasApiKey` is `true` when `profile?.use_shared_key` is true — the warning banner currently checks `localStorage` OR `use_shared_key`, which is correct, but verify this renders correctly on first login for shared-key users. (3) In `supabase/functions/analyze-wine/index.ts`, after confirming `useSharedKey = true`, enforce a daily scan quota: upsert a row in a new `daily_scan_counts(user_id uuid, scan_date date, count int, primary key(user_id, scan_date))` table, incrementing `count`. If `count > 10`, return HTTP 429 with JSON `{ error: 'Daily scan limit reached. Resets at midnight UTC.' }`. Create the migration for `daily_scan_counts` with an appropriate RLS policy (users can read their own count; service role writes)."

### Preferences.tsx modularization (23 KB) — [OPEN]
- **What:** `src/pages/Preferences.tsx` at 23,654 bytes manages four distinct user preference domains — taste spectrum sliders, grape varietal toggles, budget range settings, and food pairing preferences — in a single scrolling form. These sections have distinct data shapes, mutation paths, and interaction patterns. Splitting them into focused sub-components reduces cognitive load for future taste-profile enhancements and enables per-section unit testing. `PreferencesRefactor.test.tsx` already exists in `src/pages/__tests__/` suggesting this work was anticipated.
- **Why now:** This is the most-edited settings component; any future change to taste preferences (adding a new dimension, varietal category, or pairing type) touches this entire file. Modularizing before the next taste-profile feature is added prevents compounding complexity.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Refactor `src/pages/Preferences.tsx` in Somm without changing any visible behavior or styling. Extract: (1) `src/components/preferences/TasteSpectrumSection.tsx` — the spectrum sliders (body, sweetness, tannins, acidity, earthiness); (2) `src/components/preferences/VarietalTogglesSection.tsx` — grape varietal include/exclude toggles; (3) `src/components/preferences/BudgetRangeSection.tsx` — per-context (restaurant/store) budget min/max inputs; (4) `src/components/preferences/FoodPairingSection.tsx` — food type preference toggles. Each component should accept the relevant slice of the preferences object as props and call an `onChange(partial)` callback. `Preferences.tsx` should become a thin orchestrator under 200 lines. Run `npx vitest run` and `npx tsc --noEmit` to confirm no regressions."

### Scan history CSV export — [OPEN]
- **What:** Wine enthusiasts using Somm as a personal wine journal want to extract their history for personal records, wine club meetings, or import into another tool. CSV export is implementable entirely client-side from already-fetched session data — no backend changes required. This is a low-risk, high-satisfaction feature for the most engaged users.
- **Why now:** Carried from prior assessments; remains the most-requested type of feature for power users. Relatively contained implementation — a good candidate for a standalone PR.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "Add scan history CSV export to Somm. Create `src/utils/exportHistory.ts` with an `exportToCsv(sessions: ScanSession[]): void` function that converts scan sessions into CSV rows with columns: Date, Context, Notes, Wine Name, Producer, Vintage, Type, Region, Match Score, Chosen (yes/no from `chosen_wine_name`). Generate the CSV string and trigger a download using `URL.createObjectURL(new Blob([csvString], { type: 'text/csv;charset=utf-8;' }))`. Set filename to `somm-scan-history-YYYY-MM-DD.csv`. Add an 'Export CSV' button (download icon, `lucide-react`) to the scan history page header in `Dashboard.tsx`. Disable with tooltip when no sessions exist."

---

## Tier 3 — Strategic

### Wine Circles — Group Scanning — [OPEN]
- **What:** The PRD's Phase 4 vision: one person photographs a wine list and all group members simultaneously receive personalized recommendations tailored to their individual taste profiles from the same list. No major wine app offers this mechanic. Transforms Somm from a solo tool into a dinner-party and wine-club companion.
- **Why now:** Foundational differentiator for growth beyond solo users; natural referral mechanic. Scope is well-defined in PRD Phase 4 — implementation involves new DB tables, a circles UI, and a shared-scan view.
- **Effort estimate:** L
- **Actual effort:** —
- **Agent prompt:** "Design and implement Wine Circles Phase 1 for Somm. Create Supabase tables: `wine_circles(id uuid, name text, created_by uuid, invite_code text unique, created_at timestamptz)` and `circle_members(circle_id uuid, user_id uuid, joined_at timestamptz)`. Create a `/circles` page with: (1) 'Create Circle' form generating a unique 6-character alphanumeric invite code; (2) 'Join Circle' form accepting an invite code; (3) list of the current user's circles with member count and share-code button. When a scan completes, add a 'Share with Circle' option that inserts a `shared_scans(scan_session_id, circle_id, shared_by uuid, shared_at timestamptz)` record. Circle members can view shared scans with a 'Shared by [name]' badge. Do not implement real-time in this phase — sharing is asynchronous."

### Restaurant Partnership Integration — [OPEN]
- **What:** Phase 5 of the PRD: restaurants opt into a pre-loaded wine list accessible via QR code, eliminating the need to photograph a menu. Creates a B2B2C model where restaurants gain anonymized palate preference data.
- **Why now:** Highest long-term impact item in the backlog. Foundational tables and a public edge function are the building blocks needed before any partnership outreach.
- **Effort estimate:** L
- **Actual effort:** —
- **Agent prompt:** "Create the technical foundation for Somm Restaurant Integration. Create Supabase tables: `restaurants(id uuid, name text, address text, qr_code_token text unique, is_active boolean)` and `restaurant_wine_lists(id uuid, restaurant_id uuid, wine_name text, producer text, vintage int, price numeric, type text, region text, updated_at timestamptz)`. Create a public unauthenticated Edge Function `get-restaurant-list` accepting `?token=` and returning the wine list. In the app, handle `/r/:token` routes to load a restaurant's pre-populated wine list into the `analyze-wine` flow. Create a minimal restaurant admin portal at `/admin/restaurant` gated by `is_restaurant_admin` on `user_profiles`."

### Offline Cellar Browsing (PWA) — [OPEN]
- **What:** Cellar data requires no real-time internet — users frequently want to review past wines at a restaurant table in low-signal environments. A service worker that caches cellar data on last successful fetch resolves a genuine in-context friction point.
- **Why now:** Consistently identified as medium impact across prior assessments. Good candidate for a focused sprint when mobile UX improvements are prioritized.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Add PWA offline support for cellar browsing. Install `vite-plugin-pwa` and configure it in `vite.config.ts` with the `generateSW` strategy. Configure Workbox to: (1) cache JS/CSS/font assets with `CacheFirst`; (2) cache Supabase `wine_memories` responses with `NetworkFirst` + 30-minute TTL; (3) show `public/offline.html` for all other offline routes explaining scanning requires internet but the cellar is available offline. Test with Chrome DevTools 'Offline' mode on the `/cellar` route."

---

## Dropped / Stale
None yet
