# Improvements
_Last assessment: 2026-06-18_
_Last knowledge sync: 2026-06-15_
_Assessment based on: `git log` (local + `origin/main`, confirming PR #20 merge at commit `6af07f1`), PR history #1-#20 via GitHub MCP (all closed; #20 confirmed `merged: true` via `pull_request_read` after the `list_pull_requests` summary showed a stale `merged:false`/`merged_at` mismatch), open GitHub issues (zero), PRD.md, preference_logic.md, fresh-eyes code inspection of `supabase/functions/analyze-wine/index.ts` (quota-check block at lines 305-346, double image-upload at lines 404 & 618, redundant `auth.getUser()` calls at lines 251 & 311), `src/pages/Scanner.tsx` (still static spinner, line 255), `src/services/scanService.ts` (`getSessions` still unbounded, lines 8-17; new `DAILY_LIMIT_REACHED` error-mapping path from PR #20, lines 86-97, untested), `src/pages/Preferences.tsx` (still 552 lines, unchanged), `src/pages/ScanDetail.tsx` (All Wines Detected ~line 217, admin debug block lines 248-330), and a test-coverage sweep across `src/pages`, `src/hooks`, `src/services`, and edge functions._

**Sandbox note (recurring):** `node_modules/` was again absent in this sandbox, so `npm run lint`/`typecheck`/`vitest run` could not be executed this cycle — all findings are from direct code inspection. This is now the **3rd consecutive cycle** (June 11, 15, 18) this has recurred. Per the standing recommendation: either add an `npm install` setup step to this routine, or explicitly scope verification out of this read-mostly assessment so it stops being re-flagged. Treating as a process note, not re-listing as a backlog item.

---

## Current Sprint
None — ready for next implementation run.

---

## Recently Completed ✓

| Item | Status | Notes |
|------|--------|-------|
| Daily scan quota for shared-key users (Tier 1) | ✅ DONE — merged: 2026-06-16, PR #20 | `analyze-wine/index.ts` now checks `daily_scan_counts` before any OpenAI calls fire (lines 305-346), returns 429 with a clear message at the 10-scans/day cap for `use_shared_key` users. `Scanner.tsx` surfaces a distinct amber banner via a `DAILY_LIMIT_REACHED` sentinel in `scanService.ts`. Migration `20260616000000_create_daily_scan_counts.sql` applied. Closes the cost-guardrail gap flagged since PR #18 shipped the "no API key required" UX. Note: GitHub's PR-list API returned a stale `merged:false` flag for this PR this cycle despite `merged_at` being set and `pull_request_read` confirming `merged:true` — worth a sanity-check via `pull_request_read` (not just `list_pull_requests`) in future cycles before declaring something un-merged. |
| Settings.tsx shared-key UX (Tier 1) | ✅ Done | PR #18, merged 2026-06-11. Carried forward for history. |
| Cellar text search (Tier 1) | ✅ Done | PR #16, merged June 11. Carried forward for history. |
| Remove debug console.log statements from AuthContext.tsx (Tier 1) | ✅ Done | PR #14, merged June 8. Carried forward for history. |
| Add CLAUDE.md project context file (Tier 1) | ✅ Done | Commit `0f1c581`, June 7. Carried forward for history. |
| Close "I Chose This" feedback loop in analyze-wine (Tier 1) | ✅ Done | PR #11, June 5; deploy confirmed June 7. Carried forward for history. |

---

## Tier 1 — Quick Wins

### Staged progress feedback during scan analysis — OPEN
- **What:** `Scanner.tsx` still shows a single static "Analyzing wine list..." spinner (line 255) for the entire multi-call `analyze-wine` duration — OCR, scoring, Tavily research, and the final RAG call. For a 60+ wine list this can take 15-30+ seconds with zero feedback differentiation.
- **Why now:** 3rd consecutive cycle flagged as shovel-ready and not picked up (June 11, 15, 18). Purely client-side, no backend changes, directly addresses PRD's "30-second confident choice" promise. This is now the single longest-unpicked-up item in Tier 1 despite consistently being scoped as trivial — worth prioritizing this cycle specifically to break that pattern.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "In `src/pages/Scanner.tsx`, replace the single static 'Analyzing wine list...' label (around line 255, where `analyzing` is true) with a rotating sequence of staged messages driven by a `useEffect`/`setInterval` timer (no need to track real backend progress — `analyze-wine` doesn't stream): e.g. 'Reading the wine list...' (0-5s), 'Scoring matches against your taste profile...' (5-12s), 'Researching your top picks...' (12-22s), 'Finalizing recommendations...' (22s+). Reset the timer/stage to 0 when `analyzing` becomes true and clear the interval on unmount or when `analyzing` becomes false. Keep the existing `Loader2` spinner. No changes to `useScannerLogic.ts` or the edge function."

