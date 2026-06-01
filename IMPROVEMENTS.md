# Improvements Assessment — Somm

*Assessment Date: May 31, 2026*

---

## Assessment Methodology

This assessment reviewed the PRD (Phases 1–5), recent commit history (last active: March 2026), component structure, service layer architecture, and open items across all planned phases. Since Somm is a more focused, single-purpose app (wine scanning and recommendation), improvements were evaluated against the core product loop: **scan → recommend → rate → improve**. No formal risk or architecture review document currently exists for Somm, so technical findings were inferred from code structure, PRD constraints, and cross-app pattern comparisons.

**Key signals reviewed:**
- PRD phases: Phases 1 & 2 complete; Phase 3 (discovery/history), 4 (social), 5 (platform) planned
- Recent commits: React Query for preferences caching, fuzzy wine name matching, redundant DB query reduction (March 2026)
- Earlier commits: simplified onboarding, spectrum taste preferences, improved budget adherence (Feb 2026)
- Component inventory: lean structure (13 components), services layer present (`scanService.ts`, `tasteService.ts`), `__tests__` directory exists
- PRD constraints: user-provided OpenAI key in localStorage, no CI/CD, scan cost-gating via admin approval

---

## Tier 1 — High-Impact, Quick Wins

These improvements deliver immediate reliability or usability value with low effort.

---

### 1.1 React Error Boundaries

**Description:** Somm has no `<ErrorBoundary>` components. If any component throws an unhandled render error — such as a malformed AI recommendation payload, a Supabase timeout during a scan, or an unexpected JSON structure from the vision model — the entire app crashes to a white screen with no recovery path. This is especially problematic given that the scanner is used in real-time in restaurants and stores where users need to recover quickly. A single well-placed `ErrorBoundary` is a one-day fix with significant reliability upside.

**Estimated Effort:** 1 day  
**Expected Impact:** High reliability — eliminates white-screen-of-death scenarios in core user flows; builds trust during the most stressful in-context usage (standing in a wine aisle or at a restaurant).

**Agent Prompt:**
> Add React Error Boundaries to Somm. Create `src/components/ErrorBoundary.tsx` as a React class component implementing `componentDidCatch(error, errorInfo)` (log both) and `getDerivedStateFromError()`. Render a fallback UI matching the app's dark wine-themed style: a centered card with a wine glass icon, "Something went wrong" heading, a short reassuring message, and a "Try again" button that calls `window.location.reload()`. In `src/App.tsx`, wrap: (1) the entire router output in a top-level `<ErrorBoundary>`; (2) the WineScanner-related page specifically in its own `<ErrorBoundary fallback={...}>` with message "Scanner encountered an error — your cellar history is safe." Test by temporarily throwing in a component to confirm the boundary catches it and the fallback renders.

---

### 1.2 Scan History Search and Filter

**Description:** Users who have made 20+ scans have no way to quickly find a past scan by restaurant name, detected wine, date, or star rating. This is especially frustrating because the cellar history is meant to feed into future recommendations — users want to reference and validate past scans. The PRD identifies scan history search and filtering as the top Phase 3 priority. This is entirely client-side filtering on already-fetched session data and requires no backend changes.

**Estimated Effort:** 2 days  
**Expected Impact:** High usability — directly serves returning users (the highest-value segment); closes the most obvious navigation gap for active app users.

**Agent Prompt:**
> Add search and filter functionality to the Scan History page in Somm. In the scan history list component, add: (1) a text search input (debounced 300ms) that filters scan sessions by matching against detected wine names (`session.recommendations[].name` and any `detected_wines` fields); (2) a date range filter as a segmented button group — "Last 7 days", "Last 30 days", "Last 3 months", "All time"; (3) a minimum match-score filter — "Show only 80+ score wines" toggle. All filtering should be performed client-side on the already-loaded session list. Show a "No results" empty state with a clear-filters link. Persist the active filter state to `sessionStorage` so filters survive navigating to a scan detail and back. No new Supabase queries are required.

---

### 1.3 Close the Recommendation Feedback Loop — "I Chose This"

