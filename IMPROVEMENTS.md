# Improvements
_Last assessment: 2026-06-10_
_Last knowledge sync: 2026-06-10_
_Assessment based on: git log (commits since June 7), PR #14 (merged June 8 — AuthContext console.log cleanup, closes the prior Current Sprint item), full PR history (#1-#14, all closed/merged, no new open PRs), open issues (none), fresh-eyes code inspection of AuthContext.tsx (confirmed clean — `grep -rn "console\.log" src/` returns zero matches, only appropriate `console.error` remains), Cellar.tsx (still 268 lines, still no `searchQuery`), Settings.tsx (confirmed `use_shared_key` still unhandled — `grep` for `use_shared_key`/`shared` returns nothing), Dashboard.tsx (confirmed `hasApiKey` already correctly checks `profile?.use_shared_key` — line 55 — so part 2 of the prior pooled-key agent prompt is already done, only the Settings.tsx UI piece remains), Preferences.tsx (552 lines, unchanged, `PreferencesRefactor.test.tsx` still present and unused for its intended purpose), analyze-wine edge function (615 lines, `chosenWineNames`/`buildChosenWineSignal` confirmed present and live since June 7), PRD.md and preference_logic.md (re-read in full for Phase 3/4 status), Knowledge.tsx + WineKnowledgeModal.tsx + WineTermLink.tsx (confirmed: PRD Phase 3 "Wine Knowledge" — tap a term for an educational card — is already implemented, with a dedicated `/knowledge` nav entry; not previously tracked in this backlog)._

---

## Current Sprint
None — Cellar text search (Tier 1) implemented on branch `claude/vibrant-allen-jqi1y2`, ready for review.

---

## Recently Completed ✓

| Item | Status | Notes |
|------|--------|-------|
| Remove debug console.log statements from AuthContext.tsx (Tier 1) | ✅ DONE — merged: 2026-06-08, PR #14 | All three debug `console.log` calls (profile data incl. role/approval/`use_shared_key`, raw user UUIDs, and the versioned debug breadcrumb) removed via plain deletion, no conditional wrapper added. Verified `grep -rn "console\.log" src/` now returns zero matches; only the pre-existing, appropriate `console.error('Error loading profile:', ...)` remains. Effort matched estimate (S, ~10 min). Closes the item that was `[IN PROGRESS]` at the last assessment. |
| Add CLAUDE.md project context file (Tier 1) | ✅ Done | Commit `0f1c581`, June 7, 2026 — landed on `main` after 7 consecutive assessments flagging it. Carried forward from prior assessment for history. |
| Verify/run analyze-wine deploy for the feedback-loop fix (Tier 1) | ✅ Done — deploy confirmed 2026-06-07 | `[CHOSEN_WINE_HISTORY]` injection from `chosenWineNames` confirmed live in production. Carried forward from prior assessment for history. |
| Close "I Chose This" feedback loop in analyze-wine (Tier 1) | ✅ Done | PR #11, June 5, 2026. Carried forward for history. |
| Fix chosenWine stale initialization in ScanDetail | ✅ Done | PR #8, June 5, 2026. Carried forward for history. |
| "I Chose This" feedback button (was Tier 1.3) | ✅ Done | PR #5, June 2, 2026. Carried forward for history. |
| Scan History Search and Filter (was Tier 1.2) | ✅ Done | PR #5, June 2, 2026. Carried forward for history. |
| React Error Boundaries (was Tier 1.1) | ✅ Done | PR #3, June 1, 2026. Carried forward for history. |
| CI/CD Pipeline (was Tier 1.4) | ✅ Done | PR #3, June 1, 2026. Carried forward for history. |

---

## Tier 1 — Quick Wins

