# Improvements
_Last assessment: 2026-06-25_
_Last knowledge sync: 2026-06-25_
_Assessment based on: `git log` on `main` through commit `5e85a2a`; `pull_request_read` (method `get`) on PR #24 confirming `merged:true` (the `list_pull_requests` stale-flag issue noted in prior cycles was not observed this time — `merged_at`/`merged`/`state` were all consistent); `mcp__github__list_issues` (zero open issues); fresh reads of `PRD.md`, `preference_logic.md`, and this file in full before editing; direct code inspection of `src/utils/` (no `exportHistory.ts`/CSV export exists), `src/pages/Preferences.tsx` (552 lines, unchanged), `src/services/scanService.ts` (`getSessions` still has no `.range()`/`.limit()`), `supabase/functions/analyze-wine/index.ts` (image still attached at `detail: "high"` twice, lines 403 and 617), `src/pages/ScanDetail.tsx` (no `Revisit`/`reRun`/`revisited_from`; admin-only debug section at line 248 still gates the scoring data from regular users), and a repo-wide test count (still 5 test files, no hook/service/edge-function tests)._

## Current Sprint
None — ready for next implementation run.

## Recently Completed ✓

| Item | Status | Notes |
|------|--------|-------|
| Staged progress feedback during scan analysis (Tier 1) | ✅ DONE — merged: 2026-06-23, PR #24 | `Scanner.tsx` now rotates through "Reading the wine list...", "Scoring matches against your taste profile...", "Researching your top picks...", "Finalizing recommendations..." on a timer matched to the actual pipeline phases (0s/5s/12s/22s), replacing the single static "Analyzing wine list..." label. Purely client-side; confirmed merged via `pull_request_read` (`merged: true`). |
| Redundant `auth.getUser()` call in analyze-wine quota check (Tier 1) | ✅ DONE — merged: 2026-06-18, PR #22 | Carried forward for history. |
| Daily scan quota for shared-key users (Tier 1) | ✅ DONE — merged: 2026-06-16, PR #20 | Carried forward for history. |
| Settings.tsx shared-key UX (Tier 1) | ✅ Done | PR #18, merged 2026-06-11. Carried forward for history. |
| Cellar text search (Tier 1) | ✅ Done | PR #16, merged June 11. Carried forward for history. |

---

## Tier 1 — Quick Wins

### Scan history CSV export — OPEN
- **What:** Wine enthusiasts using Somm as a personal wine journal want to extract their history for personal records, wine club meetings, or import into another tool. CSV export is implementable entirely client-side from already-fetched session data — no backend changes required. Confirmed June 25: still no `exportToCsv`/`exportHistory` utility or export button anywhere in `src/`.
- **Why now:** Carried from prior assessments; remains the most-requested type of feature for power users and is the most shovel-ready item in the backlog (zero backend dependency, zero risk to the cost-sensitive AI pipeline).
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "Add scan history CSV export to Somm. Create `src/utils/exportHistory.ts` with an `exportToCsv(sessions: ScanSession[]): void` function that converts scan sessions into CSV rows with columns: Date, Context, Notes, Wine Name, Producer, Vintage, Type, Region, Match Score, Chosen (yes/no from `chosen_wine_name`). Generate the CSV string and trigger a download using `URL.createObjectURL(new Blob([csvString], { type: 'text/csv;charset=utf-8;' }))`. Set filename to `somm-scan-history-YYYY-MM-DD.csv`. Add an 'Export CSV' button (download icon, `lucide-react`) to the scan history page header in `Dashboard.tsx`. Disable with tooltip when no sessions exist."

---

## Tier 2 — Next Sprint

