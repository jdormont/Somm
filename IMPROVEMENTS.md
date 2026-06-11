# Improvements
_Last assessment: 2026-06-11_
_Last knowledge sync: 2026-06-11_
_Assessment based on: `git fetch origin main` + `git log origin/main` (last 30 commits, through `979c16c`); full PR history via GitHub MCP (#1-#16, all closed — #16 merged June 11 closing the prior Current Sprint item; PR #18 is an open implementation PR addressing the Settings.tsx shared-key UX item below, not yet merged); open issues (none — `mcp__github__list_issues` returns 0); PRD.md and preference_logic.md re-read in full; fresh-eyes code inspection of `Cellar.tsx` (confirmed `searchQuery` now present, PR #16 merged), `Settings.tsx` (117 lines, confirmed still zero references to `use_shared_key`/`useAuth`/`profile` prior to PR #18 — gap addressed by that PR), `Dashboard.tsx` + `useScannerLogic.ts` (confirmed `hasApiKey`/`profile?.use_shared_key` handling correct, line 55/58 respectively), `Preferences.tsx` (552 lines, `TagGrid` + monolithic default export, `PreferencesRefactor.test.tsx` still unused for its intended purpose), `Knowledge.tsx` + `WineKnowledgeModal.tsx` (confirmed both query `wine_knowledge` table, matches migration `20260206211214_create_wine_knowledge_content.sql` — feature appears complete), `supabase/functions/analyze-wine/index.ts` (615 lines — full pipeline re-read: STEP 1a OCR, STEP 1b scoring, STEP 2 Tavily research via `Promise.all` (already parallel), STEP 3 final RAG call), `useScannerLogic.ts` (full read — single `analyzing` boolean, no staged progress), `scanService.ts` (`getSessions` has no `.limit()`/pagination), `src/pages/__tests__/` (Dashboard, PreferencesRefactor, Scanner test files exist), no `daily_scan_counts` migration, no `exportToCsv`/CSV references in `src/`, no `Revisit`/`reRun`/`revisited_from` references in `src/`._

**Note on this cycle's verification:** `node_modules/` is absent in this sandbox (fresh checkout, no `npm install` run), so `npm run lint`/`typecheck`/`vitest` could not be executed this cycle — all findings below are from direct code inspection only. This is an environment artifact, not a new code-health finding; prior cycles confirmed these commands pass cleanly.

---

## Current Sprint
Settings.tsx shared-key UX (Tier 1) — `[IN PROGRESS — PR: #18]`

---

## Recently Completed ✓

| Item | Status | Notes |
|------|--------|-------|
| Cellar text search (Tier 1) | ✅ DONE — merged: 2026-06-11, PR #16 | Added `searchQuery` state and a search input above the rating-filter row in `src/pages/Cellar.tsx`, matching `Dashboard.tsx`'s styling. `filtered` now combines search (case-insensitive match against `name`/`producer`/`region`) with the existing `filterRating` filter (AND logic). Added a "No wines match your search" empty state with clear-search action. PR reported `npm run lint`/`typecheck`/`build`/`vitest run` all clean. Closes the item that was Current Sprint at the last assessment. |
| Remove debug console.log statements from AuthContext.tsx (Tier 1) | ✅ Done | PR #14, merged June 8. Carried forward for history. |
| Add CLAUDE.md project context file (Tier 1) | ✅ Done | Commit `0f1c581`, June 7. Carried forward for history. |
| Verify/run analyze-wine deploy for the feedback-loop fix (Tier 1) | ✅ Done — deploy confirmed 2026-06-07 | `[CHOSEN_WINE_HISTORY]` injection from `chosenWineNames` confirmed live in production. Carried forward for history. |
| Close "I Chose This" feedback loop in analyze-wine (Tier 1) | ✅ Done | PR #11, June 5. Carried forward for history. |
| Fix chosenWine stale initialization in ScanDetail | ✅ Done | PR #8, June 5. Carried forward for history. |
| "I Chose This" feedback button (was Tier 1.3) | ✅ Done | PR #5, June 2. Carried forward for history. |
| Scan History Search and Filter (was Tier 1.2) | ✅ Done | PR #5, June 2. Carried forward for history. |
| React Error Boundaries (was Tier 1.1) | ✅ Done | PR #3, June 1. Carried forward for history. |
| CI/CD Pipeline (was Tier 1.4) | ✅ Done | PR #3, June 1. Carried forward for history. |

---

## Tier 1 — Quick Wins

### Settings.tsx shared-key UX — `[IN PROGRESS — PR: #18]`
- **What:** Split out from the prior "Complete the pooled API key migration" Tier 2 item, which was partly resolved without being tracked: `Dashboard.tsx` (line 55) already correctly computes `hasApiKey = !!localStorage.getItem('somm_openai_api_key') || !!profile?.use_shared_key`, and `useScannerLogic.ts` (line 58) has the equivalent guard — so the setup-warning banner and scan gate already behave correctly for shared-key users. The remaining gap was narrower than previously scoped: `Settings.tsx` (117 lines) had zero references to `use_shared_key`, `useAuth`, or `profile` — the API key input section rendered identically for all users regardless of whether an admin had granted them shared-key access.
- **Status:** PR #18 imports `useAuth` and checks `profile?.use_shared_key`. If true, the API key input section is replaced with a read-only confirmation card ("No API key required") styled with the existing glassmorphism card + champagne/`vine` accent colors. If false, the existing input is kept with an added note that the requirement may not apply to shared-key accounts. No changes to `Dashboard.tsx`, `useScannerLogic.ts`, or the edge function. `npx vitest run` (18/18), `npm run build` clean; pre-existing lint/typecheck errors in `supabase/functions/` and `tasteService.ts`/`Dashboard.test.tsx` are unrelated and present on `main`. Awaiting review/merge.
- **Effort estimate:** S
- **Actual effort:** S

---

### Staged progress feedback during scan analysis — OPEN _(new this cycle)_
- **What:** `Scanner.tsx` shows a single static "Analyzing wine list..." spinner (line 244) for the entire duration of the `analyze-wine` call. But per CLAUDE.md, that single request actually runs 4 sequential/parallel network calls — OCR extraction (GPT-4o vision), scoring (GPT-4o text), Tavily research for the top 8 candidates (parallelized), and the final RAG recommendation call (GPT-4o vision again). For a 60+ wine list this can take 15-30+ seconds with zero feedback differentiation, which reads as "stuck" to users.
- **Why now:** This is purely a client-side UX change — no backend/edge function modification needed. It directly addresses PRD's "30-second confident choice" promise by making the wait feel intentional and "smart" rather than broken, especially important since long lists (the OCR step is explicitly tuned for 60+ wines) take the longest. Low risk, high perceived-quality payoff, and a good complement to the Settings.tsx fix above as a "polish the core flow" pairing.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "In `src/pages/Scanner.tsx`, replace the single static 'Analyzing wine list...' label (around line 244, where `analyzing` is true) with a rotating sequence of staged messages driven by a `useEffect`/`setInterval` timer (no need to track real backend progress — `analyze-wine` doesn't stream): e.g. 'Reading the wine list...' (0-5s), 'Scoring matches against your taste profile...' (5-12s), 'Researching your top picks...' (12-22s), 'Finalizing recommendations...' (22s+). Reset the timer/stage to 0 when `analyzing` becomes true and clear the interval on unmount or when `analyzing` becomes false. Keep the existing `Loader2` spinner. No changes to `useScannerLogic.ts` or the edge function."