### Cellar text search — DONE
- **What:** `Cellar.tsx` offers only a 1–5 star rating filter. A user with 50+ cellar entries has no way to find a specific wine by name, producer, or region. Confirmed June 10: `Cellar.tsx` is still 268 lines, byte-for-byte the same gap — `filterRating` state exists, `searchQuery` does not. All data is already in local state — no backend changes needed.
- **Why now:** The scan history Dashboard received search in PR #5 over a week ago. The Cellar is the other primary browsing surface and has had the identical gap for that entire time (confirmed unchanged across 4 consecutive assessments now: June 6, 7, and 10). This is the most "shovel-ready" item in the backlog: well-specified, contained, no backend risk, and directly mirrors a pattern that already shipped successfully elsewhere in the same codebase. With the Current Sprint slot now empty, this is the natural next pick.
- **Effort estimate:** S
- **Actual effort:** S — added `searchQuery` state, a search input above the rating-filter row matching `Dashboard.tsx`'s styling/clear-button pattern, and combined it (AND logic) with the existing `filterRating` filter against `name`/`producer`/`region`. Added a distinct "No wines match your search" empty state with a clear-search action. `npm run lint`/`typecheck`/`build`/`vitest run` all clean (15 pre-existing lint errors and 3 pre-existing typecheck errors in unrelated files, confirmed identical via `git stash`).
- **Agent prompt:** "In `src/pages/Cellar.tsx`, add a text search input above the star-rating filter row. Add a `searchQuery` state variable (`useState('')`). Modify the `filtered` derivation to also filter by `searchQuery`: match against `memory.name`, `memory.producer`, and `memory.region` (all case-insensitive). Add a debounced input (300ms, or use a simple controlled input — no library needed). Use the same input styling as `Dashboard.tsx` for visual consistency (dark glass-morphism card with placeholder 'Search by name, producer, or region…'). Show a 'No results' empty state with a clear-search button when filtered is empty but memories is not. No Supabase queries needed — all data is already in local state."

---

### Settings.tsx shared-key UX — OPEN
- **What:** Split out from the prior "Complete the pooled API key migration" Tier 2 item, which was partly resolved without being tracked: `Dashboard.tsx` (line 55) already correctly computes `hasApiKey = !!localStorage.getItem('somm_openai_api_key') || !!profile?.use_shared_key`, so the setup-warning banner already behaves correctly for shared-key users. The remaining gap is narrower than previously scoped: `Settings.tsx` still has zero references to `use_shared_key` (confirmed via grep, June 10) — the API key input section renders identically for all users regardless of whether an admin has granted them shared-key access.
- **Why now:** This is now a small, self-contained UI change (the edge function guard and Dashboard banner logic are both already correct), making it genuinely S-effort rather than the M-effort it was scoped at when it was bundled with quota enforcement. Closing it removes the single largest remaining onboarding dead-end for non-technical users who've been granted shared-key access but still see a confusing "enter your API key" form.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "In `src/pages/Settings.tsx`, check `profile?.use_shared_key` (from `useAuth`). If true, replace the API key input section with a read-only card: 'You are using Somm's shared scanning service — no API key required.' styled with the existing champagne/green success palette. If false, keep the existing input but update the help text to note that the API key requirement may be removed in future. No changes needed to `Dashboard.tsx` or the edge function — both already handle `use_shared_key` correctly."

---

### Scan history CSV export — OPEN
- **What:** Wine enthusiasts using Somm as a personal wine journal want to extract their history for personal records, wine club meetings, or import into another tool. CSV export is implementable entirely client-side from already-fetched session data — no backend changes required. Confirmed June 10: no `exportToCsv` utility or export button exists yet.
- **Why now:** Carried from prior assessments (4th consecutive cycle); remains the most-requested type of feature for power users. Relatively contained implementation — a good candidate for a standalone PR, and a reasonable second pick after Cellar search.
- **Effort estimate:** S
- **Actual effort:** —
- **Agent prompt:** "Add scan history CSV export to Somm. Create `src/utils/exportHistory.ts` with an `exportToCsv(sessions: ScanSession[]): void` function that converts scan sessions into CSV rows with columns: Date, Context, Notes, Wine Name, Producer, Vintage, Type, Region, Match Score, Chosen (yes/no from `chosen_wine_name`). Generate the CSV string and trigger a download using `URL.createObjectURL(new Blob([csvString], { type: 'text/csv;charset=utf-8;' }))`. Set filename to `somm-scan-history-YYYY-MM-DD.csv`. Add an 'Export CSV' button (download icon, `lucide-react`) to the scan history page header in `Dashboard.tsx`. Disable with tooltip when no sessions exist."

