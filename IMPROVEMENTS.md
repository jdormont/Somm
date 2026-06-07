# Improvements
_Last assessment: 2026-06-07_
_Last knowledge sync: 2026-06-07_
_Assessment based on: git log (last 30 commits), all PRs (PR #12 merged June 6 — closed stale duplicate PR #10 from the June 5 cycle as superseded), open issues (none), fresh-eyes code inspection of AuthContext.tsx (3 debug `console.log` calls found, traced to commit `a2be016`), Cellar.tsx (268 lines, confirmed unchanged, still no `searchQuery`), Settings.tsx (confirmed `use_shared_key` still unhandled in UI), Preferences.tsx (552 lines, unchanged), analyze-wine edge function (confirmed `chosenWineNames`/`CHOSEN_WINE_HISTORY` code from PR #11 is present in the source tree, but no evidence the required `supabase functions deploy analyze-wine` step has run), CI workflow (`.github/workflows/ci.yml` — confirmed it does not deploy edge functions), CLAUDE.md (absent — 7th consecutive assessment)._

---

## Current Sprint
None — ready for next implementation run

---

## Recently Completed ✓

| Item | Status | Notes |
|------|--------|-------|
| Close "I Chose This" feedback loop in analyze-wine (Tier 1) | ⚠️ Code merged, deploy unverified | PR #11, June 5, 2026 — `chosenWineNames` queried from `scan_sessions`, injected as `[CHOSEN_WINE_HISTORY]` block into system prompt. Confirmed June 7: the code is live on `main` in `supabase/functions/analyze-wine/index.ts` (lines 207/210/242/281/477), **but** Edge Functions are deployed out-of-band via `supabase functions deploy analyze-wine` (not part of CI — confirmed by reading `.github/workflows/ci.yml`, which only runs lint/typecheck/vitest). There is no record of this deploy command having been run. Until it is, the feature exists in source but may not be active in production. See new Tier 1 item below. |
| Fix chosenWine stale initialization in ScanDetail | ✅ Done | PR #8, June 5, 2026 — `useEffect` sync after React Query resolves |
| "I Chose This" feedback button (was Tier 1.3) | ✅ Done | PR #5, June 2, 2026 — `RecommendationCard` toggle, `scan_sessions.chosen_wine_name` migration, `scanService.updateChosenWine` |
| Scan History Search and Filter (was Tier 1.2) | ✅ Done | PR #5, June 2, 2026 — search, context filter, date range filter on Dashboard.tsx |
| React Error Boundaries (was Tier 1.1) | ✅ Done | PR #3, June 1, 2026 — `ErrorBoundary.tsx` + scanner-specific fallback UI |
| CI/CD Pipeline (was Tier 1.4) | ✅ Done | PR #3, June 1, 2026 — `.github/workflows/ci.yml` — lint, typecheck, vitest in parallel |

---

## Tier 1 — Quick Wins

### Verify (and if needed, run) the analyze-wine deploy for the feedback-loop fix — NEW
- **What:** PR #11 (merged June 5) added `chosenWineNames`/`buildChosenWineSignal`/`[CHOSEN_WINE_HISTORY]` to `supabase/functions/analyze-wine/index.ts`, and the Recently Completed log notes "deploy required: `supabase functions deploy analyze-wine`". Confirmed June 7: the code is present on `main`, but Edge Functions are **not** deployed by CI (`.github/workflows/ci.yml` runs lint/typecheck/vitest only — no `supabase functions deploy` step anywhere in the repo). There is no deployment log, tag, or comment anywhere indicating the function was actually redeployed after the merge. If it wasn't, the shipped "feedback loop" feature is dead code in production — users who mark "I Chose This" get no behavioral change in their next scan's recommendations, silently.
- **Why now:** This is a one-command verification that determines whether a shipped, marked-"done" feature is actually live. Cheap to check, expensive to leave wrong — every day it's undeployed is a day the feedback loop silently does nothing for real users. This is exactly the kind of "done in the log but maybe not in prod" gap that compounds if not caught early.
- **Effort estimate:** S (5 minutes to verify via Supabase Dashboard function logs/version timestamp; if not deployed, one command: `supabase functions deploy analyze-wine`)
- **Actual effort:** —
- **Agent prompt:** "This requires a human with Supabase CLI/Dashboard access — it cannot be verified from the git repo alone. (1) In the Supabase Dashboard, open Edge Functions → `analyze-wine` and check the 'Last deployed' timestamp. If it predates the PR #11 merge (June 5, 2026), the fix is not live. (2) If not deployed, run `supabase functions deploy analyze-wine` from the project root (requires `supabase login` / linked project). (3) Smoke-test by triggering a scan as a user with a `chosen_wine_name` in their `scan_sessions` history and confirming the system prompt sent to the LLM includes a `[CHOSEN_WINE_HISTORY]` block (check function logs in the Dashboard). (4) Once confirmed live, update the Recently Completed row for this item from '⚠️ Code merged, deploy unverified' to '✅ Done — deploy confirmed [date]'. Consider adding a `supabase functions deploy` step to CI (or a documented release checklist) so this class of gap can't recur."

---

### Remove debug console.log statements from AuthContext.tsx — NEW
- **What:** `src/contexts/AuthContext.tsx` contains three leftover debug `console.log` calls, confirmed June 7 via `git log -- src/contexts/AuthContext.tsx` to have been introduced in commit `a2be016` ("feat: error boundaries, CI pipeline, and lint/type fixes") and never cleaned up:
  - Line 47: `console.log('Profile loaded:', data)` — logs the full profile object (`role`, `approved`, `use_shared_key`) to the browser console on every load
  - Line 54: `console.log('No profile found for user:', userId)` — logs raw user UUIDs
  - Line 60: `console.log('AuthContext initialized: v1.1 (fix-race-condition)')` — a versioned debug breadcrumb for a race-condition fix that has presumably since been validated
  These are the *only* `console.log` calls anywhere in `src/` (confirmed via repo-wide grep) — everything else in the codebase is clean, which makes these three stand out as an oversight rather than a pattern.
- **Why now:** Small, contained, zero-risk cleanup. Logging user role/approval-status/UUIDs to the browser console on every page load is unnecessary noise at best and a minor information-hygiene concern at worst (visible to anyone who opens devtools, including in screen-recordings/screenshots of bug reports). A 10-minute fix that's been sitting in shipped code since June 1.
- **Effort estimate:** S (10 minutes)
- **Actual effort:** —
- **Agent prompt:** "In `src/contexts/AuthContext.tsx`, remove the three debug `console.log` statements: line 47 (`console.log('Profile loaded:', data)`), line 54 (`console.log('No profile found for user:', userId)`), and line 60 (`console.log('AuthContext initialized: v1.1 (fix-race-condition)')`). If any of these were load-bearing for diagnosing a real race condition that might recur, replace with a proper conditional debug flag (e.g. gated on `import.meta.env.DEV`) rather than deleting outright — but a plain removal is preferred unless there's evidence the race condition is still being actively monitored. Run `npx tsc --noEmit` and `npx vitest run` to confirm no regressions (these are pure side-effect removals with no behavioral dependency)."

---

### Add CLAUDE.md project context file — OPEN ⚠️ 7th consecutive assessment without action
- **What:** The Somm repo still has no `CLAUDE.md`. Confirmed absent again June 7 (`ls -la CLAUDE.md` → no such file). Every AI-assisted development session starts cold with no knowledge of the stack, design system, API key model, or branching conventions. This has now been noted in **seven consecutive assessments** since June 1 with zero movement — it has outlasted every other item in this document, including ones rated higher effort.
- **Why now:** This is no longer just "highest effort-to-impact ratio" — it is now a process question. Six prior recommendations to write a 30-minute file have not resulted in the file being written. Either the recommendation is being systematically skipped in favor of higher-drama items (plausible — assessments keep finding new urgent things, like this cycle's deploy-gap and console.log items, that crowd it out), or there's friction in actually landing a docs-only PR. Recommend this be the **very first thing** picked up in the next implementation pass, before any other Tier 1 item, specifically because it has no dependencies and competes with nothing.
- **Effort estimate:** S (30 min)
- **Actual effort:** —
- **Agent prompt:** "Create `CLAUDE.md` at the root of the Somm repository. Include: (1) **Project overview** — 'Somm is a React + TypeScript + Supabase + Vite SPA. Users photograph wine lists with their phone camera and receive AI-powered recommendations based on their individual taste profile.'; (2) **Commands** — `npm run dev` (Vite dev server), `npm run build`, `npx vitest run`, `npx tsc --noEmit`, `npx eslint src/`; (3) **Tech stack** — Vite, React 18, TypeScript strict, Tailwind CSS, Supabase (Auth + Postgres + Edge Functions), React Query v5, Vitest + Testing Library; (4) **Architecture** — services in `src/services/` (`scanService.ts`, `tasteService.ts`), pages in `src/pages/`, Edge Functions in `supabase/functions/` (Deno runtime, deployed separately via `supabase functions deploy <name>` — NOT part of CI, NOT exercised by `npm run dev`, excluded from `tsconfig.app.json` compilation scope); (5) **API key model** — the `use_shared_key` boolean on `user_profiles` determines whether a user is served via the pooled `OPENAI_API_KEY` Supabase secret or must supply their own key via `localStorage`; (6) **Design system** — dark wine-themed palette (Warm Charcoal `#121011` background, Playfair Display headings, `champagne-*` / `somm-red-*` / `wine-slate-*` color tokens), full tokens in `design-style.md`; (7) **Key constraints** — admin approval required for new user access (`user_profiles.approved`); `chosen_wine_name` on `scan_sessions` tracks actual purchase decisions for recommendation learning; (8) **Branching/release** — CI (lint + typecheck + vitest) must pass before merge to `main`; Edge Function deploys are a manual post-merge step (`supabase functions deploy <name>`) — call this out explicitly since it has caused at least one shipped-but-undeployed gap (see IMPROVEMENTS.md Tier 1)."

---

### Cellar text search — OPEN
- **What:** `Cellar.tsx` offers only a 1–5 star rating filter. A user with 50+ cellar entries has no way to find a specific wine by name, producer, or region. Confirmed June 7: `Cellar.tsx` is still 268 lines, byte-for-byte the same gap — `filterRating` state exists, `searchQuery` does not. All data is already in local state — no backend changes needed.
- **Why now:** The scan history Dashboard received search in PR #5 over a week ago. The Cellar is the other primary browsing surface and has had the identical gap for that entire time. This is the most "shovel-ready" item in the backlog: well-specified, contained, no backend risk, and directly mirrors a pattern that already shipped successfully elsewhere in the same codebase.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "In `src/pages/Cellar.tsx`, add a text search input above the star-rating filter row. Add a `searchQuery` state variable (`useState('')`). Modify the `filtered` derivation to also filter by `searchQuery`: match against `memory.name`, `memory.producer`, and `memory.region` (all case-insensitive). Add a debounced input (300ms, or use a simple controlled input — no library needed). Use the same input styling as `Dashboard.tsx` for visual consistency (dark glass-morphism card with placeholder 'Search by name, producer, or region…'). Show a 'No results' empty state with a clear-search button when filtered is empty but memories is not. No Supabase queries needed — all data is already in local state."

---

## Tier 2 — Next Sprint

### Complete the pooled API key migration — OPEN
- **What:** The `analyze-wine` edge function correctly falls back to `Deno.env.get('OPENAI_API_KEY')` for users where `use_shared_key = true` on their profile. However, confirmed June 7 (still): `Settings.tsx` has no `use_shared_key` check — the API key input section renders identically for all users regardless of whether they have shared-key access. New approved users who haven't been granted `use_shared_key` still face the per-user API key barrier. The pooled model is implemented at the infrastructure level but not surfaced in the UX, and there is no daily scan quota enforced when the shared key is used.
- **Why now:** This is the single largest remaining onboarding friction point. Every non-technical user who signs up hits a dead end unless an admin manually toggles their `use_shared_key` flag. The edge function guard is already there — the gaps are the Settings page UI and quota enforcement.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "In Somm, complete the pooled API key UX in three parts: (1) In `src/pages/Settings.tsx`, check `profile?.use_shared_key` (from `useAuth`). If true, replace the API key input section with a read-only card: 'You are using Somm's shared scanning service — no API key required.' styled with the existing champagne/green success palette. If false, keep the existing input but update the help text to note that the API key requirement may be removed in future. (2) In `src/pages/Dashboard.tsx`, update the setup-warning logic so `hasApiKey` is `true` when `profile?.use_shared_key` is true — the warning banner currently checks `localStorage` OR `use_shared_key`, which is correct, but verify this renders correctly on first login for shared-key users. (3) In `supabase/functions/analyze-wine/index.ts`, after confirming `useSharedKey = true`, enforce a daily scan quota: upsert a row in a new `daily_scan_counts(user_id uuid, scan_date date, count int, primary key(user_id, scan_date))` table, incrementing `count`. If `count > 10`, return HTTP 429 with JSON `{ error: 'Daily scan limit reached. Resets at midnight UTC.' }`. Create the migration for `daily_scan_counts` with an appropriate RLS policy (users can read their own count; service role writes). Note: this item also touches `analyze-wine`, so coordinate with the deploy-verification item in Tier 1 — both will require a redeploy of the same function."

---

### Preferences.tsx modularization (23 KB) — OPEN
- **What:** `src/pages/Preferences.tsx` at 552 lines (confirmed June 7, unchanged) manages four distinct user preference domains — taste spectrum sliders, grape varietal toggles, budget range settings, and food pairing preferences — in a single scrolling form. These sections have distinct data shapes, mutation paths, and interaction patterns. `PreferencesRefactor.test.tsx` already exists in `src/pages/__tests__/` suggesting this work was anticipated.
- **Why now:** This is the most-edited settings component; any future change to taste preferences touches this entire file. Modularizing before the next taste-profile feature is added prevents compounding complexity.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Refactor `src/pages/Preferences.tsx` in Somm without changing any visible behavior or styling. Extract: (1) `src/components/preferences/TasteSpectrumSection.tsx` — the spectrum sliders (body, sweetness, tannins, acidity, earthiness); (2) `src/components/preferences/VarietalTogglesSection.tsx` — grape varietal include/exclude toggles; (3) `src/components/preferences/BudgetRangeSection.tsx` — per-context (restaurant/store) budget min/max inputs; (4) `src/components/preferences/FoodPairingSection.tsx` — food type preference toggles. Each component should accept the relevant slice of the preferences object as props and call an `onChange(partial)` callback. `Preferences.tsx` should become a thin orchestrator under 200 lines. Run `npx vitest run` and `npx tsc --noEmit` to confirm no regressions."

---

### Scan history CSV export — OPEN
- **What:** Wine enthusiasts using Somm as a personal wine journal want to extract their history for personal records, wine club meetings, or import into another tool. CSV export is implementable entirely client-side from already-fetched session data — no backend changes required. Confirmed June 7: no `exportToCsv` utility or export button exists yet.
- **Why now:** Carried from prior assessments; remains the most-requested type of feature for power users. Relatively contained implementation — a good candidate for a standalone PR.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "Add scan history CSV export to Somm. Create `src/utils/exportHistory.ts` with an `exportToCsv(sessions: ScanSession[]): void` function that converts scan sessions into CSV rows with columns: Date, Context, Notes, Wine Name, Producer, Vintage, Type, Region, Match Score, Chosen (yes/no from `chosen_wine_name`). Generate the CSV string and trigger a download using `URL.createObjectURL(new Blob([csvString], { type: 'text/csv;charset=utf-8;' }))`. Set filename to `somm-scan-history-YYYY-MM-DD.csv`. Add an 'Export CSV' button (download icon, `lucide-react`) to the scan history page header in `Dashboard.tsx`. Disable with tooltip when no sessions exist."

---

## Tier 3 — Strategic

### Wine Circles — Group Scanning — OPEN _(escalated from Tier 3 at June 5 assessment)_
- **What:** The PRD's Phase 4 vision: one person photographs a wine list and all group members simultaneously receive personalized recommendations tailored to their individual taste profiles from the same list. No major wine app offers this mechanic. Transforms Somm from a solo tool into a dinner-party and wine-club companion.
- **Why now:** Foundational differentiator for growth beyond solo users; natural referral mechanic. Scope is well-defined in PRD Phase 4. Start only after the Tier 1 and Tier 2 foundation work (CLAUDE.md, Cellar search, pooled API UX) is complete — none of which has shipped yet, so this remains correctly gated behind them.
- **Effort estimate:** L
- **Actual effort:** —
- **Agent prompt:** "Design and implement Wine Circles Phase 1 for Somm. Create Supabase tables: `wine_circles(id uuid, name text, created_by uuid, invite_code text unique, created_at timestamptz)` and `circle_members(circle_id uuid, user_id uuid, joined_at timestamptz)`. Create a `/circles` page with: (1) 'Create Circle' form generating a unique 6-character alphanumeric invite code; (2) 'Join Circle' form accepting an invite code; (3) list of the current user's circles with member count and share-code button. When a scan completes, add a 'Share with Circle' option that inserts a `shared_scans(scan_session_id, circle_id, shared_by uuid, shared_at timestamptz)` record. Circle members can view shared scans with a 'Shared by [name]' badge. Do not implement real-time in this phase — sharing is asynchronous."

---

## Dropped / Stale

| Item | Reason |
|------|--------|
| **Restaurant Partnership Integration** | Primarily a business development task — technical foundation has no value without active restaurant partners. Dropped June 5 assessment; revisit when go-to-market outreach begins. |
| **Offline Cellar Browsing (PWA)** | Dropped June 5 assessment — this is a natural half-day follow-on to the Cellar React Query migration. No value in tracking as a standalone item; note added to Cellar work. |