---

### Scan history CSV export — OPEN
- **What:** Wine enthusiasts using Somm as a personal wine journal want to extract their history for personal records, wine club meetings, or import into another tool. CSV export is implementable entirely client-side from already-fetched session data — no backend changes required. Confirmed June 18: no `exportToCsv` utility or export button exists yet.
- **Why now:** Carried from prior assessments (7th consecutive cycle); remains the most-requested type of feature for power users. Pairs well with the staged-progress item above as two independent, low-risk client-only PRs.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "Add scan history CSV export to Somm. Create `src/utils/exportHistory.ts` with an `exportToCsv(sessions: ScanSession[]): void` function that converts scan sessions into CSV rows with columns: Date, Context, Notes, Wine Name, Producer, Vintage, Type, Region, Match Score, Chosen (yes/no from `chosen_wine_name`). Generate the CSV string and trigger a download using `URL.createObjectURL(new Blob([csvString], { type: 'text/csv;charset=utf-8;' }))`. Set filename to `somm-scan-history-YYYY-MM-DD.csv`. Add an 'Export CSV' button (download icon, `lucide-react`) to the scan history page header in `Dashboard.tsx`. Disable with tooltip when no sessions exist."

---

### Redundant `auth.getUser()` call in analyze-wine quota check — OPEN _(new finding)_
- **What:** PR #20's quota-check block introduced a second `supabaseAdmin.auth.getUser(token)` call (line 311) to resolve the same user ID that `supabaseClient.auth.getUser()` already resolved earlier in the function (line 251). This is a small but real extra network round-trip to Supabase Auth on every single scan request, including ones that aren't even shared-key (the redundant call appears to run before the `useSharedKey` branch is checked).
- **Why now:** Introduced by the very feature (PR #20) that just merged this cycle — catching it now, while the change is fresh and small, is cheaper than letting it sit. It's a latency tax on every scan, not just shared-key ones, which cuts against the "30-second confident choice" goal the staged-progress item above is also trying to protect.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "In `supabase/functions/analyze-wine/index.ts`, remove the redundant `supabaseAdmin.auth.getUser(token)` call inside the quota-check block (around line 311) and reuse the `user.user.id` already resolved from the earlier `supabaseClient.auth.getUser()` call (around line 251). Confirm the quota check still only runs for `useSharedKey === true` requests, and that unauthenticated/non-shared-key requests see no behavior change. Verify with `npx vitest run` and a manual shared-key scan to confirm the 429 path still works at the 10-scan threshold."

---

## Tier 2 — Next Sprint

### Test coverage gaps on critical paths — OPEN _(new finding)_
- **What:** Coverage is thin and concentrated on a few pages. Only 3 of 13 `src/pages` have tests (`Scanner`, `Preferences`, `Dashboard`); zero tests exist for any of the 4 hooks (`usePreferences`, `useScannerLogic`, `useScans`, `useTasteCalibration`), zero for either service module (`scanService`, `tasteService`), and zero for the `analyze-wine`/`analyze-anchor-wine` edge functions despite that being the core product logic per CLAUDE.md. Notably, `scanService.ts`'s new error-mapping logic from PR #20 (429 → `DAILY_LIMIT_REACHED` sentinel, lines 86-97) shipped with no test covering it.
- **Why now:** The repo has Vitest configured and a test convention already established (`__tests__/` folders, `src/test/setup.ts`), so this isn't a tooling gap — it's an adoption gap. The analyze-wine pipeline and the services/hooks wrapping it are the highest-cost-of-bug-surface area in the app (real OpenAI/Tavily spend per request); a regression in quota logic or scoring/matching would be expensive and silent without tests. Good opportunistic moment given PR #20 just touched this exact surface area.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Add Vitest coverage for the highest-risk untested logic in Somm, prioritized in this order: (1) `src/services/scanService.ts` — test `analyzeWine`'s error handling, specifically the 429 → `DAILY_LIMIT_REACHED` sentinel mapping added in PR #20, and the normal success/generic-error paths; (2) `src/hooks/useScannerLogic.ts` — test the orchestration between `analyzeWine` and session save, including the daily-limit error surfacing to `Scanner.tsx`; (3) `src/hooks/usePreferences.ts` — test the optimistic update + 5-minute staleTime caching behavior. Follow existing conventions in `src/test/setup.ts` and `src/test/utils.tsx`. Do not attempt to test the Deno edge function directly in this pass (different runtime) — scope this PR to the `src/` Vitest surface only. Target: all three files have a `__tests__` companion with at least the cases above; `npx vitest run` passes."

---

### Preferences.tsx modularization (23 KB) — OPEN
- **What:** `src/pages/Preferences.tsx` at 552 lines (confirmed June 18, unchanged) manages four distinct user preference domains — taste spectrum sliders, grape varietal toggles, budget range settings, and food pairing preferences — in a single scrolling form. `PreferencesRefactor.test.tsx` already exists in `src/pages/__tests__/` suggesting this work was anticipated.
- **Why now:** This is the most-edited settings component; any future change to taste preferences touches this entire file. Now the **7th consecutive assessment** this item has appeared unchanged. It remains the **last remaining gate** for Wine Circles (Tier 3) — Cellar search and Settings.tsx shared-key UX, the other two original gates, are both done.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Refactor `src/pages/Preferences.tsx` in Somm without changing any visible behavior or styling. Extract: (1) `src/components/preferences/TasteSpectrumSection.tsx` — the spectrum sliders (body, sweetness, tannins, acidity, earthiness); (2) `src/components/preferences/VarietalTogglesSection.tsx` — grape varietal include/exclude toggles; (3) `src/components/preferences/BudgetRangeSection.tsx` — per-context (restaurant/store) budget min/max inputs; (4) `src/components/preferences/FoodPairingSection.tsx` — food type preference toggles. Each component should accept the relevant slice of the preferences object as props and call an `onChange(partial)` callback. `Preferences.tsx` should become a thin orchestrator under 200 lines. Run `npx vitest run` and `npx tsc --noEmit` to confirm no regressions, paying particular attention to `PreferencesRefactor.test.tsx` which appears to anticipate this exact change."

---

### Scan history pagination — OPEN
- **What:** `scanService.getSessions()` (`src/services/scanService.ts`, lines 8-17) still fetches **all** of a user's `scan_sessions` rows in one query, with no `.limit()`/`.range()`, including the full `wines_detected` and `recommendations` JSON blobs for every session ever created. Confirmed unchanged June 18.
- **Why now:** PRD's success metric explicitly targets ">3 scans per user per month" and "return usage" — meaning over a year an active user accumulates 36+ sessions, each carrying potentially dozens of recommendation objects with `reasoning`/`tasting_notes`/`food_pairings` text. This degrades steadily for the most engaged users — exactly the users PRD cares most about retaining. Catching it now (before CSV export and Revisit add more reasons to view long history) is cheaper than retrofitting later.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "In `src/services/scanService.ts`, change `getSessions(userId: string)` to accept pagination params (e.g. `getSessions(userId: string, page = 0, pageSize = 20)`) and apply `.range(page * pageSize, page * pageSize + pageSize - 1)`. Also consider trimming the default column selection for list views (the full `wines_detected`/`recommendations` JSON may not be needed until a session is opened). Update the corresponding React Query hook in `src/hooks/useScans.ts` to support `useInfiniteQuery` or a page-based query key. Update `Dashboard.tsx`'s scan history list to add a 'Load more' button or infinite-scroll trigger. Preserve existing search/filter behavior — note that client-side search/filter over a paginated list means either (a) search triggers a separate unpaginated query, or (b) search is server-side via `.ilike()` on `notes`/`summary`. Pick (a) for a minimal first pass and document the tradeoff. Verify with `npx vitest run` (touches `Dashboard.test.tsx`)."

---

### Double image-upload cost in analyze-wine pipeline — OPEN _(escalated from Tier 3)_
- **What:** `supabase/functions/analyze-wine/index.ts` still sends the **same image twice** to GPT-4o vision at `detail: "high"` (the most expensive image tier) — once in STEP 1a (OCR extraction, now line 404) and again in STEP 3 (final RAG recommendation call, now line 618), where it's used partly to re-derive `wines_detected`. Both `rawWines` (STEP 1a) and `candidates` (scored/ranked in STEP 2) already contain the full wine list with names/vintages/prices. Confirmed unchanged June 18.
- **Why now:** **Escalated from Tier 3 to Tier 2.** This item has appeared at Tier 3 for 3 consecutive cycles (June 11, 15, 18) without movement, which per the staleness rule means it must either move or be dropped. Escalating rather than dropping because it remains directly actionable and is now more urgent: the daily-quota guardrail (PR #20) caps the *number* of shared-key scans, but does nothing about the *cost per scan* — this is the complementary lever, and with the quota now live, per-scan cost is the next-most-direct way to control shared-key spend. Still requires a quality-comparison pass before/after; scope that investigation explicitly as part of the Tier 2 work rather than leaving it open-ended.
- **Effort estimate:** L (requires an A/B-style quality comparison of recommendations with vs. without the second image attachment, across varying list lengths/qualities, before committing to a change in a cost-sensitive path)
- **Actual effort:** —
- **Agent prompt:** "In `supabase/functions/analyze-wine/index.ts`, investigate whether STEP 3's final RAG call (around line 600-620) needs to re-attach the full image at `detail: 'high'`. Try two variants: (a) omit the image from STEP 3 entirely, deriving `wines_detected` from `candidates` (already computed in STEP 2, has name/vintage/price/scores) and mapping its shape to match the existing `wines_detected` schema; (b) keep the image but at `detail: 'low'`. For both variants, run several real wine-list photos (varying quality/length) through both the current and modified pipeline and compare `recommendations` quality (accuracy of `structure`, `tasting_notes`, `reasoning` specificity) side by side. Document token usage before/after via the OpenAI response `usage` field. Only merge if quality holds — otherwise document findings and close as 'investigated, not viable' rather than leaving it open indefinitely. This was escalated from Tier 3 after 3 stale cycles; if quality doesn't hold and no viable variant emerges, close it definitively (don't return it to the backlog at the same scope)."

---

## Tier 3 — Strategic

### Wine Circles — Group Scanning — OPEN
- **What:** The PRD's Phase 4 vision: one person photographs a wine list and all group members simultaneously receive personalized recommendations tailored to their individual taste profiles from the same list. No major wine app offers this mechanic. Transforms Somm from a solo tool into a dinner-party and wine-club companion.
- **Why now:** Foundational differentiator for growth beyond solo users; natural referral mechanic. Scope is well-defined in PRD Phase 4. Of the three original gating items (Cellar search, Settings.tsx shared-key UX, Preferences.tsx modularization), two are done. Only Preferences.tsx modularization (Tier 2, above) remains as a gate. Staying at Tier 3 is appropriate while that gate is open; if it's picked up next sprint, Wine Circles should move to Tier 2 at the next assessment.
- **Effort estimate:** L
- **Actual effort:** —
- **Agent prompt:** "Design and implement Wine Circles Phase 1 for Somm. Create Supabase tables: `wine_circles(id uuid, name text, created_by uuid, invite_code text unique, created_at timestamptz)` and `circle_members(circle_id uuid, user_id uuid, joined_at timestamptz)`. Create a `/circles` page with: (1) 'Create Circle' form generating a unique 6-character alphanumeric invite code; (2) 'Join Circle' form accepting an invite code; (3) list of the current user's circles with member count and share-code button. When a scan completes, add a 'Share with Circle' option that inserts a `shared_scans(scan_session_id, circle_id, shared_by uuid, shared_at timestamptz)` record. Circle members can view shared scans with a 'Shared by [name]' badge. Do not implement real-time in this phase — sharing is asynchronous."

---

### "Revisit" / re-run a past scan — OPEN
- **What:** PRD Phase 3 ("Scan History Enhancements") calls for a "Revisit" button to re-run a past scan with updated preferences. Confirmed June 18: no `Revisit`/`re-run`/`reRun`/`revisited_from` references anywhere in `src/`. The underlying data is already available — `scan_sessions` stores the original detected wines and `debug_info` (with `allWinesFound`/`researchedWines`).
- **Why now:** Natural complement to the closed "I Chose This" feedback loop — lets users see how their *evolving* taste profile would re-rank a list they've already scanned, demonstrating PRD Goal #2's "flywheel of improving accuracy." Kept at Tier 3 (rather than Tier 2 where it sat previously) this cycle because it's now competing directly with the cost-reduction item above for the same pipeline code path (STEP 3's image handling) — sequencing the double-image-cost investigation first avoids two simultaneous changes to the same RAG call.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Add a 'Revisit' action to `ScanDetail.tsx` and the scan history list in `Dashboard.tsx`. When clicked, call a new edge function path (or extend `analyze-wine` with a `revisitSessionId` parameter) that skips OCR (STEP 1a) and re-runs scoring (STEP 1b) and research+recommend (STEPS 2-3) using the `allWinesFound` candidates already stored in `scan_sessions.debug_info`, against the user's *current* `user_preferences` and `wine_memories`. Persist the result as a new `scan_sessions` row with a `revisited_from` foreign key pointing at the original session (new migration required). Show a small badge ('Re-scanned from [date]') on revisited sessions in the history list. If `debug_info.allWinesFound` is missing for older sessions, disable the Revisit button with a tooltip explaining the original scan didn't store enough data."

---

### "Why not this wine?" explanations — OPEN
- **What:** PRD Phase 3 calls for "'Why not this wine?' explanations for wines that were detected but not recommended." `ScanDetail.tsx` already has an "All Wines Detected" section (~line 217) visible to all users, and an **admin-only** debug section (lines 248-330, gated by `isAdmin && session.debug_info`) rendering per-wine `profile_match_score`/`quality_score`/research status. So the scoring data and "why" signal already exist — just not surfaced to regular users as explanations.
- **Why now:** The remaining gap is "take the admin debug table's per-wine score/status data and reframe it as a consumer-facing 'Why not this one?' affordance," not building new data plumbing. Supports PRD Goal #2 (taste intelligence flywheel) by making the AI's reasoning legible to all users. Still gated on `debug_info` presence (absent on older sessions).
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "In `ScanDetail.tsx`, extend the existing 'All Wines Detected' section (~line 217) so that for wines NOT present in `recommendations`, each row gets an expandable 'Why not this one?' affordance — available to all users, not just admins. If `session.debug_info?.allWinesFound` contains `profile_match_score`/`quality_score` for that wine (cross-reference by name, same approach as the existing admin table around lines 311-313), render a short templated explanation referencing the lower-scoring dimension (e.g., 'Scored lower on profile match — may be outside your preferred body/tannin range' vs. 'Scored well overall but didn't make the top picks for this list'). If no score data exists, show a generic 'Not in your top picks for this list' message. The existing admin-only debug section can remain as-is for power-user/debugging detail."

---

## Dropped / Stale

| Item | Reason |
|------|--------|
| **Restaurant Partnership Integration** | Primarily a business development task — technical foundation has no value without active restaurant partners. Dropped June 5 assessment; revisit when go-to-market outreach begins. |
| **Offline Cellar Browsing (PWA)** | Dropped June 5 assessment — natural half-day follow-on to the Cellar work. No value tracking as a standalone item. |

---

## Notes for next assessment

- **Verify GitHub PR state via `pull_request_read`, not just `list_pull_requests`.** This cycle, `list_pull_requests` returned `merged: false` for PR #20 despite a populated `merged_at` timestamp — a stale/inconsistent flag in the list response. `pull_request_read` (method: `get`) correctly reported `merged: true`. Cross-checking against `git log origin/main` confirmed the migration and code are live. Future cycles should treat `list_pull_requests`'s `merged` boolean as unreliable and confirm via `pull_request_read` or git history before marking anything DROPPED/IN PROGRESS based on it.
- **Two cost levers are now explicitly sequenced:** daily quota (shipped, caps volume) and double-image-upload cost (Tier 2, reduces cost per scan) are the same root-cause pair flagged last cycle. With quota live, the per-scan cost lever is the more urgent of the two remaining — hence the Tier 2 escalation this cycle.
- **Test coverage gap is now a tracked item** (new, Tier 2) rather than just a verification caveat — `analyze-wine`'s surface area (cost-bearing, now also quota-bearing) and the services/hooks wrapping it are undertested relative to their blast radius.
- **Sandbox note (recurring):** `node_modules/` has now been absent across 3 consecutive cycles (June 11, 15, 18), preventing `npm run lint`/`typecheck`/`vitest run` verification each time. Recommend either adding `npm install` as a setup step to this routine, or formally scoping live verification out of it.