---

### Scan history CSV export — OPEN
- **What:** Wine enthusiasts using Somm as a personal wine journal want to extract their history for personal records, wine club meetings, or import into another tool. CSV export is implementable entirely client-side from already-fetched session data — no backend changes required. Confirmed June 11: no `exportToCsv` utility or export button exists yet.
- **Why now:** Carried from prior assessments (5th consecutive cycle); remains the most-requested type of feature for power users. Relatively contained implementation — a good standalone PR.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "Add scan history CSV export to Somm. Create `src/utils/exportHistory.ts` with an `exportToCsv(sessions: ScanSession[]): void` function that converts scan sessions into CSV rows with columns: Date, Context, Notes, Wine Name, Producer, Vintage, Type, Region, Match Score, Chosen (yes/no from `chosen_wine_name`). Generate the CSV string and trigger a download using `URL.createObjectURL(new Blob([csvString], { type: 'text/csv;charset=utf-8;' }))`. Set filename to `somm-scan-history-YYYY-MM-DD.csv`. Add an 'Export CSV' button (download icon, `lucide-react`) to the scan history page header in `Dashboard.tsx`. Disable with tooltip when no sessions exist."

---

## Tier 2 — Next Sprint

### Scan history pagination — OPEN _(new this cycle)_
- **What:** `scanService.getSessions()` (`src/services/scanService.ts`, line 8-17) fetches **all** of a user's `scan_sessions` rows in one query, with no `.limit()`/`.range()`, including the full `wines_detected` and `recommendations` JSON blobs for every session ever created. `useRecipes`-equivalent pagination exists elsewhere in the sister repos (e.g. meal-planner's `useRecipes` does 12/page) but Somm's scan history has no such pattern.
- **Why now:** PRD's success metric explicitly targets ">3 scans per user per month" and "return usage" — meaning over a year an active user accumulates 36+ sessions, each carrying potentially dozens of recommendation objects with `reasoning`/`tasting_notes`/`food_pairings` text. This is the kind of slow-creeping performance issue that's invisible in testing (few sessions) but degrades steadily for the most engaged users — exactly the users PRD cares most about retaining. Catching it now (before CSV export and Revisit add more reasons to view long history) is cheaper than retrofitting later.
- **Effort estimate:** M
- **Agent prompt:** "In `src/services/scanService.ts`, change `getSessions(userId: string)` to accept pagination params (e.g. `getSessions(userId: string, page = 0, pageSize = 20)`) and apply `.range(page * pageSize, page * pageSize + pageSize - 1)`. Update the corresponding React Query hook in `src/hooks/useScans.ts` to support `useInfiniteQuery` or a page-based query key. Update `Dashboard.tsx`'s scan history list to add a 'Load more' button or infinite-scroll trigger. Preserve existing search/filter behavior — note that client-side search/filter over a paginated list means either (a) search triggers a separate unpaginated query, or (b) search is server-side via `.ilike()` on `notes`/`summary`. Pick (a) for a minimal first pass and document the tradeoff. Verify with `npx vitest run` (touches `Dashboard.test.tsx`)."