---

## Tier 2 — Next Sprint

### Daily scan quota for shared-key users — OPEN
- **What:** Split out from the prior bundled "Complete the pooled API key migration" item. The edge function correctly resolves `use_shared_key = true` to the server's `OPENAI_API_KEY`, but there is still no per-user daily limit on shared-key usage — confirmed June 10, no `daily_scan_counts` table or equivalent exists in `supabase/migrations/`.
- **Why now:** This is the cost-control half of the pooled-key story and should land close in time to (or just after) the Settings.tsx UI piece (Tier 1, above) — once Settings.tsx actively advertises "no API key required" to shared-key users, usage on the shared key is likely to increase, and PRD's Constraints section explicitly calls out cost as a primary constraint ("Each scan uses GPT-4 Vision tokens. Admin approval system exists specifically to gate this spend."). Splitting this from the Settings UI work (now Tier 1) lets the quick UI win ship independently while this slightly riskier edge-function + migration change gets its own review cycle.
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "In `supabase/functions/analyze-wine/index.ts`, after confirming `useSharedKey = true`, enforce a daily scan quota: upsert a row in a new `daily_scan_counts(user_id uuid, scan_date date, count int, primary key(user_id, scan_date))` table, incrementing `count`. If `count > 10`, return HTTP 429 with JSON `{ error: 'Daily scan limit reached. Resets at midnight UTC.' }`. Create the migration for `daily_scan_counts` with an appropriate RLS policy (users can read their own count; service role writes). Surface the 429 response in `useScannerLogic`/`Scanner.tsx` with a clear user-facing message. Note: requires a redeploy of `analyze-wine` after merge — coordinate with whoever runs `supabase functions deploy analyze-wine`."

---

### Preferences.tsx modularization (23 KB) — OPEN
- **What:** `src/pages/Preferences.tsx` at 552 lines (confirmed June 10, unchanged) manages four distinct user preference domains — taste spectrum sliders, grape varietal toggles, budget range settings, and food pairing preferences — in a single scrolling form. These sections have distinct data shapes, mutation paths, and interaction patterns. `PreferencesRefactor.test.tsx` already exists in `src/pages/__tests__/` suggesting this work was anticipated.
- **Why now:** This is the most-edited settings component; any future change to taste preferences touches this entire file. Modularizing before the next taste-profile feature is added prevents compounding complexity. Now the longest-standing open Tier 2 item (4th consecutive assessment unchanged).
- **Effort estimate:** M
- **Actual effort:** —
- **Agent prompt:** "Refactor `src/pages/Preferences.tsx` in Somm without changing any visible behavior or styling. Extract: (1) `src/components/preferences/TasteSpectrumSection.tsx` — the spectrum sliders (body, sweetness, tannins, acidity, earthiness); (2) `src/components/preferences/VarietalTogglesSection.tsx` — grape varietal include/exclude toggles; (3) `src/components/preferences/BudgetRangeSection.tsx` — per-context (restaurant/store) budget min/max inputs; (4) `src/components/preferences/FoodPairingSection.tsx` — food type preference toggles. Each component should accept the relevant slice of the preferences object as props and call an `onChange(partial)` callback. `Preferences.tsx` should become a thin orchestrator under 200 lines. Run `npx vitest run` and `npx tsc --noEmit` to confirm no regressions, paying particular attention to `PreferencesRefactor.test.tsx` which appears to anticipate this exact change."