**Description:** The PRD's primary success metric is >60% of scans resulting in a saved wine. But there is currently no signal capturing *which* recommended wine the user actually selected and purchased. Without this, the AI cannot learn which wines in a given list users actually choose, and the ranking algorithm cannot improve over time. Adding a lightweight "I chose this" button on each recommendation card — separate from the 5-star cellar rating — closes the feedback loop and creates the data foundation for smarter future recommendations.

**Estimated Effort:** 2–3 days  
**Expected Impact:** High — directly addresses the #1 PRD success metric; creates a data flywheel for improving recommendation quality; differentiates Somm from tools that only scan, not learn.

**Agent Prompt:**
> Add a "chosen" signal to Somm's recommendation system. Create a Supabase migration adding a `chosen_wine_name text` nullable column to the `scan_sessions` table. In `src/components/RecommendationCard.tsx`, add a small "I picked this" button (checkmark icon, subtle styling — does not compete with the star rating). When clicked: (1) call `scanService.updateChosenWine(sessionId, wineName)` to set `chosen_wine_name`; (2) show a brief confirmation toast; (3) toggle the button to a "checked" state visually. In `src/services/scanService.ts`, add the `updateChosenWine` function. In the Somm `analyze-wine` Edge Function, include the user's last 10 `chosen_wine_name` values from `scan_sessions` in the recommendation system prompt as "wines this user has selected in real situations" so the LLM can weight similar styles higher in future scans.

---

## Tier 2 — Medium-Impact, Moderate Effort

These improvements materially grow the user base or close significant product gaps.

---

### 2.1 Shared/Pooled API Key Model

**Description:** Somm currently requires each user to provide their own OpenAI API key, stored in the browser's `localStorage`. This is a significant onboarding barrier — most users do not have or want to manage an API key. The PRD explicitly notes "a pooled key model may be needed for broader adoption." The Supabase Edge Function infrastructure is already in place; moving to a server-side pooled key removes the friction, enables usage tracking per user, and aligns with the existing admin-approval cost-control model.

**Estimated Effort:** 3–4 days  
**Expected Impact:** High adoption — removes the single largest onboarding barrier; unlocks user growth beyond the developer/technical audience; per-user scan limits replace the API key as the cost-control mechanism.

**Agent Prompt:**
> Remove the user-provided OpenAI API key requirement from Somm. Store a pooled `OPENAI_API_KEY` as a Supabase secret (`supabase secrets set OPENAI_API_KEY=...`). Update all Edge Functions that currently read the key from the request body (`analyze-wine` and any others) to instead read `Deno.env.get('OPENAI_API_KEY')`. In the frontend, remove the API key input from `src/components/OnboardingModal.tsx` and any settings section where it currently appears. Remove all `localStorage` reads and writes for the API key. Add a cost-control mechanism: create a `daily_scan_counts(user_id uuid, scan_date date, count int)` table with a unique constraint on `(user_id, scan_date)`. In the `analyze-wine` Edge Function, check and increment this counter; return HTTP 429 with a clear user message when the daily limit (e.g., 10 scans) is reached. Show the remaining scan count in the Scanner UI.

---

### 2.2 Scan History Export (CSV)

**Description:** The PRD lists exporting scan history as a Phase 3 planned feature. Wine enthusiasts using Somm as a personal wine journal want to extract their history for personal records, wine club meetings, or import into another tool. CSV export is implementable entirely client-side from already-fetched session data — no backend changes required. This is a low-risk, high-satisfaction feature for the most engaged users.

**Estimated Effort:** 1–2 days  
**Expected Impact:** Medium — satisfies power users and wine club use cases; increases perceived data ownership and trust; straightforward to implement.

**Agent Prompt:**
> Add scan history CSV export to Somm. Create `src/utils/exportHistory.ts` with an `exportToCsv(sessions: ScanSession[]): void` function that converts scan sessions into CSV rows with columns: Date, Context (Store/Restaurant), Notes, Wine Name, Producer, Vintage, Type, Region, Match Score, My Rating (stars), Tasting Notes (from cellar entry if linked). Generate the CSV string and trigger a browser download using `URL.createObjectURL(new Blob([csvString], { type: 'text/csv;charset=utf-8;' }))`. Set the download filename to `somm-scan-history-YYYY-MM-DD.csv`. Add an "Export CSV" button to the scan history page header (use a download icon). If no sessions are present, disable the button with a tooltip. Ensure exported data includes only the current user's records (already enforced by RLS, but verify the client query has the correct `user_id` filter).