---

### Preferences.tsx modularization (23 KB) — OPEN
- **What:** `src/pages/Preferences.tsx` at 552 lines (confirmed June 11, unchanged) manages four distinct user preference domains — taste spectrum sliders, grape varietal toggles, budget range settings, and food pairing preferences — in a single scrolling form. `PreferencesRefactor.test.tsx` already exists in `src/pages/__tests__/` suggesting this work was anticipated.
- **Why now:** This is the most-edited settings component; any future change to taste preferences touches this entire file. Modularizing before the next taste-profile feature is added prevents compounding complexity. Now the longest-standing open Tier 2 item (5th consecutive assessment unchanged).
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Refactor `src/pages/Preferences.tsx` in Somm without changing any visible behavior or styling. Extract: (1) `src/components/preferences/TasteSpectrumSection.tsx` — the spectrum sliders (body, sweetness, tannins, acidity, earthiness); (2) `src/components/preferences/VarietalTogglesSection.tsx` — grape varietal include/exclude toggles; (3) `src/components/preferences/BudgetRangeSection.tsx` — per-context (restaurant/store) budget min/max inputs; (4) `src/components/preferences/FoodPairingSection.tsx` — food type preference toggles. Each component should accept the relevant slice of the preferences object as props and call an `onChange(partial)` callback. `Preferences.tsx` should become a thin orchestrator under 200 lines. Run `npx vitest run` and `npx tsc --noEmit` to confirm no regressions, paying particular attention to `PreferencesRefactor.test.tsx` which appears to anticipate this exact change."

---