---

### "Revisit" / re-run a past scan — OPEN _(new this cycle)_
- **What:** PRD Phase 3 ("Scan History Enhancements") calls for a "Revisit" button to re-run a past scan with updated preferences. Confirmed June 10: no `Revisit`/`re-run`/`reRun` references anywhere in `src/`. The underlying data is already available — `scan_sessions` stores the original image reference and detected wines, and `analyze-wine` already accepts the `wine_memories`/preferences payload that would have changed since the original scan.
- **Why now:** This is a natural complement to the now-closed "I Chose This" feedback loop — it lets users see how their *evolving* taste profile (after rating wines, adjusting sliders, or adding taste anchors) would re-rank a list they've already scanned, directly demonstrating the "flywheel of improving accuracy" that PRD Goal #2 promises. It's a visible, tangible way to show users the product is "learning." Scoped to re-running the *scoring + recommendation* steps (2 and 3) against the already-stored `allWinesFound`/`debug_info` candidates rather than re-running OCR, this avoids re-uploading the image and keeps the OpenAI cost roughly in line with a normal scan minus the vision call.
- **Effort estimate:** M
- **Agent prompt:** "Add a 'Revisit' action to `ScanDetail.tsx` and the scan history list in `Dashboard.tsx`. When clicked, call a new edge function path (or extend `analyze-wine` with a `revisitSessionId` parameter) that skips OCR and re-runs steps 2 (scoring) and 3 (research + recommend) using the `allWinesFound` candidates already stored in `scan_sessions.debug_info`, against the user's *current* `user_preferences` and `wine_memories`. Persist the result as a new `scan_sessions` row with a `revisited_from` foreign key pointing at the original session. Show a small badge ('Re-scanned from [date]') on revisited sessions in the history list. If `debug_info.allWinesFound` is missing for older sessions (pre-debug-block sessions), disable the Revisit button with a tooltip explaining the original scan didn't store enough data."

---

## Tier 3 — Strategic