---

### 2.3 CI/CD Pipeline with GitHub Actions

**Description:** Somm has no automated CI pipeline. TypeScript type checking, ESLint, and tests (the `src/components/__tests__` directory exists with `vitest.config.ts`) only run if a developer manually triggers them. This means type errors and regressions can land in `main` undetected. Adding a minimal GitHub Actions workflow ensures code quality is enforced on every push, taking less than a day to set up.

**Estimated Effort:** 1 day  
**Expected Impact:** Medium ongoing — prevents regressions; enforces code quality standards automatically; low effort for high ongoing value.

**Agent Prompt:**
> Create `.github/workflows/ci.yml` for the Somm repository. The workflow should trigger on `push` to `main` and any `claude/**` branches, and on `pull_request` targeting `main`. Define three parallel jobs: (1) **Lint** — `npm ci` + `npx eslint src/`; (2) **Type Check** — `npm ci` + `npx tsc --noEmit`; (3) **Test** — `npm ci` + `npx vitest run --reporter=verbose`. Use `actions/setup-node@v4` with Node 20 and `actions/cache@v4` for the `node_modules` cache key based on `package-lock.json`. Add placeholder environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with dummy values so the Vite build does not fail on missing secrets. Verify the workflow passes on the first run by checking that `supabase/` edge functions are excluded from the TypeScript compilation scope (check `tsconfig.app.json` includes/excludes).

---

## Tier 3 — Strategic, Longer-Term

These improvements define Somm's long-term differentiation and market positioning.

---

### 3.1 Wine Circles — Group Scanning

**Description:** The PRD's Phase 4 vision for Wine Circles is uniquely differentiated: one person photographs a wine list and all group members simultaneously receive personalized recommendations tailored to their individual taste profiles from the same list. No major wine app offers this mechanic. It transforms Somm from a solo tool into a dinner-party and wine-club companion — a natural sharing moment that drives group adoption and organic referrals.

**Estimated Effort:** 3–4 weeks  
**Expected Impact:** High long-term — unique social mechanic driving group adoption; increases scans-per-event (multiple users, one list); creates natural referral loops and viral acquisition.

**Agent Prompt:**
> Design and implement Wine Circles Phase 1 for Somm (group creation and shared scanning). Create Supabase tables: `wine_circles(id uuid, name text, created_by uuid, invite_code text unique, created_at timestamptz)` and `circle_members(circle_id uuid, user_id uuid, joined_at timestamptz)`. Create a `/circles` page with: (1) "Create Circle" form generating a unique 6-character alphanumeric invite code; (2) "Join Circle" form accepting an invite code; (3) list of the current user's circles with member count and a share-code button. When a scan is completed, add a "Share with Circle" option that inserts a `shared_scans(scan_session_id, circle_id, shared_by uuid, shared_at timestamptz)` record. Circle members can then view shared scans from their own session history with a "Shared by [name]" badge, and each member sees personalized recommendations computed from their own taste profile against the shared wine list. Do not implement real-time in this phase — sharing is asynchronous.

---

### 3.2 Restaurant Partnership Integration

**Description:** Phase 5 envisions restaurants opting into a pre-loaded wine list accessible via QR code at the table, eliminating the need for users to photograph a menu. This transforms Somm from a reactive scanning tool to a proactive restaurant companion — and creates a unique B2B2C business model where restaurants gain anonymized palate preference data while users get instant, frictionless recommendations.

**Estimated Effort:** 6–10 weeks (including partnership process)  
**Expected Impact:** Very high long-term — unlocks a B2B revenue stream; dramatically reduces scan friction in the most common use context; creates a defensible data and distribution moat.