### Test coverage gaps on critical paths — OPEN
- **What:** Coverage is thin and concentrated on a few pages. Only 3 of 13 `src/pages` have tests (`Scanner`, `Preferences`, `Dashboard`); zero tests exist for any of the 4 hooks (`usePreferences`, `useScannerLogic`, `useScans`, `useTasteCalibration`), zero for either service module (`scanService`, `tasteService`), and zero for the `analyze-wine`/`analyze-anchor-wine` edge functions despite that being the core product logic per CLAUDE.md. `scanService.ts`'s error-mapping logic from PR #20 (429 → `DAILY_LIMIT_REACHED` sentinel) still has no test covering it. Confirmed unchanged June 25 — still exactly 5 test files.
- **Why now:** The repo has Vitest configured and a test convention already established (`__tests__/` folders, `src/test/setup.ts`), so this isn't a tooling gap — it's an adoption gap. The analyze-wine pipeline and the services/hooks wrapping it are the highest-cost-of-bug-surface area in the app (real OpenAI/Tavily spend per request); a regression in quota logic or scoring/matching would be expensive and silent without tests.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Add Vitest coverage for the highest-risk untested logic in Somm, prioritized in this order: (1) `src/services/scanService.ts` — test `analyzeWine`'s error handling, specifically the 429 → `DAILY_LIMIT_REACHED` sentinel mapping added in PR #20, and the normal success/generic-error paths; (2) `src/hooks/useScannerLogic.ts` — test the orchestration between `analyzeWine` and session save, including the daily-limit error surfacing to `Scanner.tsx`; (3) `src/hooks/usePreferences.ts` — test the optimistic update + 5-minute staleTime caching behavior. Follow existing conventions in `src/test/setup.ts` and `src/test/utils.tsx`. Do not attempt to test the Deno edge function directly in this pass (different runtime) — scope this PR to the `src/` Vitest surface only. Target: all three files have a `__tests__` companion with at least the cases above; `npx vitest run` passes."

---

### Preferences.tsx modularization (23 KB) — OPEN
- **What:** `src/pages/Preferences.tsx` at 552 lines (confirmed June 25, unchanged) manages four distinct user preference domains — taste spectrum sliders, grape varietal toggles, budget range settings, and food pairing preferences — in a single scrolling form. `PreferencesRefactor.test.tsx` already exists in `src/pages/__tests__/` suggesting this work was anticipated.
- **Why now:** This is the most-edited settings component; any future change to taste preferences touches this entire file. It remains the **last remaining gate** for Wine Circles (Tier 3) — Cellar search and Settings.tsx shared-key UX, the other two original gates, are both done.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Refactor `src/pages/Preferences.tsx` in Somm without changing any visible behavior or styling. Extract: (1) `src/components/preferences/TasteSpectrumSection.tsx` — the spectrum sliders (body, sweetness, tannins, acidity, earthiness); (2) `src/components/preferences/VarietalTogglesSection.tsx` — grape varietal include/exclude toggles; (3) `src/components/preferences/BudgetRangeSection.tsx` — per-context (restaurant/store) budget min/max inputs; (4) `src/components/preferences/FoodPairingSection.tsx` — food type preference toggles. Each component should accept the relevant slice of the preferences object as props and call an `onChange(partial)` callback. `Preferences.tsx` should become a thin orchestrator under 200 lines. Run `npx vitest run` and `npx tsc --noEmit` to confirm no regressions, paying particular attention to `PreferencesRefactor.test.tsx` which appears to anticipate this exact change."

---

### Scan history pagination — OPEN
- **What:** `scanService.getSessions()` (`src/services/scanService.ts`, line 8) still fetches **all** of a user's `scan_sessions` rows in one query, with no `.limit()`/`.range()`, including the full `wines_detected` and `recommendations` JSON blobs for every session ever created. Confirmed unchanged June 25.
- **Why now:** PRD's success metric explicitly targets ">3 scans per user per month" and "return usage" — meaning over a year an active user accumulates 36+ sessions, each carrying potentially dozens of recommendation objects with `reasoning`/`tasting_notes`/`food_pairings` text. This degrades steadily for the most engaged users — exactly the users PRD cares most about retaining.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "In `src/services/scanService.ts`, change `getSessions(userId: string)` to accept pagination params (e.g. `getSessions(userId: string, page = 0, pageSize = 20)`) and apply `.range(page * pageSize, page * pageSize + pageSize - 1)`. Also consider trimming the default column selection for list views (the full `wines_detected`/`recommendations` JSON may not be needed until a session is opened). Update the corresponding React Query hook in `src/hooks/useScans.ts` to support `useInfiniteQuery` or a page-based query key. Update `Dashboard.tsx`'s scan history list to add a 'Load more' button or infinite-scroll trigger. Preserve existing search/filter behavior — note that client-side search/filter over a paginated list means either (a) search triggers a separate unpaginated query, or (b) search is server-side via `.ilike()` on `notes`/`summary`. Pick (a) for a minimal first pass and document the tradeoff. Verify with `npx vitest run` (touches `Dashboard.test.tsx`)."

---