### "Revisit" / re-run a past scan — OPEN
- **What:** PRD Phase 3 ("Scan History Enhancements") calls for a "Revisit" button to re-run a past scan with updated preferences. Confirmed June 11: no `Revisit`/`re-run`/`reRun`/`revisited_from` references anywhere in `src/`. The underlying data is already available — `scan_sessions` stores the original detected wines and `debug_info` (with `allWinesFound`/`researchedWines`), and `analyze-wine` already accepts the `wine_memories`/preferences payload that would have changed since the original scan.
- **Why now:** This is a natural complement to the closed "I Chose This" feedback loop — it lets users see how their *evolving* taste profile (after rating wines, adjusting sliders, or adding taste anchors) would re-rank a list they've already scanned, directly demonstrating the "flywheel of improving accuracy" that PRD Goal #2 promises. Scoped to re-running steps 2 and 3 against already-stored `allWinesFound` candidates rather than re-running OCR, this avoids re-uploading the image and keeps the OpenAI cost roughly in line with a normal scan minus the vision OCR call (though note Tier 3 finding below: the final RAG call also re-sends the image at "high" detail, so cost savings are partial unless that's also addressed).
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Add a 'Revisit' action to `ScanDetail.tsx` and the scan history list in `Dashboard.tsx`. When clicked, call a new edge function path (or extend `analyze-wine` with a `revisitSessionId` parameter) that skips OCR (STEP 1a) and re-runs scoring (STEP 1b) and research+recommend (STEPS 2-3) using the `allWinesFound` candidates already stored in `scan_sessions.debug_info`, against the user's *current* `user_preferences` and `wine_memories`. Persist the result as a new `scan_sessions` row with a `revisited_from` foreign key pointing at the original session (new migration required). Show a small badge ('Re-scanned from [date]') on revisited sessions in the history list. If `debug_info.allWinesFound` is missing for older sessions (pre-debug-block sessions), disable the Revisit button with a tooltip explaining the original scan didn't store enough data."

---

## Tier 3 — Strategic

### Double image-upload cost in analyze-wine pipeline — OPEN _(new this cycle)_
- **What:** `supabase/functions/analyze-wine/index.ts` sends the **same image twice** to GPT-4o vision at `detail: "high"` (the most expensive image tier) — once in STEP 1a (OCR extraction, line ~358) and again in STEP 3 (final RAG recommendation call, line ~572), where it's used partly to re-derive `wines_detected`. Both `rawWines` (from STEP 1a) and `candidates` (scored/ranked in STEP 2) already contain the full wine list with names/vintages/prices — `wines_detected` in the STEP 3 output is largely redundant with data the pipeline already has.
- **Why now:** This is a direct, per-scan cost lever — PRD's Constraints section calls out GPT-4 Vision token cost as the explicit reason the admin-approval gate exists, and this repo's whole pooled-key roadmap (Settings.tsx UX, daily quota item below) is about managing that same cost. Removing the second high-detail image send (or downgrading it to `detail: "low"`/omitting it and deriving `wines_detected` from `candidates` instead) could meaningfully cut per-scan vision token cost without changing the recommendation quality, since STEP 3's `researchContext` (from Tavily) and `userProfile`/`constraints` already carry the substantive signal. This requires care — the final call may use the image for nuance beyond OCR (e.g., reading shelf-talkers, confirming illegible vintages) — so it needs a quality-comparison pass before/after, not a blind removal. Flagging as Tier 3 (strategic, needs careful before/after evaluation of recommendation quality) rather than Tier 1/2.
- **Effort estimate:** L (requires A/B-style quality comparison of recommendations with vs. without the second image attachment, across a range of list lengths/qualities, before committing to a change in a cost-sensitive path)
- **Agent prompt:** "In `supabase/functions/analyze-wine/index.ts`, investigate whether STEP 3's final RAG call (around line 558-579) needs to re-attach the full image at `detail: 'high'`. Try two variants: (a) omit the image from STEP 3 entirely, deriving `wines_detected` from `candidates` (already computed in STEP 2, has name/vintage/price/scores) and mapping its shape to match the existing `wines_detected` schema; (b) keep the image but at `detail: 'low'`. For both variants, run several real wine-list photos (varying quality/length) through both the current and modified pipeline and compare `recommendations` quality (accuracy of `structure`, `tasting_notes`, `reasoning` specificity) side by side. Document token usage before/after via the OpenAI response `usage` field. Only merge if quality holds — otherwise document findings and close as 'investigated, not viable' rather than leaving it open indefinitely."