### Wine Circles — Group Scanning — OPEN _(escalated from Tier 3 at June 5 assessment, 3rd consecutive cycle at this tier)_
- **What:** The PRD's Phase 4 vision: one person photographs a wine list and all group members simultaneously receive personalized recommendations tailored to their individual taste profiles from the same list. No major wine app offers this mechanic. Transforms Somm from a solo tool into a dinner-party and wine-club companion.
- **Why now:** Foundational differentiator for growth beyond solo users; natural referral mechanic. Scope is well-defined in PRD Phase 4. Per the staleness rule, this item has now appeared at Tier 3 for 3 consecutive assessments (June 5 escalation note, June 7, June 10) without movement. Rather than escalate to Tier 2 (it remains genuinely L-effort and dependent on the Tier 1/2 foundation work below) or drop it (it's a core PRD differentiator with no substitute), this assessment explicitly re-confirms its gating: it should start **after** Cellar search, the Settings.tsx shared-key UX, and Preferences.tsx modularization are complete — all three remain open. If it appears again at Tier 3 unchanged next cycle with the gating items still open, escalate the *gating items* rather than this one.
- **Effort estimate:** L
- **Actual effort:** —
- **Agent prompt:** "Design and implement Wine Circles Phase 1 for Somm. Create Supabase tables: `wine_circles(id uuid, name text, created_by uuid, invite_code text unique, created_at timestamptz)` and `circle_members(circle_id uuid, user_id uuid, joined_at timestamptz)`. Create a `/circles` page with: (1) 'Create Circle' form generating a unique 6-character alphanumeric invite code; (2) 'Join Circle' form accepting an invite code; (3) list of the current user's circles with member count and share-code button. When a scan completes, add a 'Share with Circle' option that inserts a `shared_scans(scan_session_id, circle_id, shared_by uuid, shared_at timestamptz)` record. Circle members can view shared scans with a 'Shared by [name]' badge. Do not implement real-time in this phase — sharing is asynchronous."

---

### "Why not this wine?" explanations — OPEN _(new this cycle)_
- **What:** PRD Phase 3 explicitly calls for "'Why not this wine?' explanations for wines that were detected but not recommended." The `analyze-wine` response already returns `wines_detected` (all wines OCR'd from the image) separately from `recommendations` (the ranked top picks), and the `debug` block carries `allWinesFound` and `researchedWines` with scoring data — so the raw signal needed to answer "why wasn't X recommended" already flows through the pipeline and is persisted to `scan_sessions.debug_info`. Today, none of this is surfaced in the UI for non-recommended wines.
- **Why now:** This directly supports PRD Goal #2 (taste intelligence flywheel) by making the AI's reasoning legible, which builds user trust in recommendations and may surface preference-profile mis-calibrations (e.g., a user keeps wondering why their favorite producer never gets recommended, discovers it's because of a slider setting, and goes to fix their profile). It's also lower-risk than Wine Circles since it's purely additive UI on existing data — no new edge function logic required for the MVP (scores already exist in `debug_info` for the top-8 researched candidates; for wines outside the top 8, a simple "not in your top matches based on [budget/avoidance/style] filters" message can be derived client-side from `s1`/`s2` if present, or a generic explanation otherwise).
- **Effort estimate:** L (touches `ScanDetail.tsx` UI, requires careful handling of the case where `debug_info` is absent on older sessions, and needs UX design for how to present "all detected wines" without overwhelming the primary recommendations view)
- **Agent prompt:** "In `ScanDetail.tsx`, add a collapsible 'All wines on this list' section below the ranked recommendations, populated from `session.wines_detected` (or `debug_info.allWinesFound` if richer). For wines NOT present in `recommendations`, render a compact row with name/price and a 'Why not this one?' expandable explanation: if `debug_info.allWinesFound` contains `s1`/`s2` scores for that wine, render a short templated explanation referencing the lower score dimension (e.g., 'Scored lower on profile match — may be outside your preferred body/tannin range'); if no score data exists (older sessions or wines outside the scored set), show a generic 'Not in your top picks for this list' message. Gate the whole section behind a feature check for `debug_info` presence so older sessions degrade gracefully."

---

## Dropped / Stale

| Item | Reason |
|------|--------|
| **Restaurant Partnership Integration** | Primarily a business development task — technical foundation has no value without active restaurant partners. Dropped June 5 assessment; revisit when go-to-market outreach begins. |
| **Offline Cellar Browsing (PWA)** | Dropped June 5 assessment — this is a natural half-day follow-on to the Cellar React Query migration. No value in tracking as a standalone item; note added to Cellar work. |

---

## Notes for next assessment

- **Instrumentation gap:** There are still no open GitHub issues, meaning this backlog is driven entirely by code inspection against the PRD rather than real user feedback. Now that the pooled-key UX (Tier 1) and Wine Circles gating items are close to resolved, it would sharpen future assessments to have *any* lightweight usage signal — even a manual count of `scan_sessions` rows per week, or `chosen_wine_name` fill-rate (the success metric explicitly named in PRD: ">60% of scans result in a saved wine") — to validate whether the feedback-loop work from PRs #5/#11 is actually moving that number.
- **Wine Knowledge (PRD Phase 3) is further along than previously tracked** — `Knowledge.tsx`, `WineKnowledgeModal.tsx`, and `WineTermLink.tsx` already exist with a `/knowledge` nav entry. This wasn't previously captured in IMPROVEMENTS.md; worth a future cycle doing a focused review of `Knowledge.tsx` for completeness against the PRD's "tap any wine type, region, or grape... 'Learn more' links" description, since it may already be DONE and just needs to be marked as such (or may be a stub needing content).