### Double image-upload cost in analyze-wine pipeline — OPEN
- **What:** `supabase/functions/analyze-wine/index.ts` still sends the **same image twice** to GPT-4o vision at `detail: "high"` (the most expensive image tier) — once in STEP 1a (OCR extraction, line 403) and again in STEP 3 (final RAG recommendation call, line 617), where it's used partly to re-derive `wines_detected`. Both `rawWines` (STEP 1a) and `candidates` (scored/ranked in STEP 2) already contain the full wine list with names/vintages/prices. Confirmed unchanged June 25.
- **Why now:** With the daily-scan quota (PR #20) live, this is the complementary lever for shared-key cost: quota caps *volume*, this would cap *cost per scan*. Requires a quality-comparison pass before/after; scope that investigation explicitly as part of the Tier 2 work rather than leaving it open-ended.
- **Effort estimate:** L (requires an A/B-style quality comparison of recommendations with vs. without the second image attachment, across varying list lengths/qualities, before committing to a change in a cost-sensitive path)
- **Actual effort:** —
- **Agent prompt:** "In `supabase/functions/analyze-wine/index.ts`, investigate whether STEP 3's final RAG call (around line 600-620) needs to re-attach the full image at `detail: 'high'`. Try two variants: (a) omit the image from STEP 3 entirely, deriving `wines_detected` from `candidates` (already computed in STEP 2, has name/vintage/price/scores) and mapping its shape to match the existing `wines_detected` schema; (b) keep the image but at `detail: 'low'`. For both variants, run several real wine-list photos (varying quality/length) through both the current and modified pipeline and compare `recommendations` quality (accuracy of `structure`, `tasting_notes`, `reasoning` specificity) side by side. Document token usage before/after via the OpenAI response `usage` field. Only merge if quality holds — otherwise document findings and close as 'investigated, not viable' rather than leaving it open indefinitely."

---

## Tier 3 — Strategic

### Wine Circles — Group Scanning — OPEN
- **What:** The PRD's Phase 4 vision: one person photographs a wine list and all group members simultaneously receive personalized recommendations tailored to their individual taste profiles from the same list. No major wine app offers this mechanic. Transforms Somm from a solo tool into a dinner-party and wine-club companion.
- **Why now:** Foundational differentiator for growth beyond solo users; natural referral mechanic. Scope is well-defined in PRD Phase 4. Of the three original gating items (Cellar search, Settings.tsx shared-key UX, Preferences.tsx modularization), two are done. Only Preferences.tsx modularization (Tier 2, above) remains as a gate — kept at Tier 3 rather than escalated/dropped because it is genuinely blocked on that prerequisite, not neglected.
- **Effort estimate:** L
- **Actual effort:** —
- **Agent prompt:** "Design and implement Wine Circles Phase 1 for Somm. Create Supabase tables: `wine_circles(id uuid, name text, created_by uuid, invite_code text unique, created_at timestamptz)` and `circle_members(circle_id uuid, user_id uuid, joined_at timestamptz)`. Create a `/circles` page with: (1) 'Create Circle' form generating a unique 6-character alphanumeric invite code; (2) 'Join Circle' form accepting an invite code; (3) list of the current user's circles with member count and share-code button. When a scan completes, add a 'Share with Circle' option that inserts a `shared_scans(scan_session_id, circle_id, shared_by uuid, shared_at timestamptz)` record. Circle members can view shared scans with a 'Shared by [name]' badge. Do not implement real-time in this phase — sharing is asynchronous."

---

### "Revisit" / re-run a past scan — OPEN
- **What:** PRD Phase 3 ("Scan History Enhancements") calls for a "Revisit" button to re-run a past scan with updated preferences. Confirmed June 25: no `Revisit`/`re-run`/`reRun`/`revisited_from` references anywhere in `src/`. The underlying data is already available — `scan_sessions` stores the original detected wines and `debug_info` (with `allWinesFound`/`researchedWines`).
- **Why now:** Natural complement to the closed "I Chose This" feedback loop — lets users see how their *evolving* taste profile would re-rank a list they've already scanned, demonstrating PRD Goal #2's "flywheel of improving accuracy." Kept at Tier 3 because it's competing for the same pipeline code path (STEP 3's image handling) as the double-image-cost item — sequencing that investigation first avoids two simultaneous changes to the same RAG call.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Add a 'Revisit' action to `ScanDetail.tsx` and the scan history list in `Dashboard.tsx`. When clicked, call a new edge function path (or extend `analyze-wine` with a `revisitSessionId` parameter) that skips OCR (STEP 1a) and re-runs scoring (STEP 1b) and research+recommend (STEPS 2-3) using the `allWinesFound` candidates already stored in `scan_sessions.debug_info`, against the user's *current* `user_preferences` and `wine_memories`. Persist the result as a new `scan_sessions` row with a `revisited_from` foreign key pointing at the original session (new migration required). Show a small badge ('Re-scanned from [date]') on revisited sessions in the history list. If `debug_info.allWinesFound` is missing for older sessions, disable the Revisit button with a tooltip explaining the original scan didn't store enough data."