**Agent Prompt:**
> Design the technical foundation for Somm Restaurant Integration (Phase 5 building block). Create Supabase tables: `restaurants(id uuid, name text, address text, cuisine_type text, qr_code_token text unique, is_active boolean)` and `restaurant_wine_lists(id uuid, restaurant_id uuid, wine_name text, producer text, vintage int, price numeric, type text, region text, updated_at timestamptz)`. Create a public (unauthenticated) Supabase Edge Function `get-restaurant-list` that accepts a `?token=` query param and returns the active wine list for that restaurant — no OpenAI call, just data. In the Somm app, add a URL route handler for `/r/:token` that loads a restaurant's pre-populated wine list directly into the `analyze-wine` flow without requiring the camera. Create a minimal restaurant admin portal at `/admin/restaurant` (gated behind an `is_restaurant_admin` boolean on `user_profiles`) where wine lists can be uploaded via CSV paste or a manual add-wine form.

---

### 3.3 Offline Cellar Browsing (PWA)

**Description:** The PRD notes "cellar browsing could work offline in a future PWA version." Wine cellar data is the one part of the app that requires no real-time internet access — users frequently want to review their past wines at a restaurant table when connectivity is poor. A service worker that caches the cellar data on last successful fetch requires minimal complexity and resolves a genuine real-world friction point.

**Estimated Effort:** 3–5 days  
**Expected Impact:** Medium — solves a genuine connectivity problem in the core use context (restaurants, wine shops, cellars); improves the app-like feel on mobile; enables the cellar to remain useful in low-signal environments.

**Agent Prompt:**
> Add PWA offline support for cellar browsing to Somm. Install `vite-plugin-pwa` and configure it in `vite.config.ts` with the `generateSW` strategy. Create `public/manifest.json` with app name "Somm", a wine glass icon, and theme colors matching the app's deep burgundy/slate palette. Configure Workbox to: (1) cache all JS/CSS/font assets with `CacheFirst`; (2) cache Supabase API responses for `wine_memories` (the cellar table) with `NetworkFirst` with a 30-minute TTL, falling back to the cached version when offline; (3) show a minimal `public/offline.html` fallback for all other routes that explains scanning requires internet but the cellar is available offline. Test with Chrome DevTools "Offline" mode to confirm the `/cellar` route loads wine entries without a network connection after a prior online visit. Do not attempt to make the scanner or recommendation engine work offline.

---

## Reassessment — June 1, 2026

*Assessment Date: June 1, 2026*

---

### Progress Since May 31 Assessment

| Item | Status | Notes |
|------|--------|-------|
| React Error Boundaries (Tier 1.1) | ✅ Completed | Direct commit — June 1, 2026 |

**Remaining open items from previous assessment:** Scan History Search (1.2), "I Chose This" feedback loop (1.3), Pooled API Key (2.1), CSV Export (2.2), CI/CD Pipeline (2.3), Wine Circles (3.1), Restaurant Integration (3.2), Offline PWA (3.3).

**New findings from current codebase review (June 1, 2026):**
- `src/pages/Preferences.tsx` is **23,654 bytes** — the largest page component, managing taste spectrum sliders, varietal toggles, budget ranges, and food pairing in a single scrolling form.
- `src/pages/Scanner.tsx` (20,097 bytes) and `src/pages/ScanDetail.tsx` (15,631 bytes) are the core user-facing flow with no observed test coverage.
- Somm remains the only app in this portfolio with no CI/CD pipeline — type errors can land on `main` undetected during active development.
- No `CLAUDE.md` exists, leaving future AI-assisted sessions without project context.

---

### Updated Tier 1 — High-Impact, Quick Wins

---

#### 1.1 React Error Boundaries ✅ **COMPLETED** (June 1, 2026)

`src/components/ErrorBoundary.tsx` implemented with dark wine-themed fallback UI. Scanner page wrapped in its own boundary with "cellar history is safe" messaging. No further action needed.

---

#### 1.2 Scan History Search and Filter *(Carried Forward — Status: Open)*

See the May 31 entry above for full description and agent prompt.

**Estimated Effort:** 2 days | **Expected Impact:** High usability

---

#### 1.3 Close the Recommendation Feedback Loop — "I Chose This" *(Carried Forward — Status: Open)*

See the May 31 entry above for full description and agent prompt.

**Estimated Effort:** 2–3 days | **Expected Impact:** High

---

#### 1.4 CI/CD Pipeline with GitHub Actions (Elevated from Tier 2)

**Description:** Somm is the only app in this portfolio without automated CI. With error boundaries now merged and active development continuing, TypeScript type regressions and ESLint violations can land on `main` undetected. The `src/pages/__tests__` directory exists but tests run only when a developer manually triggers them. Elevating CI/CD from Tier 2 reflects that the app is actively evolving and the absence of a quality gate is now the most pressing infrastructure gap.

