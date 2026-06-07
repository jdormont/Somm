# Improvements
_Last assessment: 2026-06-07_
_Last knowledge sync: 2026-06-07 (post-deploy update)_
_Assessment based on: git log (last 30 commits), all PRs (PR #12 merged June 6 — closed stale duplicate PR #10 from the June 5 cycle as superseded), open issues (none), fresh-eyes code inspection of AuthContext.tsx (3 debug `console.log` calls found, traced to commit `a2be016`), Cellar.tsx (268 lines, confirmed unchanged, still no `searchQuery`), Settings.tsx (confirmed `use_shared_key` still unhandled in UI), Preferences.tsx (552 lines, unchanged), analyze-wine edge function (confirmed `chosenWineNames`/`CHOSEN_WINE_HISTORY` code from PR #11 is present in the source tree **and has now been deployed to production** via `supabase functions deploy analyze-wine`), CI workflow (`.github/workflows/ci.yml` — confirmed it does not deploy edge functions), CLAUDE.md (**now present** — added to `main` in commit `0f1c581` after 7 consecutive assessments without action)._

---

## Current Sprint
None — ready for next implementation run

---

## Recently Completed ✓

| Item | Status | Notes |
|------|--------|-------|
| Add CLAUDE.md project context file (Tier 1) | ✅ Done | Commit `0f1c581`, June 7, 2026 — landed on `main` after 7 consecutive assessments flagging it. Documents the three-step AI recommendation pipeline, taste profile model, API key/secrets model, design system, and access control. Closes the longest-standing item in this backlog. |
| Verify/run analyze-wine deploy for the feedback-loop fix (Tier 1) | ✅ Done — deploy confirmed 2026-06-07 | `supabase functions deploy analyze-wine` was run after PR #11's merge; the `[CHOSEN_WINE_HISTORY]` injection from `chosenWineNames` is now live in production, not just on `main`. Closes the "code merged but deploy unverified" gap flagged earlier this same cycle. |
| Close "I Chose This" feedback loop in analyze-wine (Tier 1) | ✅ Done | PR #11, June 5, 2026 — `chosenWineNames` queried from `scan_sessions`, injected as `[CHOSEN_WINE_HISTORY]` block into system prompt; confirmed deployed to production June 7 (see row above). |
| Fix chosenWine stale initialization in ScanDetail | ✅ Done | PR #8, June 5, 2026 — `useEffect` sync after React Query resolves |
| "I Chose This" feedback button (was Tier 1.3) | ✅ Done | PR #5, June 2, 2026 — `RecommendationCard` toggle, `scan_sessions.chosen_wine_name` migration, `scanService.updateChosenWine` |
| Scan History Search and Filter (was Tier 1.2) | ✅ Done | PR #5, June 2, 2026 — search, context filter, date range filter on Dashboard.tsx |
| React Error Boundaries (was Tier 1.1) | ✅ Done | PR #3, June 1, 2026 — `ErrorBoundary.tsx` + scanner-specific fallback UI |
| CI/CD Pipeline (was Tier 1.4) | ✅ Done | PR #3, June 1, 2026 — `.github/workflows/ci.yml` — lint, typecheck, vitest in parallel |

---

## Tier 1 — Quick Wins

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
- **Why now:** Foundational differentiator for growth beyond solo users; natural referral mechanic. Scope is well-defined in PRD Phase 4. Start only after the remaining Tier 1/Tier 2 foundation work (Cellar search, pooled API UX) is complete — CLAUDE.md shipped this cycle, but Cellar search and the pooled-key UX have not, so this remains correctly gated behind them.
- **Effort estimate:** L
- **Actual effort:** —
- **Agent prompt:** "Design and implement Wine Circles Phase 1 for Somm. Create Supabase tables: `wine_circles(id uuid, name text, created_by uuid, invite_code text unique, created_at timestamptz)` and `circle_members(circle_id uuid, user_id uuid, joined_at timestamptz)`. Create a `/circles` page with: (1) 'Create Circle' form generating a unique 6-character alphanumeric invite code; (2) 'Join Circle' form accepting an invite code; (3) list of the current user's circles with member count and share-code button. When a scan completes, add a 'Share with Circle' option that inserts a `shared_scans(scan_session_id, circle_id, shared_by uuid, shared_at timestamptz)` record. Circle members can view shared scans with a 'Shared by [name]' badge. Do not implement real-time in this phase — sharing is asynchronous."

---

## Dropped / Stale

| Item | Reason |
|------|--------|
| **Restaurant Partnership Integration** | Primarily a business development task — technical foundation has no value without active restaurant partners. Dropped June 5 assessment; revisit when go-to-market outreach begins. |
| **Offline Cellar Browsing (PWA)** | Dropped June 5 assessment — this is a natural half-day follow-on to the Cellar React Query migration. No value in tracking as a standalone item; note added to Cellar work. |