---

### "Why not this wine?" explanations — OPEN
- **What:** PRD Phase 3 calls for "'Why not this wine?' explanations for wines that were detected but not recommended." `ScanDetail.tsx` already has an "All Wines Detected" section (line 217) visible to all users, and an **admin-only** debug section gated by `isAdmin && session.debug_info` (line 248) rendering per-wine `profile_match_score`/`quality_score`/research status. So the scoring data and "why" signal already exist — just not surfaced to regular users as explanations.
- **Why now:** The remaining gap is "take the admin debug table's per-wine score/status data and reframe it as a consumer-facing 'Why not this one?' affordance," not building new data plumbing. Supports PRD Goal #2 (taste intelligence flywheel) by making the AI's reasoning legible to all users. Still gated on `debug_info` presence (absent on older sessions).
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "In `ScanDetail.tsx`, extend the existing 'All Wines Detected' section (line 217) so that for wines NOT present in `recommendations`, each row gets an expandable 'Why not this one?' affordance — available to all users, not just admins. If `session.debug_info?.allWinesFound` contains `profile_match_score`/`quality_score` for that wine (cross-reference by name, same approach as the existing admin table), render a short templated explanation referencing the lower-scoring dimension (e.g., 'Scored lower on profile match — may be outside your preferred body/tannin range' vs. 'Scored well overall but didn't make the top picks for this list'). If no score data exists, show a generic 'Not in your top picks for this list' message. The existing admin-only debug section can remain as-is for power-user/debugging detail."

---

## Dropped / Stale

| Item | Reason |
|------|--------|
| **Restaurant Partnership Integration** | Primarily a business development task — technical foundation has no value without active restaurant partners. Dropped June 5 assessment; revisit when go-to-market outreach begins. |
| **Offline Cellar Browsing (PWA)** | Dropped June 5 assessment — natural half-day follow-on to the Cellar work. No value tracking as a standalone item. |

---

## Notes for next assessment

- **Verify GitHub PR state via `pull_request_read`, not just `list_pull_requests`.** Past cycles found `list_pull_requests` returning a stale `merged: false` flag despite a populated `merged_at` timestamp. This cycle (June 25), `pull_request_read` on PR #24 returned a fully consistent `state: closed` / `merged: true` / populated `merged_at` — the discrepancy may have been transient/proxy-related rather than a persistent API quirk, but keep cross-checking against `git log origin/main` regardless.
- **No open PRs, no open GitHub issues this cycle.** The backlog continues to be driven entirely by code inspection against `PRD.md`/`preference_logic.md` rather than user feedback — consider adding lightweight in-app feedback capture (even a simple "got a sec? tell us what's missing" link) if the issue tracker stays empty for several more cycles, since GitHub issues are currently a non-signal as a feedback proxy.
- **Two cost levers for shared-key scans are sequenced:** daily quota (shipped, caps volume) and double-image-upload cost (Tier 2, reduces cost per scan) are the same root-cause pair. With quota live, the per-scan cost lever is the more urgent of the two remaining.
- **Test coverage gap is a tracked Tier 2 item** — `analyze-wine`'s surface area (cost-bearing, quota-bearing) and the services/hooks wrapping it are undertested relative to their blast radius.
- **No Tier 3 item was dropped this cycle for staleness.** Wine Circles, Revisit, and "Why not this wine?" have each appeared in 3+ consecutive cycles, but all three remain legitimately sequenced (Wine Circles is gated on Preferences.tsx modularization; Revisit and the double-image-cost item intentionally share a code path and are sequenced rather than parallelized) — this is a structural backlog dependency, not neglect, so none were escalated or dropped this cycle.