**Estimated Effort:** 1 day  
**Expected Impact:** High ongoing — prevents type regressions from landing on `main`; enforces code quality automatically on every push; establishes the baseline for all future improvements to the scanner and recommendation flows.

**Agent Prompt:**
> Create `.github/workflows/ci.yml` for the Somm repository. Trigger on: `push` to `main` and any `claude/**` branches; `pull_request` targeting `main`. Define three parallel jobs: (1) **Lint** — `npm ci` + `npx eslint src/`; (2) **Type Check** — `npm ci` + `npx tsc --noEmit`; (3) **Test** — `npm ci` + `npx vitest run --reporter=verbose`. Use `actions/setup-node@v4` with Node 20 and `actions/cache@v4` keyed on `package-lock.json` hash. Set placeholder env vars `VITE_SUPABASE_URL=https://placeholder.supabase.co` and `VITE_SUPABASE_ANON_KEY=placeholder` so Vite type resolution doesn't fail on missing secrets. Confirm `supabase/` is excluded from the TypeScript compilation scope in `tsconfig.app.json`. Verify all three jobs complete green on the first push.

---

### Updated Tier 2 — Medium-Impact, Moderate Effort

---

#### 2.1 Shared/Pooled API Key Model *(Carried Forward — Elevated Priority)*

See the May 31 entry above for full description and agent prompt. With error boundaries protecting the scanner, removing the per-user API key barrier is now the highest-impact growth unlock remaining in Tier 2.

**Estimated Effort:** 3–4 days | **Expected Impact:** High adoption

---

#### 2.2 Preferences.tsx Modularization (23 KB)

**Description:** `src/pages/Preferences.tsx` at 23,654 bytes manages four distinct user preference domains — taste spectrum sliders, grape varietal toggles, budget range settings, and food pairing preferences — in a single scrolling form component. These sections have distinct data shapes, mutation paths, and interaction patterns. Splitting them into focused sub-components reduces cognitive load for future taste-profile enhancements (e.g., adding a new preference dimension or varietal category) and enables per-section unit testing.

**Estimated Effort:** 2 days  
**Expected Impact:** Medium — reduces complexity of the most-edited settings component; makes future taste-profile enhancements faster to implement; enables per-section testing.

**Agent Prompt:**
> Refactor `src/pages/Preferences.tsx` in Somm without changing any visible behavior or styling. Extract: (1) `src/components/preferences/TasteSpectrumSection.tsx` — the spectrum sliders (bold↔delicate, dry↔sweet, etc.); (2) `src/components/preferences/VarietalTogglesSection.tsx` — grape varietal include/exclude toggles; (3) `src/components/preferences/BudgetRangeSection.tsx` — per-context (restaurant/store) budget min/max inputs; (4) `src/components/preferences/FoodPairingSection.tsx` — food type preference toggles. Each component should accept the relevant slice of the preferences object as props and call an `onChange(partial)` callback. `Preferences.tsx` should become a thin orchestrator under 200 lines. Run `npx vitest run` and `npx tsc --noEmit` to confirm no regressions.

---

#### 2.3 Scan History Export (CSV) *(Carried Forward — Status: Open)*

See the May 31 entry above for full description and agent prompt.

**Estimated Effort:** 1–2 days | **Expected Impact:** Medium

---

### Updated Tier 3 — Strategic, Longer-Term

---

#### 3.1 Wine Circles — Group Scanning *(Carried Forward — Status: Open)*

See the May 31 entry above for full description and agent prompt.

**Estimated Effort:** 3–4 weeks | **Expected Impact:** High long-term

---

#### 3.2 Restaurant Partnership Integration *(Carried Forward — Status: Open)*

See the May 31 entry above for full description and agent prompt.

**Estimated Effort:** 6–10 weeks | **Expected Impact:** Very high long-term

---

#### 3.3 Offline Cellar Browsing (PWA) *(Carried Forward — Status: Open)*

See the May 31 entry above for full description and agent prompt.

**Estimated Effort:** 3–5 days | **Expected Impact:** Medium
