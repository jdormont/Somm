# Improvements
_Last assessment: 2026-06-15_
_Last knowledge sync: 2026-06-15_
_Assessment based on: `git fetch origin main` + `git log origin/main` (only 2 commits since the June 11 assessment: PR #17 — the June 11 docs PR itself — and PR #18, the Settings.tsx shared-key UX fix, both merged June 11); full PR history via GitHub MCP (#1-#18, all closed, none merged-but-unmerged — #18 confirmed `merged: true`); open issues (none — `mcp__github__list_issues` returns 0); PRD.md re-read for Phase 3/4 and Success Metrics sections; fresh-eyes code inspection of `src/pages/Settings.tsx` (confirmed PR #18 live on `main` — imports `useAuth`, checks `profile?.use_shared_key` at line 51, renders the read-only "no API key required" card), `src/pages/Scanner.tsx` (line 244, still a single static "Analyzing wine list..." label — staged-progress item unchanged), `src/services/scanService.ts` (`getSessions`, lines 8-17, still no `.range()`/`.limit()` — pagination item unchanged), `src/pages/Preferences.tsx` (552 lines, unchanged), `src/pages/Cellar.tsx` (search confirmed stable, no regressions), `src/pages/ScanDetail.tsx` (full re-read, 330+ lines — **new finding below** re: "All Wines Detected" + admin debug section), `supabase/functions/analyze-wine/index.ts` (confirmed lines 358 & 572 both still send the image at `detail: "high"`), no `exportToCsv`/`Revisit`/`daily_scan_counts` references anywhere in `src/` or `supabase/migrations/`, repo-wide `console.log` grep returns zero matches (still clean)._

**Sandbox note (recurring):** `node_modules/` is again absent in this sandbox (fresh checkout), so `npm run lint`/`typecheck`/`vitest run` could not be executed this cycle — all findings are from direct code inspection only. This has now recurred across multiple cycles; see Notes for next assessment.

---

## Current Sprint
Daily scan quota for shared-key users (Tier 1) — `[IN PROGRESS — PR: #20]`

---

## Recently Completed ✓

| Item | Status | Notes |
|------|--------|-------|
| Settings.tsx shared-key UX (Tier 1) | ✅ DONE — merged: 2026-06-11, PR #18 | `Settings.tsx` now branches on `profile?.use_shared_key` via `useAuth()`. Shared-key users see a read-only confirmation card; everyone else keeps the existing API key form (with an added note). Closes the item that was Current Sprint at the last assessment. Closes the loop on the broader "pooled API key UX" thread that has spanned several cycles (Dashboard.tsx and useScannerLogic.ts handling were already correct; this was the last piece). |
| Cellar text search (Tier 1) | ✅ Done | PR #16, merged June 11. Carried forward for history. |
| Remove debug console.log statements from AuthContext.tsx (Tier 1) | ✅ Done | PR #14, merged June 8. Carried forward for history. |
| Add CLAUDE.md project context file (Tier 1) | ✅ Done | Commit `0f1c581`, June 7. Carried forward for history. |
| Close "I Chose This" feedback loop in analyze-wine (Tier 1) | ✅ Done | PR #11, June 5; deploy confirmed June 7. Carried forward for history. |
| Fix chosenWine stale initialization in ScanDetail | ✅ Done | PR #8, June 5. Carried forward for history. |
| "I Chose This" feedback button (was Tier 1.3) | ✅ Done | PR #5, June 2. Carried forward for history. |
| Scan History Search and Filter (was Tier 1.2) | ✅ Done | PR #5, June 2. Carried forward for history. |
| React Error Boundaries (was Tier 1.1) | ✅ Done | PR #3, June 1. Carried forward for history. |
| CI/CD Pipeline (was Tier 1.4) | ✅ Done | PR #3, June 1. Carried forward for history. |

---

## Tier 1 — Quick Wins

### Staged progress feedback during scan analysis — OPEN
- **What:** `Scanner.tsx` still shows a single static "Analyzing wine list..." spinner (line 244) for the entire duration of the `analyze-wine` call. Per CLAUDE.md, that one request runs 4 sequential/parallel network calls — OCR extraction (GPT-4o vision), scoring (GPT-4o text), Tavily research for the top 8 candidates (parallelized), and the final RAG recommendation call (GPT-4o vision again). For a 60+ wine list this can take 15-30+ seconds with zero feedback differentiation.
- **Why now:** With Settings.tsx now actively telling shared-key users "no API key required," more users are likely to hit the scan flow with fewer setup hurdles — making the wait experience itself the next-most-visible friction point. Purely client-side, no backend/edge function changes. Directly addresses PRD's "30-second confident choice" promise. This is now the most shovel-ready Tier 1 item — it was already fully scoped last cycle and simply wasn't picked up.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "In `src/pages/Scanner.tsx`, replace the single static 'Analyzing wine list...' label (around line 244, where `analyzing` is true) with a rotating sequence of staged messages driven by a `useEffect`/`setInterval` timer (no need to track real backend progress — `analyze-wine` doesn't stream): e.g. 'Reading the wine list...' (0-5s), 'Scoring matches against your taste profile...' (5-12s), 'Researching your top picks...' (12-22s), 'Finalizing recommendations...' (22s+). Reset the timer/stage to 0 when `analyzing` becomes true and clear the interval on unmount or when `analyzing` becomes false. Keep the existing `Loader2` spinner. No changes to `useScannerLogic.ts` or the edge function."

---

### Scan history CSV export — OPEN
- **What:** Wine enthusiasts using Somm as a personal wine journal want to extract their history for personal records, wine club meetings, or import into another tool. CSV export is implementable entirely client-side from already-fetched session data — no backend changes required. Confirmed June 15: no `exportToCsv` utility or export button exists yet.
- **Why now:** Carried from prior assessments (6th consecutive cycle); remains the most-requested type of feature for power users. Relatively contained implementation — a good standalone PR, and a good pairing with the staged-progress item above as two independent, low-risk client-only PRs that could both ship this week.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "Add scan history CSV export to Somm. Create `src/utils/exportHistory.ts` with an `exportToCsv(sessions: ScanSession[]): void` function that converts scan sessions into CSV rows with columns: Date, Context, Notes, Wine Name, Producer, Vintage, Type, Region, Match Score, Chosen (yes/no from `chosen_wine_name`). Generate the CSV string and trigger a download using `URL.createObjectURL(new Blob([csvString], { type: 'text/csv;charset=utf-8;' }))`. Set filename to `somm-scan-history-YYYY-MM-DD.csv`. Add an 'Export CSV' button (download icon, `lucide-react`) to the scan history page header in `Dashboard.tsx`. Disable with tooltip when no sessions exist."

---

### Daily scan quota for shared-key users — OPEN _(escalated from Tier 3)_
- **What:** The edge function correctly resolves `use_shared_key = true` to the server's `OPENAI_API_KEY`, but there is still no per-user daily limit on shared-key usage — confirmed June 15, no `daily_scan_counts` table or equivalent exists in `supabase/migrations/`.
- **Why now:** **Escalated from Tier 3 to Tier 1.** This item appeared at Tier 3 across June 7, 10, and 11 without movement, each time noting it should be bundled with or immediately follow the Settings.tsx shared-key UX work (Tier 1, then in progress as PR #18). PR #18 has now **merged and is live on `main`** — `Settings.tsx` actively tells shared-key users "No API key required... using Somm's shared scanning service." That UX promise is now shipping to production *without* the cost guardrail that was supposed to accompany it. Per PRD's Constraints section, GPT-4 Vision token cost is the explicit reason the admin-approval gate exists; the gap between "we just told users scanning is free" and "there is no per-user cap" is now a live, unbounded-cost risk rather than a theoretical one. This is no longer a strategic/investigative item — it's a guardrail that should have shipped alongside PR #18 and is now overdue.
- **Effort estimate:** M
- **Actual effort:** M
- **Agent prompt:** "In `supabase/functions/analyze-wine/index.ts`, after confirming `useSharedKey = true`, enforce a daily scan quota: upsert a row in a new `daily_scan_counts(user_id uuid, scan_date date, count int, primary key(user_id, scan_date))` table, incrementing `count`. If `count > 10`, return HTTP 429 with JSON `{ error: 'Daily scan limit reached. Resets at midnight UTC.' }`. Create the migration for `daily_scan_counts` with an appropriate RLS policy (users can read their own count; service role writes). Surface the 429 response in `useScannerLogic`/`Scanner.tsx` with a clear user-facing message (e.g., a dismissible banner distinct from the generic error state). Note: requires a redeploy of `analyze-wine` after merge — coordinate with whoever runs `supabase functions deploy analyze-wine`, and verify the deploy actually happened (per the June 7 lesson where PR #11's deploy lagged its merge)."

---

## Tier 2 — Next Sprint

### Preferences.tsx modularization (23 KB) — OPEN
- **What:** `src/pages/Preferences.tsx` at 552 lines (confirmed June 15, unchanged) manages four distinct user preference domains — taste spectrum sliders, grape varietal toggles, budget range settings, and food pairing preferences — in a single scrolling form. `PreferencesRefactor.test.tsx` already exists in `src/pages/__tests__/` suggesting this work was anticipated.
- **Why now:** This is the most-edited settings component; any future change to taste preferences touches this entire file. Now the longest-standing open item in the backlog overall (6th consecutive assessment unchanged). It is also the **last remaining gate** for the Wine Circles item below — of the three original gating items identified at the June 5 escalation (Cellar search, Settings.tsx shared-key UX, Preferences.tsx modularization), two are now done (Cellar search via PR #16, Settings.tsx via PR #18). Picking this up next sprint would clear the path for Wine Circles to move off Tier 3 for the first time.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Refactor `src/pages/Preferences.tsx` in Somm without changing any visible behavior or styling. Extract: (1) `src/components/preferences/TasteSpectrumSection.tsx` — the spectrum sliders (body, sweetness, tannins, acidity, earthiness); (2) `src/components/preferences/VarietalTogglesSection.tsx` — grape varietal include/exclude toggles; (3) `src/components/preferences/BudgetRangeSection.tsx` — per-context (restaurant/store) budget min/max inputs; (4) `src/components/preferences/FoodPairingSection.tsx` — food type preference toggles. Each component should accept the relevant slice of the preferences object as props and call an `onChange(partial)` callback. `Preferences.tsx` should become a thin orchestrator under 200 lines. Run `npx vitest run` and `npx tsc --noEmit` to confirm no regressions, paying particular attention to `PreferencesRefactor.test.tsx` which appears to anticipate this exact change."

---

### Scan history pagination — OPEN
- **What:** `scanService.getSessions()` (`src/services/scanService.ts`, lines 8-17) still fetches **all** of a user's `scan_sessions` rows in one query, with no `.limit()`/`.range()`, including the full `wines_detected` and `recommendations` JSON blobs for every session ever created. Confirmed unchanged June 15.
- **Why now:** PRD's success metric explicitly targets ">3 scans per user per month" and "return usage" — meaning over a year an active user accumulates 36+ sessions, each carrying potentially dozens of recommendation objects with `reasoning`/`tasting_notes`/`food_pairings` text. This is the kind of slow-creeping performance issue that's invisible in testing (few sessions) but degrades steadily for the most engaged users — exactly the users PRD cares most about retaining. Catching it now (before CSV export and Revisit add more reasons to view long history) is cheaper than retrofitting later.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "In `src/services/scanService.ts`, change `getSessions(userId: string)` to accept pagination params (e.g. `getSessions(userId: string, page = 0, pageSize = 20)`) and apply `.range(page * pageSize, page * pageSize + pageSize - 1)`. Update the corresponding React Query hook in `src/hooks/useScans.ts` to support `useInfiniteQuery` or a page-based query key. Update `Dashboard.tsx`'s scan history list to add a 'Load more' button or infinite-scroll trigger. Preserve existing search/filter behavior — note that client-side search/filter over a paginated list means either (a) search triggers a separate unpaginated query, or (b) search is server-side via `.ilike()` on `notes`/`summary`. Pick (a) for a minimal first pass and document the tradeoff. Verify with `npx vitest run` (touches `Dashboard.test.tsx`)."

---

### "Revisit" / re-run a past scan — OPEN
- **What:** PRD Phase 3 ("Scan History Enhancements") calls for a "Revisit" button to re-run a past scan with updated preferences. Confirmed June 15: no `Revisit`/`re-run`/`reRun`/`revisited_from` references anywhere in `src/`. The underlying data is already available — `scan_sessions` stores the original detected wines and `debug_info` (with `allWinesFound`/`researchedWines`), and `analyze-wine` already accepts the `wine_memories`/preferences payload that would have changed since the original scan.
- **Why now:** This is a natural complement to the closed "I Chose This" feedback loop — it lets users see how their *evolving* taste profile (after rating wines, adjusting sliders, or adding taste anchors) would re-rank a list they've already scanned, directly demonstrating the "flywheel of improving accuracy" that PRD Goal #2 promises. Scoped to re-running steps 2 and 3 against already-stored `allWinesFound` candidates rather than re-running OCR, this avoids re-uploading the image and keeps the OpenAI cost roughly in line with a normal scan minus the vision OCR call (though note the Tier 3 double-image-cost finding below: the final RAG call also re-sends the image at "high" detail, so cost savings are partial unless that's also addressed).
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Add a 'Revisit' action to `ScanDetail.tsx` and the scan history list in `Dashboard.tsx`. When clicked, call a new edge function path (or extend `analyze-wine` with a `revisitSessionId` parameter) that skips OCR (STEP 1a) and re-runs scoring (STEP 1b) and research+recommend (STEPS 2-3) using the `allWinesFound` candidates already stored in `scan_sessions.debug_info`, against the user's *current* `user_preferences` and `wine_memories`. Persist the result as a new `scan_sessions` row with a `revisited_from` foreign key pointing at the original session (new migration required). Show a small badge ('Re-scanned from [date]') on revisited sessions in the history list. If `debug_info.allWinesFound` is missing for older sessions (pre-debug-block sessions), disable the Revisit button with a tooltip explaining the original scan didn't store enough data."

---

## Tier 3 — Strategic

### Double image-upload cost in analyze-wine pipeline — OPEN
- **What:** `supabase/functions/analyze-wine/index.ts` still sends the **same image twice** to GPT-4o vision at `detail: "high"` (the most expensive image tier) — once in STEP 1a (OCR extraction, line ~358) and again in STEP 3 (final RAG recommendation call, line ~572), where it's used partly to re-derive `wines_detected`. Both `rawWines` (from STEP 1a) and `candidates` (scored/ranked in STEP 2) already contain the full wine list with names/vintages/prices — `wines_detected` in the STEP 3 output is largely redundant with data the pipeline already has. Confirmed unchanged June 15.
- **Why now:** This is a direct, per-scan cost lever. It's now even more relevant given the **Daily scan quota** item has been escalated to Tier 1 this cycle as a guardrail for shared-key spend — this item is the complementary "reduce the cost per scan" lever (vs. "cap the number of scans"). Both stem from the same root cause (PR #18 shipping the "no API key required" promise without a cost-side counterpart). Still requires a quality-comparison pass before/after, not a blind removal — flagging as Tier 3 (strategic, needs careful before/after evaluation of recommendation quality) rather than Tier 1/2.
- **Effort estimate:** L (requires A/B-style quality comparison of recommendations with vs. without the second image attachment, across a range of list lengths/qualities, before committing to a change in a cost-sensitive path)
- **Agent prompt:** "In `supabase/functions/analyze-wine/index.ts`, investigate whether STEP 3's final RAG call (around line 558-579) needs to re-attach the full image at `detail: 'high'`. Try two variants: (a) omit the image from STEP 3 entirely, deriving `wines_detected` from `candidates` (already computed in STEP 2, has name/vintage/price/scores) and mapping its shape to match the existing `wines_detected` schema; (b) keep the image but at `detail: 'low'`. For both variants, run several real wine-list photos (varying quality/length) through both the current and modified pipeline and compare `recommendations` quality (accuracy of `structure`, `tasting_notes`, `reasoning` specificity) side by side. Document token usage before/after via the OpenAI response `usage` field. Only merge if quality holds — otherwise document findings and close as 'investigated, not viable' rather than leaving it open indefinitely."

---

### Wine Circles — Group Scanning — OPEN
- **What:** The PRD's Phase 4 vision: one person photographs a wine list and all group members simultaneously receive personalized recommendations tailored to their individual taste profiles from the same list. No major wine app offers this mechanic. Transforms Somm from a solo tool into a dinner-party and wine-club companion.
- **Why now:** Foundational differentiator for growth beyond solo users; natural referral mechanic. Scope is well-defined in PRD Phase 4. **Gating status materially improved this cycle**, so this is not a repeat of an unchanged finding: of the three original gating items (Cellar search, Settings.tsx shared-key UX, Preferences.tsx modularization), two are now done — Cellar search (PR #16) and Settings.tsx shared-key UX (PR #18, merged this cycle). Only Preferences.tsx modularization (Tier 2, above) remains as a gate, and it's now explicitly framed as the unlock for this item. Staying at Tier 3 one more cycle is appropriate given 1/3 gates remain, but if Preferences.tsx modularization is picked up next sprint as recommended, Wine Circles should move to Tier 2 at the next assessment.
- **Effort estimate:** L
- **Actual effort:** —
- **Agent prompt:** "Design and implement Wine Circles Phase 1 for Somm. Create Supabase tables: `wine_circles(id uuid, name text, created_by uuid, invite_code text unique, created_at timestamptz)` and `circle_members(circle_id uuid, user_id uuid, joined_at timestamptz)`. Create a `/circles` page with: (1) 'Create Circle' form generating a unique 6-character alphanumeric invite code; (2) 'Join Circle' form accepting an invite code; (3) list of the current user's circles with member count and share-code button. When a scan completes, add a 'Share with Circle' option that inserts a `shared_scans(scan_session_id, circle_id, shared_by uuid, shared_at timestamptz)` record. Circle members can view shared scans with a 'Shared by [name]' badge. Do not implement real-time in this phase — sharing is asynchronous."

---

### "Why not this wine?" explanations — OPEN _(scope refined this cycle)_
- **What:** PRD Phase 3 calls for "'Why not this wine?' explanations for wines that were detected but not recommended." **New finding this cycle:** this is *more built than previously assessed*. `ScanDetail.tsx` already has (a) an "All Wines Detected" section (lines 214-245) visible to **all users**, listing every wine from `session.wines_detected` with name/type/region/price, and (b) an **admin-only** debug section (lines 248-330, gated by `isAdmin && session.debug_info`) that renders `allWinesFound` with `profile_match_score`/`quality_score`/total, and a "Researched" vs. "Skipped" status per wine. So the scoring data and "why" signal already exist and are already partially surfaced — just not to regular users, and not phrased as user-facing explanations.
- **Why now:** The remaining gap is now much smaller than originally scoped: it's "take the admin debug table's per-wine score/status data and reframe it as a consumer-facing 'Why not this one?' affordance on the existing 'All Wines Detected' section," rather than building a new data-surfacing UI from scratch. This directly supports PRD Goal #2 (taste intelligence flywheel) by making the AI's reasoning legible to all users, building trust and potentially surfacing preference mis-calibrations. Still gated on `debug_info` presence (absent on older pre-debug-block sessions), and still needs UX care to avoid overwhelming the primary recommendations view — keeping at Tier 3, but the refined scope should make it cheaper than the L estimate once picked up.
- **Effort estimate:** M (revised down from L — most of the data plumbing and an admin-only precedent already exist; the work is primarily UI reframing + copy + graceful degradation for sessions without `debug_info`)
- **Agent prompt:** "In `ScanDetail.tsx`, extend the existing 'All Wines Detected' section (lines 214-245) so that for wines NOT present in `recommendations`, each row gets an expandable 'Why not this one?' affordance — available to all users, not just admins. If `session.debug_info?.allWinesFound` contains `profile_match_score`/`quality_score` for that wine (cross-reference by name, same approach as the existing admin table at line 311-313), render a short templated explanation referencing the lower-scoring dimension (e.g., 'Scored lower on profile match — may be outside your preferred body/tannin range' vs. 'Scored well overall but didn't make the top picks for this list'). If no score data exists (older sessions, or wines outside the scored set), show a generic 'Not in your top picks for this list' message. The existing admin-only debug section (lines 248-330) can remain as-is for power-user/debugging detail — this is an additive, simpler consumer-facing layer on top of the same data."

---

## Dropped / Stale

| Item | Reason |
|------|--------|
| **Restaurant Partnership Integration** | Primarily a business development task — technical foundation has no value without active restaurant partners. Dropped June 5 assessment; revisit when go-to-market outreach begins. |
| **Offline Cellar Browsing (PWA)** | Dropped June 5 assessment — natural half-day follow-on to the Cellar work. No value tracking as a standalone item. |

---

## Notes for next assessment

- **Process win this cycle:** Settings.tsx shared-key UX (PR #18) was correctly flagged as shovel-ready for 2 consecutive cycles before being picked up and merged in cycle 3 — slower than ideal, but it did land, and its merge is what unlocked both the Tier 1 daily-quota escalation and the Wine Circles gating improvement above. Worth noting that the "process issue" warning flagged at the June 11 assessment did not need to be escalated further.
- **New cost-risk framing:** With PR #18 live, Somm now actively advertises a free shared-scanning path to a subset of users with no usage cap (daily quota, escalated to Tier 1) and a pipeline that double-sends the scan image at the most expensive vision tier (Tier 3 cost item). These two items are now framed as a matched pair — cap usage (Tier 1, fast) and reduce per-scan cost (Tier 3, needs quality validation) — both stemming from the same root cause.
- **Instrumentation gap persists:** Still no open GitHub issues, meaning this backlog is driven entirely by code inspection against the PRD rather than real user feedback. It would sharpen future cycles to have *any* lightweight usage signal — e.g. `chosen_wine_name` fill-rate vs. PRD's >60% target, scan-session volume per user, or actual shared-key scan volume now that PR #18 is live (directly relevant to sizing the new daily-quota item's `count > 10` threshold, which is currently a guess).
- **Sandbox note (recurring):** `node_modules/` has now been absent across at least 2 consecutive cycles (June 11 and June 15), preventing `npm run lint`/`typecheck`/`vitest run` verification both times. If this keeps recurring, the assessment routine should either run `npm install` as a setup step, or this should be explicitly documented as permanently out of scope for this read-mostly routine so it stops being re-flagged each cycle.