---

### Daily scan quota for shared-key users — OPEN
- **What:** The edge function correctly resolves `use_shared_key = true` to the server's `OPENAI_API_KEY`, but there is still no per-user daily limit on shared-key usage — confirmed June 11, no `daily_scan_counts` table or equivalent exists in `supabase/migrations/`.
- **Why now:** This is the cost-control half of the pooled-key story and should land close in time to (or just after) the Settings.tsx UI piece (Tier 1, above) — once Settings.tsx actively advertises "no API key required" to shared-key users, usage on the shared key is likely to increase, and PRD's Constraints section explicitly calls out cost as a primary constraint. This item has now appeared across 3 consecutive assessments (June 7, 10, 11) without movement, primarily because it's gated behind the Settings.tsx UI work that creates the urgency. Per the staleness rule, rather than drop it (it's a real cost-control gap with no substitute) or leave it stuck at Tier 2 indefinitely, this assessment recommends it be picked up **in the same PR as** the Settings.tsx item above, or immediately after — bundling reduces the risk of shipping the UX promise ("no API key required!") without the cost guardrail that makes it safe to promote.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "In `supabase/functions/analyze-wine/index.ts`, after confirming `useSharedKey = true`, enforce a daily scan quota: upsert a row in a new `daily_scan_counts(user_id uuid, scan_date date, count int, primary key(user_id, scan_date))` table, incrementing `count`. If `count > 10`, return HTTP 429 with JSON `{ error: 'Daily scan limit reached. Resets at midnight UTC.' }`. Create the migration for `daily_scan_counts` with an appropriate RLS policy (users can read their own count; service role writes). Surface the 429 response in `useScannerLogic`/`Scanner.tsx` with a clear user-facing message. Note: requires a redeploy of `analyze-wine` after merge — coordinate with whoever runs `supabase functions deploy analyze-wine`."

---

### Wine Circles — Group Scanning — OPEN _(escalated from Tier 3 at June 5 assessment, now 4th consecutive cycle at this tier)_
- **What:** The PRD's Phase 4 vision: one person photographs a wine list and all group members simultaneously receive personalized recommendations tailored to their individual taste profiles from the same list. No major wine app offers this mechanic. Transforms Somm from a solo tool into a dinner-party and wine-club companion.
- **Why now:** Foundational differentiator for growth beyond solo users; natural referral mechanic. Scope is well-defined in PRD Phase 4. Per the staleness rule, this item has now appeared at Tier 3 for 4 consecutive assessments (June 5 escalation note, June 7, June 10, June 11) without movement on the gating items. Of the three original gating items (Cellar search, Settings.tsx shared-key UX, Preferences.tsx modularization), Cellar search is now done (PR #16) — 1 of 3. Per the staleness rule's instruction to "escalate the gating items rather than this one" if it reappears unchanged: Settings.tsx shared-key UX remains Tier 1 (shovel-ready, should close next cycle) and Preferences.tsx modularization remains Tier 2 — neither needs further escalation, they're already appropriately prioritized and just haven't been picked up yet. This item stays at Tier 3 one more cycle; if it reappears unchanged at the next assessment with Settings.tsx still open, that would indicate a process issue (Tier 1 items not being executed) worth flagging explicitly to the human reviewer rather than another reshuffle of this item.
- **Effort estimate:** L
- **Actual effort:** —
- **Agent prompt:** "Design and implement Wine Circles Phase 1 for Somm. Create Supabase tables: `wine_circles(id uuid, name text, created_by uuid, invite_code text unique, created_at timestamptz)` and `circle_members(circle_id uuid, user_id uuid, joined_at timestamptz)`. Create a `/circles` page with: (1) 'Create Circle' form generating a unique 6-character alphanumeric invite code; (2) 'Join Circle' form accepting an invite code; (3) list of the current user's circles with member count and share-code button. When a scan completes, add a 'Share with Circle' option that inserts a `shared_scans(scan_session_id, circle_id, shared_by uuid, shared_at timestamptz)` record. Circle members can view shared scans with a 'Shared by [name]' badge. Do not implement real-time in this phase — sharing is asynchronous."

---

### "Why not this wine?" explanations — OPEN
- **What:** PRD Phase 3 explicitly calls for "'Why not this wine?' explanations for wines that were detected but not recommended." The `analyze-wine` response already returns `wines_detected` separately from `recommendations`, and the `debug` block carries `allWinesFound` (with `s1`/`s2` scores) and `researchedWines`, persisted to `scan_sessions.debug_info`. Today, none of this is surfaced in the UI for non-recommended wines.
- **Why now:** This directly supports PRD Goal #2 (taste intelligence flywheel) by making the AI's reasoning legible, building user trust and potentially surfacing preference-profile mis-calibrations. It's lower-risk than Wine Circles since it's purely additive UI on existing data — no new edge function logic required for the MVP.
- **Effort estimate:** L (touches `ScanDetail.tsx` UI, requires careful handling of the case where `debug_info` is absent on older sessions, and needs UX design for how to present "all detected wines" without overwhelming the primary recommendations view)
- **Agent prompt:** "In `ScanDetail.tsx`, add a collapsible 'All wines on this list' section below the ranked recommendations, populated from `session.wines_detected` (or `debug_info.allWinesFound` if richer). For wines NOT present in `recommendations`, render a compact row with name/price and a 'Why not this one?' expandable explanation: if `debug_info.allWinesFound` contains `s1`/`s2` scores for that wine, render a short templated explanation referencing the lower score dimension (e.g., 'Scored lower on profile match — may be outside your preferred body/tannin range'); if no score data exists (older sessions or wines outside the scored set), show a generic 'Not in your top picks for this list' message. Gate the whole section behind a feature check for `debug_info` presence so older sessions degrade gracefully."

---

## Dropped / Stale

| Item | Reason |
|------|--------|
| **Restaurant Partnership Integration** | Primarily a business development task — technical foundation has no value without active restaurant partners. Dropped June 5 assessment; revisit when go-to-market outreach begins. |
| **Offline Cellar Browsing (PWA)** | Dropped June 5 assessment — natural half-day follow-on to the Cellar work. No value tracking as a standalone item. |

---

## Notes for next assessment

- **Instrumentation gap persists:** Still no open GitHub issues, meaning this backlog is driven entirely by code inspection against the PRD rather than real user feedback. As noted in the June 10 assessment, it would sharpen future cycles to have *any* lightweight usage signal — e.g. `chosen_wine_name` fill-rate vs. PRD's >60% target, or scan-session volume per user — to validate whether the feedback-loop work from PRs #5/#11 is actually moving the needle, and to prioritize between e.g. CSV export vs. Revisit vs. Wine Circles based on what users actually do.
- **Wine Knowledge (PRD Phase 3) confirmed complete this cycle** — `Knowledge.tsx` and `WineKnowledgeModal.tsx` both correctly query the `wine_knowledge` table (created by migration `20260206211214_create_wine_knowledge_content.sql`), with search, category filters, and a detail modal. This was flagged as needing review last cycle; review complete, no further action needed, not re-listed as an open item.
- **Settings.tsx shared-key UX is now in progress (PR #18)** after being correctly scoped as S-effort and shovel-ready for 2 consecutive cycles (June 10, 11) without being picked up. Once merged, the Daily scan quota item (Tier 3) is the recommended bundle/follow-on per its note above.
- **Sandbox note:** `node_modules/` was absent this cycle, preventing `npm run lint`/`typecheck`/`vitest run` verification. If this recurs, consider whether the assessment routine should run `npm install` first, or whether that's intentionally out of scope for a read-mostly assessment pass.
