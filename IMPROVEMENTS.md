# Improvements
_Last assessment: 2026-06-05_
_Last knowledge sync: 2026-06-05_
_Assessment based on: git log (last 30 commits), all PRs (PRs #8 and #9 open — both fix the same chosenWine stale-init bug; PR #8 is the canonical one, PR #9 is a duplicate and should be closed), open issues (none). No commits to main since June 4. Tier 3 staleness decisions applied: Wine Circles escalated to Tier 2 (5+ consecutive assessments, primary PRD growth mechanic); Restaurant Partnership dropped as stale (B2B2C requires business dev, not just code); Offline Cellar Browsing dropped as stale (natural follow-on to Cellar React Query migration in Tier 1 — no value as standalone Tier 3 item)._

---

## Current Sprint
Fix chosenWine stale initialization in ScanDetail — [IN PROGRESS — PR: #8]

_(Note: PR #9 fixes the identical bug with an identical approach — it is a duplicate. Close PR #9 and continue with PR #8.)_

---

## Recently Completed ✓

| Item | Status | Notes |
|------|--------|-------|
| React Error Boundaries (was Tier 1.1) | [DONE — merged: 2026-06-01, PR: #3] | `ErrorBoundary.tsx` + scanner-specific fallback UI |
| CI/CD Pipeline (was Tier 1.4) | [DONE — merged: 2026-06-01, PR: #3] | `.github/workflows/ci.yml` — lint, typecheck, vitest in parallel |
| Scan History Search and Filter (was Tier 1.2) | [DONE — merged: 2026-06-02, PR: #5] | `Dashboard.tsx` — search, context filter, date range filter |
| "I Chose This" feedback button (was Tier 1.3) | [DONE — merged: 2026-06-02, PR: #5] | `RecommendationCard` toggle, `scan_sessions.chosen_wine_name` migration, `scanService.updateChosenWine` |

---

## Tier 1 — Quick Wins

### Fix chosenWine stale initialization in ScanDetail — [IN PROGRESS — PR: #8]
- **What:** `ScanDetail.tsx` initializes `chosenWine` state with `useState(session?.chosen_wine_name ?? null)`, but `session` is `undefined` on the first render (React Query loads async). The "I Chose This" toggle always renders unchosen when a user navigates directly to a scan URL — even if they previously made a choice. The fix is a one-line `useEffect(() => { setChosenWine(session?.chosen_wine_name ?? null); }, [session?.chosen_wine_name])`.
- **Why now:** The "I Chose This" feature shipped in PR #5 but is silently broken for the most important case (returning to a past scan). PR #8 has this fix open — merge it. Close the duplicate PR #9.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "In `src/pages/ScanDetail.tsx`, the `chosenWine` state is initialized from `session?.chosen_wine_name` before React Query has resolved the session. Add a `useEffect` that calls `setChosenWine(session?.chosen_wine_name ?? null)` whenever `session?.chosen_wine_name` changes: `useEffect(() => { setChosenWine(session?.chosen_wine_name ?? null); }, [session?.chosen_wine_name]);`. Import `useEffect` from React. Verify: navigate directly to a `/scans/:id` URL for a scan where you previously tapped 'I picked this' — the button should render in the chosen state on page load."

### Close the "I Chose This" feedback loop in the edge function — [OPEN]
- **What:** The `chosen_wine_name` column was added to `scan_sessions` and the UI captures the user's choice, but the `analyze-wine` Supabase Edge Function does not query or use this data. The PRD's stated goal was to feed chosen wines back into future recommendations as a learning signal. Right now the data flywheel is only half-built: data is collected but never acted on.
- **Why now:** The choice data is being written but immediately discarded from the recommendation loop. Each new scan could be personalized using actual purchase behavior — this is a high-leverage AI quality improvement that requires only ~15 lines added to the edge function's system prompt builder.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "In `supabase/functions/analyze-wine/index.ts`, after the user's `wine_memories` are resolved (around line 229), query `scan_sessions` using the admin Supabase client for the authenticated user's last 15 records where `chosen_wine_name IS NOT NULL`, ordered by `created_at DESC`. Add a new `buildChosenWineSignal(chosenWines: string[]): string` helper function (similar to `buildUserProfile`) that returns a `[CHOSEN_WINE_HISTORY]` block listing the wine names the user has actually selected in real situations. Inject this block into the system prompt between `[USER_PROFILE]` and `[CURRENT_CONSTRAINTS]`. The LLM instruction should read: 'These are wines this user actually chose and purchased — weight recommendations that share similar style, region, or variety more heavily.' Run `supabase functions deploy analyze-wine` after the change."

### Add CLAUDE.md project context file — [OPEN]
- **What:** The Somm repo still has no `CLAUDE.md`. Confirmed absent across five consecutive assessments (June 1, June 2, June 3, June 4, June 5). Every AI-assisted development session starts cold with no knowledge of the stack, design system, admin-approval flow, API key model, or branching conventions.
- **Why now:** Five consecutive assessments without movement. A 30-minute task with the best effort-to-session-productivity ratio of anything in the backlog. The cost of skipping it is paid on every future session.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "Create `CLAUDE.md` at the root of the Somm repository. Include: (1) **Project overview** — 'Somm is a React + TypeScript + Supabase + Vite SPA. Users photograph wine lists with their phone camera and receive AI-powered recommendations based on their individual taste profile.'; (2) **Commands** — `npm run dev` (Vite dev server), `npm run build`, `npx vitest run`, `npx tsc --noEmit`, `npx eslint src/`; (3) **Tech stack** — Vite, React 18, TypeScript strict, Tailwind CSS, Supabase (Auth + Postgres + Edge Functions), React Query v5, Vitest + Testing Library; (4) **Architecture** — services in `src/services/` (`scanService.ts`, `tasteService.ts`), pages in `src/pages/`, Edge Functions in `supabase/functions/` (Deno runtime, excluded from `tsconfig.app.json` compilation scope); (5) **API key model** — the `use_shared_key` boolean on `user_profiles` determines whether a user is served via the pooled `OPENAI_API_KEY` Supabase secret or must supply their own key via `localStorage`; (6) **Design system** — dark wine-themed palette (Warm Charcoal `#121011` background, Playfair Display headings, `champagne-*` / `somm-red-*` / `wine-slate-*` color tokens), full tokens in `design-style.md`; (7) **Key constraints** — admin approval required for new user access (`user_profiles.status`); `chosen_wine_name` on `scan_sessions` tracks actual purchase decisions for future recommendation learning; `Cellar.tsx` uses raw `supabase` calls with manual state — not yet migrated to React Query; (8) **Branching** — CI (lint + typecheck + vitest) must pass before merge to `main`."

### Cellar text search + React Query migration — [OPEN]
- **What:** `Cellar.tsx` (confirmed June 4) has two gaps: (1) it offers only a 1–5 star rating filter — no text search by wine name, producer, or region; (2) it uses raw `supabase` client calls with manual `useState`/`useEffect` loading state instead of React Query, meaning no caching, no stale-while-revalidate, and inconsistency with the rest of the codebase. A user with 50+ cellar entries has no way to find a specific wine by name.
- **Why now:** The Dashboard received text search in PR #5. The Cellar is the other primary browsing surface and has the same gap — parallel treatment brings UX consistency. Migrating to React Query also creates the foundation for offline cellar browsing (PWA) when that becomes a priority.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "In `src/pages/Cellar.tsx`, make two changes: (1) **Migrate to React Query** — replace the `useState(memories)` + `useEffect(loadMemories)` pattern with `useQuery({ queryKey: ['cellar', user?.id], queryFn: () => supabase.from('wine_memories').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(r => r.data ?? []) })`. Use `queryClient.invalidateQueries({ queryKey: ['cellar'] })` in the `deleteMemory` handler and in `handleAdded`. (2) **Add text search** — add a `searchQuery` state variable (`useState('')`). Modify the `filtered` derivation to also filter by `searchQuery`: match against `memory.name`, `memory.producer`, and `memory.region` (all case-insensitive). Add a controlled text input above the star-rating filter row using the same dark glass-morphism styling as `Dashboard.tsx` with placeholder 'Search by name, producer, or region…'. Show a 'No results' empty state with a clear-search link when `filtered` is empty but `memories` is not. No Supabase queries needed for the search — all data is already in local state after the React Query fetch."

---

## Tier 2 — Next Sprint

### Complete the pooled API key migration — [OPEN]
- **What:** The `analyze-wine` edge function correctly falls back to `Deno.env.get('OPENAI_API_KEY')` for users where `use_shared_key = true` on their profile. However, the Settings page still shows a prominent API key input with a warning banner for all users, regardless of whether they have shared-key access. No daily scan quota is enforced when the shared key is used.
- **Why now:** This is the single largest remaining onboarding friction point. Every non-technical user who signs up hits a dead end unless an admin manually toggles their `use_shared_key` flag. The edge function guard is already there — the gaps are the Settings page UI and quota enforcement.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "In Somm, complete the pooled API key UX in three parts: (1) In `src/pages/Settings.tsx`, check `profile?.use_shared_key` (from `useAuth`). If true, replace the API key input section with a read-only card: 'You are using Somm's shared scanning service — no API key required.' styled with the existing champagne/green success palette. If false, keep the existing input but update the help text to note that the API key requirement may be removed in future. (2) In `src/pages/Dashboard.tsx`, update the setup-warning logic so `hasApiKey` is `true` when `profile?.use_shared_key` is true — the warning banner currently checks `localStorage` OR `use_shared_key`, which is correct, but verify this renders correctly on first login for shared-key users. (3) In `supabase/functions/analyze-wine/index.ts`, after confirming `useSharedKey = true`, enforce a daily scan quota: upsert a row in a new `daily_scan_counts(user_id uuid, scan_date date, count int, primary key(user_id, scan_date))` table, incrementing `count`. If `count > 10`, return HTTP 429 with JSON `{ error: 'Daily scan limit reached. Resets at midnight UTC.' }`. Create the migration for `daily_scan_counts` with an appropriate RLS policy (users can read their own count; service role writes)."

### Wine Circles — Group Scanning — OPEN _(escalated from Tier 3)_
- **What:** The PRD's Phase 4 vision: one person photographs a wine list and all group members simultaneously receive personalized recommendations tailored to their individual taste profiles from the same list. No major wine app offers this mechanic. Transforms Somm from a solo tool into a dinner-party and wine-club companion.
- **Why now:** Escalated from Tier 3 after 5 consecutive assessments. This is the primary growth and referral mechanic in the PRD. Start only after the Tier 1 items (chosenWine fix, CLAUDE.md, Cellar search) are complete — the Cellar React Query migration creates the caching foundation that makes shared-scan views cleaner to implement.
- **Effort estimate:** L
- **Actual effort:** —
- **Agent prompt:** "Design and implement Wine Circles Phase 1 for Somm. Create Supabase tables: `wine_circles(id uuid, name text, created_by uuid, invite_code text unique, created_at timestamptz)` and `circle_members(circle_id uuid, user_id uuid, joined_at timestamptz)`. Create a `/circles` page with: (1) 'Create Circle' form generating a unique 6-character alphanumeric invite code; (2) 'Join Circle' form accepting an invite code; (3) list of the current user's circles with member count and share-code button. When a scan completes, add a 'Share with Circle' option that inserts a `shared_scans(scan_session_id, circle_id, shared_by uuid, shared_at timestamptz)` record. Circle members can view shared scans with a 'Shared by [name]' badge. Do not implement real-time in this phase — sharing is asynchronous."

### Preferences.tsx modularization (23 KB) — [OPEN]
- **What:** `src/pages/Preferences.tsx` at 23,654 bytes manages four distinct user preference domains — taste spectrum sliders, grape varietal toggles, budget range settings, and food pairing preferences — in a single scrolling form. Splitting them into focused sub-components reduces cognitive load for future taste-profile enhancements and enables per-section unit testing. `PreferencesRefactor.test.tsx` already exists in `src/pages/__tests__/` suggesting this work was anticipated.
- **Why now:** Any future change to taste preferences touches this entire file. Modularizing before the next taste-profile feature is added prevents compounding complexity.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Refactor `src/pages/Preferences.tsx` in Somm without changing any visible behavior or styling. Extract: (1) `src/components/preferences/TasteSpectrumSection.tsx` — the spectrum sliders (body, sweetness, tannins, acidity, earthiness); (2) `src/components/preferences/VarietalTogglesSection.tsx` — grape varietal include/exclude toggles; (3) `src/components/preferences/BudgetRangeSection.tsx` — per-context (restaurant/store) budget min/max inputs; (4) `src/components/preferences/FoodPairingSection.tsx` — food type preference toggles. Each component should accept the relevant slice of the preferences object as props and call an `onChange(partial)` callback. `Preferences.tsx` should become a thin orchestrator under 200 lines. Run `npx vitest run` and `npx tsc --noEmit` to confirm no regressions."

### Scan history CSV export — [OPEN]
- **What:** Wine enthusiasts using Somm as a personal wine journal want to extract their history for personal records, wine club meetings, or import into another tool. CSV export is implementable entirely client-side from already-fetched session data — no backend changes required.
- **Why now:** Carried from prior assessments; remains the most-requested type of feature for power users. Relatively contained implementation — a good candidate for a standalone PR.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "Add scan history CSV export to Somm. Create `src/utils/exportHistory.ts` with an `exportToCsv(sessions: ScanSession[]): void` function that converts scan sessions into CSV rows with columns: Date, Context, Notes, Wine Name, Producer, Vintage, Type, Region, Match Score, Chosen (yes/no from `chosen_wine_name`). Generate the CSV string and trigger a download using `URL.createObjectURL(new Blob([csvString], { type: 'text/csv;charset=utf-8;' }))`. Set filename to `somm-scan-history-YYYY-MM-DD.csv`. Add an 'Export CSV' button (download icon, `lucide-react`) to the scan history page header in `Dashboard.tsx`. Disable with tooltip when no sessions exist."

---

## Tier 3 — Strategic

_No active Tier 3 items this cycle. Previous items were escalated or dropped._

---

## Dropped / Stale

| Item | Reason |
|------|--------|
| **Restaurant Partnership Integration (was Tier 3)** | Appeared 5+ consecutive assessments. This is primarily a business development task — the technical foundation (tables, edge function, QR flow) has no value without active restaurant partners. Revisit when go-to-market outreach begins. |
| **Offline Cellar Browsing / PWA (was Tier 3)** | Appeared 5+ consecutive assessments. This is a natural follow-on to the Cellar React Query migration (Tier 1 item above). Once that migration is complete, adding a service worker with `NetworkFirst` Workbox caching for `/cellar` is a half-day task — no need to track separately. Re-surface at that time. |
