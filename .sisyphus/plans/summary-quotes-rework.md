# Summary Page & Quotes Page Rework

## TL;DR

> **Quick Summary**: Move the motivational quotes/tips from the Summary page into a new dedicated full-screen Quotes page in the dashboard rotation. Simplify the Summary page to show only performance stats, rotating leaderboard (full-width), and goal orbs.
> 
> **Deliverables**:
> - New `QuotesPage.tsx` — full-page motivational quotes/tips splash screen
> - Modified `SummaryPage.tsx` — leaderboard fills bottom area (no more 50/50 split with quotes)
> - Modified `Dashboard.tsx` — "quotes" added to page rotation
> - Updated `index.ts` barrel export
> 
> **Estimated Effort**: Short (~30 min agent time)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (QuotesPage) → Task 3 (Dashboard wiring) → Task 5 (Verify)

---

## Context

### Original Request
Move quotes from the Summary page to a separate rotating page. Fill the Summary page with just performance (today/monthly), the rotating leaderboard, and goals.

### Interview Summary
**Key Discussions**:
- **Goals layout**: User confirmed goals (BluePearl orbs) stay in the right sidebar — same 9/3 col split
- **Quotes page style**: User chose full-page centered motivational splash screen with gradients (not just a scaled-up sidebar)
- **Summary simplification**: Remove QuoteSidebar, let RotatingLeaderboard take the full bottom area width

**Research Findings**:
- `Dashboard.tsx` PAGES array controls rotation order (7 pages currently)
- Each page has `PAGE_DURATIONS` and `PAGE_LABELS` entries
- SummaryPage bottom section uses `grid grid-cols-2` to split leaderboard and quotes 50/50
- QuoteSidebar imports from `@/lib/content` (motivationalQuotes, proTips)
- RotatingLeaderboard already uses `h-full flex flex-col` — will stretch naturally
- QuoteDisplay.tsx is dead code (not imported anywhere) — leave untouched

### Metis Review
**Identified Gaps** (addressed):
- **Rotation placement**: Defaulted to after "summary" — quotes close out the cycle as a motivational beat
- **Page duration**: Defaulted to 20000ms (20s) — enough to read 2-3 quotes
- **Nav pill label**: Defaulted to "Quotes"
- **Content scope**: Show BOTH quotes AND tips on the page (matching current QuoteSidebar content)
- **Internal rotation speed**: Set to 8s so users see 2-3 quotes during a 20s page visit
- **TV display**: Typography must be large enough for distant viewing (text-4xl+ for quotes)
- **Header pill overflow**: 8 pills fit within 1920px+ TV displays — no issue

---

## Work Objectives

### Core Objective
Extract quotes/tips into a standalone full-page experience and simplify the Summary page to its essential data components.

### Concrete Deliverables
- `components/dashboard/QuotesPage.tsx` — new full-page quotes component
- `components/dashboard/SummaryPage.tsx` — simplified (no quotes)
- `components/dashboard/Dashboard.tsx` — new page in rotation
- `components/dashboard/index.ts` — export added

### Definition of Done
- [ ] `npm run build` compiles with zero errors
- [ ] Dashboard rotates through 8 pages (was 7)
- [ ] Summary page shows: Today stats, Monthly stats, Leaderboard (full width), Goals sidebar
- [ ] Quotes page shows full-screen motivational quotes with auto-rotation
- [ ] No references to QuoteSidebar remain in SummaryPage

### Must Have
- QuotesPage reuses data from `@/lib/content` (motivationalQuotes, proTips)
- QuotesPage is self-contained (no props from Dashboard)
- RotatingLeaderboard fills the full bottom area on Summary page
- Both quotes AND tips displayed on the Quotes page
- Internal quote rotation fast enough to show 2-3 per page visit (~8s)
- Typography large enough for TV viewing (text-4xl+ for quote text)

### Must NOT Have (Guardrails)
- Do NOT modify `QuoteSidebar.tsx` — leave intact as component
- Do NOT modify `QuoteDisplay.tsx` — dead code, out of scope
- Do NOT modify `RotatingLeaderboard.tsx` — it already flexes to fill space
- Do NOT modify `lib/content.ts` — data stays unchanged
- Do NOT add data props to QuotesPage — it's self-contained
- Do NOT add new CSS animations to `globals.css` — use Tailwind classes
- Do NOT refactor QuoteSidebar to "share a base" with QuotesPage — premature abstraction
- Do NOT clean up dead code (QuoteDisplay) — separate task
- Do NOT add more quotes/tips to content.ts — data unchanged

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: No formal test setup
- **Automated tests**: None
- **Framework**: N/A
- **QA Method**: Agent-executed Playwright browser verification + build verification

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

| Deliverable Type | Verification Tool | Method |
|------------------|-------------------|--------|
| New Component (QuotesPage) | Playwright | Navigate to quotes page, verify content renders |
| Modified Layout (SummaryPage) | Playwright | Navigate to summary, verify layout structure |
| Build Integrity | Bash | `npm run build`, assert zero errors |
| Rotation Wiring (Dashboard) | Playwright | Observe auto-rotation includes quotes page |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — independent tasks):
├── Task 1: Create QuotesPage.tsx component [visual-engineering]
├── Task 2: Simplify SummaryPage.tsx layout [quick]
└── Task 3: Update barrel export index.ts [quick]

Wave 2 (After Wave 1 — wiring + verification):
├── Task 4: Wire QuotesPage into Dashboard.tsx rotation [quick]
└── Task 5: Build verification + Playwright QA [unspecified-high]
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|------------|--------|------|
| 1 | — | 4, 5 | 1 |
| 2 | — | 5 | 1 |
| 3 | — | 4 | 1 |
| 4 | 1, 3 | 5 | 2 |
| 5 | 1, 2, 4 | — | 2 |

### Agent Dispatch Summary

| Wave | # Parallel | Tasks → Agent Category |
|------|------------|----------------------|
| 1 | **3** | T1 → `visual-engineering`, T2 → `quick`, T3 → `quick` |
| 2 | **2** | T4 → `quick`, T5 → `unspecified-high` |

---

## TODOs

- [ ] 1. Create QuotesPage.tsx — Full-Page Motivational Splash Screen

  **What to do**:
  - Create `components/dashboard/QuotesPage.tsx` as a new component
  - Import `motivationalQuotes` and `proTips` from `@/lib/content`
  - Build a full-page centered layout that fills `h-full` (the parent provides this)
  - **Quote section** (top ~60%): Large centered blockquote with author attribution. Gradient background `from-blue-500/10 via-purple-500/10 to-pink-500/10`. Quote icon from lucide-react. Typography: `text-4xl` or `text-5xl` for quote text (TV-readable), `text-2xl` for author
  - **Tip section** (bottom ~40%): Pro tip display with category label and icon. Gradient background `from-amber-500/10 via-orange-500/10 to-red-500/10`. Typography: `text-3xl` for tip text
  - Internal rotation: Quotes rotate every **8 seconds**, tips every **8 seconds** (fast enough to show 2-3 per 20s page visit)
  - Fade transition between items: use `transition-opacity duration-500` pattern (matching QuoteSidebar)
  - Component signature: `export function QuotesPage()` — no props, self-contained
  - Root element: `<div className="h-full flex flex-col p-6 gap-4 overflow-hidden">`
  - Use `"use client"` directive at top

  **Must NOT do**:
  - Do NOT import or reuse QuoteSidebar component — build fresh layout
  - Do NOT duplicate quote data — import from `@/lib/content`
  - Do NOT accept any props — this component is fully self-contained
  - Do NOT add custom CSS to globals.css — Tailwind classes only
  - Do NOT add navigation arrows/dots (this is a passive TV display page)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Full-page visual design with gradients, typography, animations — UI/UX focused
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Designing a visually rich splash screen with gradient backgrounds, large typography, and smooth transitions

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `components/dashboard/QuoteSidebar.tsx:16-196` — Fade transition pattern (useState for index + isTransitioning, setTimeout for opacity swap). Copy the transition approach but NOT the layout
  - `components/dashboard/QuoteSidebar.tsx:87-140` — Gradient background approach and decorative blur elements. Use similar gradient classes
  - `components/dashboard/FundedPage.tsx` — Example of a page component pattern: `"use client"`, named export, `h-full` root

  **API/Type References** (contracts to implement against):
  - `lib/content.ts` — Exports `motivationalQuotes` (array of `{quote, author}`) and `proTips` (array of `{tip, category, icon}`). Import these directly

  **External References**:
  - Lucide icons already used: `Quote`, `Lightbulb`, `Shield`, `Star`, `Users`, `Target` (from QuoteSidebar.tsx line 4)

  **WHY Each Reference Matters**:
  - QuoteSidebar.tsx shows the proven fade pattern (opacity 0→1 with setTimeout) that avoids flash-of-content
  - FundedPage.tsx shows the correct page component signature this dashboard expects
  - lib/content.ts is the ONLY source of truth for quote/tip data — never duplicate

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: QuotesPage renders with motivational quote
    Tool: Bash
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Run `npx tsc --noEmit` in sf-dashboard directory
      2. Verify QuotesPage.tsx exists: `ls components/dashboard/QuotesPage.tsx`
      3. Verify it imports from lib/content: `grep "from.*lib/content" components/dashboard/QuotesPage.tsx`
      4. Verify it has "use client" directive: `head -1 components/dashboard/QuotesPage.tsx`
      5. Verify export signature: `grep "export function QuotesPage" components/dashboard/QuotesPage.tsx`
    Expected Result: All checks pass — file exists, imports content, has use client, exports correctly
    Evidence: .sisyphus/evidence/task-1-quotes-page-created.txt

  Scenario: QuotesPage has no props (self-contained)
    Tool: Bash
    Preconditions: QuotesPage.tsx exists
    Steps:
      1. Run `grep "QuotesPage(" components/dashboard/QuotesPage.tsx`
      2. Verify the function signature has no parameters (empty parens or no interface)
    Expected Result: Function takes zero props
    Evidence: .sisyphus/evidence/task-1-no-props.txt
  ```

  **Commit**: YES (groups with Tasks 2, 3 — end of Wave 1)
  - Message: `feat(dashboard): add QuotesPage and simplify SummaryPage layout`
  - Files: `components/dashboard/QuotesPage.tsx`

- [ ] 2. Simplify SummaryPage.tsx — Remove Quotes, Expand Leaderboard

  **What to do**:
  - Open `components/dashboard/SummaryPage.tsx`
  - **Remove** the `QuoteSidebar` import (line 5)
  - **Remove** the `grid grid-cols-2` wrapper div (line 75) that splits leaderboard and quotes 50/50
  - **Remove** the `<QuoteSidebar />` usage (line 83)
  - **Make RotatingLeaderboard fill the full bottom area**: Replace the `grid grid-cols-2` wrapper with just the `<RotatingLeaderboard>` component directly as a `flex-1` child
  - The result should be: StatsSection (Today) → StatsSection (Monthly) → RotatingLeaderboard (fills remaining space) — all in the left 9-col main area
  - Keep the 3 BluePearl goals in the right 3-col sidebar **completely unchanged**
  - Keep all props interface and DAILY_GOALS unchanged

  **Must NOT do**:
  - Do NOT modify the BluePearl sidebar (cols 10-12) — it stays exactly as-is
  - Do NOT modify StatsSection components or their props
  - Do NOT modify RotatingLeaderboard.tsx itself — just give it more space
  - Do NOT change the component's props interface or DAILY_GOALS constant
  - Do NOT leave any dead QuoteSidebar import

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Surgical removal of one component and one wrapper div — minimal change
  - **Skills**: []
    - No special skills needed — straightforward edit

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 5
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `components/dashboard/SummaryPage.tsx:5` — QuoteSidebar import to REMOVE
  - `components/dashboard/SummaryPage.tsx:40-85` — Current layout structure. Lines 75-84 are the grid-cols-2 wrapper to remove
  - `components/dashboard/SummaryPage.tsx:88-118` — BluePearl sidebar that must NOT be touched

  **WHY Each Reference Matters**:
  - Line 5 is the import to delete
  - Lines 75-84 are the exact lines being restructured (grid-cols-2 → just RotatingLeaderboard as flex-1)
  - Lines 88-118 define the sidebar boundary — touching anything here is out of scope

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: QuoteSidebar completely removed from SummaryPage
    Tool: Bash
    Preconditions: SummaryPage.tsx has been edited
    Steps:
      1. Run `grep -c "QuoteSidebar" components/dashboard/SummaryPage.tsx`
      2. Run `grep -c "grid-cols-2" components/dashboard/SummaryPage.tsx`
    Expected Result: Both counts return 0 — no QuoteSidebar reference and no grid-cols-2 split
    Evidence: .sisyphus/evidence/task-2-sidebar-removed.txt

  Scenario: BluePearl sidebar unchanged
    Tool: Bash
    Preconditions: SummaryPage.tsx has been edited
    Steps:
      1. Run `grep -c "BluePearl" components/dashboard/SummaryPage.tsx`
      2. Verify count is 3 (three BluePearl instances for applications, appraisals, submissions)
      3. Run `grep "col-span-12 lg:col-span-3" components/dashboard/SummaryPage.tsx`
    Expected Result: 3 BluePearl instances, sidebar col-span-3 still present
    Evidence: .sisyphus/evidence/task-2-sidebar-intact.txt

  Scenario: RotatingLeaderboard is direct flex-1 child (not wrapped in grid)
    Tool: Bash
    Preconditions: SummaryPage.tsx has been edited
    Steps:
      1. Run `grep -c "RotatingLeaderboard" components/dashboard/SummaryPage.tsx`
      2. Verify count is >= 1 (component still used)
      3. Verify no grid-cols-2 wrapping it
    Expected Result: RotatingLeaderboard present, filling bottom area without grid wrapper
    Evidence: .sisyphus/evidence/task-2-leaderboard-expanded.txt
  ```

  **Commit**: YES (groups with Tasks 1, 3 — end of Wave 1)
  - Message: `feat(dashboard): add QuotesPage and simplify SummaryPage layout`
  - Files: `components/dashboard/SummaryPage.tsx`

- [ ] 3. Update Barrel Export — Add QuotesPage to index.ts

  **What to do**:
  - Open `components/dashboard/index.ts`
  - Add export line: `export { QuotesPage } from './QuotesPage';`
  - Place it alphabetically among the existing exports (after QuoteSidebar line)

  **Must NOT do**:
  - Do NOT remove any existing exports
  - Do NOT modify any other file

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single line addition to a barrel export file
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 4
  - **Blocked By**: None (can start immediately)

  **References**:
  - `components/dashboard/index.ts:1-7` — Current exports. Add QuotesPage export after line 5 (QuoteSidebar)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: QuotesPage exported from barrel
    Tool: Bash
    Steps:
      1. Run `grep "QuotesPage" components/dashboard/index.ts`
    Expected Result: Line with `export { QuotesPage } from './QuotesPage'` found
    Evidence: .sisyphus/evidence/task-3-barrel-export.txt
  ```

  **Commit**: YES (groups with Tasks 1, 2 — end of Wave 1)
  - Message: `feat(dashboard): add QuotesPage and simplify SummaryPage layout`
  - Files: `components/dashboard/index.ts`

- [ ] 4. Wire QuotesPage into Dashboard.tsx Page Rotation

  **What to do**:
  - Open `components/dashboard/Dashboard.tsx`
  - **Import** QuotesPage: `import { QuotesPage } from "./QuotesPage";`
  - **Add "quotes" to PAGES array** (line 82): Insert after "summary" so it becomes the cycle closer
    - New array: `["applications", "appraisals", "submissions", "funded", "teamleads", "weeklyteam", "summary", "quotes"]`
  - **Add PAGE_LABELS entry** (line ~93): `quotes: "Quotes"`
  - **Add PAGE_DURATIONS entry** (line ~104): `quotes: 20000` (20 seconds — enough to read 2-3 rotating quotes)
  - **Add case to renderCurrentPage() switch** (after the "summary" case around line 480):
    ```
    case "quotes":
      return <QuotesPage />;
    ```
    Note: QuotesPage takes NO props — simplest case in the switch

  **Must NOT do**:
  - Do NOT modify any other page's duration or label
  - Do NOT pass any props to QuotesPage
  - Do NOT modify the header nav structure (pills auto-generate from PAGES array)
  - Do NOT change the celebration logic, data fetching, or any other Dashboard behavior

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 4 surgical insertions (import, array entry, label, duration, switch case) — all mechanical
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential — needs Tasks 1, 3 complete)
  - **Blocks**: Task 5
  - **Blocked By**: Tasks 1, 3

  **References**:

  **Pattern References**:
  - `components/dashboard/Dashboard.tsx:6-13` — Existing imports. Add QuotesPage import here
  - `components/dashboard/Dashboard.tsx:82` — PAGES array. Add "quotes" at end
  - `components/dashboard/Dashboard.tsx:85-93` — PAGE_LABELS. Add quotes entry
  - `components/dashboard/Dashboard.tsx:96-104` — PAGE_DURATIONS. Add quotes: 20000
  - `components/dashboard/Dashboard.tsx:400-481` — renderCurrentPage() switch. Add "quotes" case after "summary"
  - `components/dashboard/Dashboard.tsx:457-480` — The "summary" case returns `<SummaryPage ...>` with many props. The "quotes" case is simpler: `return <QuotesPage />;` (no props)

  **WHY Each Reference Matters**:
  - All 4 locations (PAGES, LABELS, DURATIONS, switch) MUST be updated consistently — missing any one silently breaks the page
  - The switch case pattern shows how other pages are rendered — follow it for QuotesPage
  - QuotesPage is the simplest wiring (no props) — don't overcomplicate

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Dashboard has 8 pages with quotes
    Tool: Bash
    Steps:
      1. Run `grep -c '"quotes"' components/dashboard/Dashboard.tsx`
      2. Verify count >= 4 (PAGES entry, LABELS entry, DURATIONS entry, switch case)
      3. Run `grep "QuotesPage" components/dashboard/Dashboard.tsx`
      4. Verify import line and JSX usage both present
    Expected Result: "quotes" appears in all 4 required locations, QuotesPage imported and used
    Evidence: .sisyphus/evidence/task-4-dashboard-wired.txt

  Scenario: Build succeeds after all wiring
    Tool: Bash
    Preconditions: All Wave 1 files + Dashboard.tsx updated
    Steps:
      1. Run `npm run build` in sf-dashboard directory
      2. Check exit code is 0
      3. Check output for "Compiled successfully" or similar
    Expected Result: Zero build errors
    Failure Indicators: TypeScript errors, missing imports, type mismatches
    Evidence: .sisyphus/evidence/task-4-build-pass.txt
  ```

  **Commit**: YES (end of Wave 2)
  - Message: `feat(dashboard): wire QuotesPage into page rotation`
  - Files: `components/dashboard/Dashboard.tsx`

- [ ] 5. Full Visual QA — Playwright Verification of Both Pages

  **What to do**:
  - Start the dev server (`npm run dev` in sf-dashboard directory)
  - Use Playwright (dev-browser skill) to verify both the Summary page and Quotes page
  - **Summary Page QA**:
    - Navigate to the dashboard, click the "Summary" nav pill
    - Verify Today's Performance section renders (4 metric cards)
    - Verify Monthly Performance section renders (4 metric cards)
    - Verify RotatingLeaderboard is visible and fills the bottom area
    - Verify 3 BluePearl goals are visible in the right sidebar
    - Verify NO quotes/tips content appears on the Summary page
    - Take screenshot as evidence
  - **Quotes Page QA**:
    - Click the "Quotes" nav pill (should be the 8th pill in the header)
    - Verify a large motivational quote is displayed (text-4xl+ size)
    - Verify an author attribution is displayed
    - Verify a tip section is visible
    - Verify gradient backgrounds are rendering
    - Wait 8-10 seconds and verify the quote rotates (text changes)
    - Take screenshot as evidence
  - **Rotation QA**:
    - Verify the header shows 8 navigation pills
    - Count the pills to confirm "Quotes" is present
    - Take screenshot of the header

  **Must NOT do**:
  - Do NOT modify any files during QA — read-only verification
  - Do NOT skip the Quotes page internal rotation check

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multi-step browser verification requiring careful observation and evidence capture
  - **Skills**: [`dev-browser`]
    - `dev-browser`: Playwright browser automation for navigating dashboard, clicking nav pills, taking screenshots, observing transitions

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Task 4 complete)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 1, 2, 4

  **References**:
  - `components/dashboard/Dashboard.tsx:516-533` — Navigation pill buttons. The 8th pill should be "Quotes"
  - `components/dashboard/SummaryPage.tsx` — Post-edit layout to verify
  - `components/dashboard/QuotesPage.tsx` — New component to verify

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Summary page shows performance + leaderboard + goals (no quotes)
    Tool: Playwright (dev-browser skill)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to localhost:3000
      2. Click the "Summary" navigation pill in the header
      3. Wait 2 seconds for page transition
      4. Verify text "Today's Performance" is visible on the page
      5. Verify text "Monthly Performance" is visible on the page
      6. Verify a leaderboard section is visible (text "Top" or "of the Month" present)
      7. Verify BluePearl goal orbs are visible (text "Daily Applications" present)
      8. Verify text "Daily Inspiration" is NOT on the page (quotes removed)
      9. Take full-page screenshot
    Expected Result: Summary page shows stats, leaderboard, goals. No quotes section.
    Failure Indicators: "Daily Inspiration" text visible, QuoteSidebar still rendering, leaderboard not full width
    Evidence: .sisyphus/evidence/task-5-summary-page.png

  Scenario: Quotes page renders full-screen motivational content
    Tool: Playwright (dev-browser skill)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Click the "Quotes" navigation pill in the header
      2. Wait 2 seconds for page transition
      3. Verify a large quote text is visible (blockquote or italic text)
      4. Verify an author attribution is visible (text starting with "—")
      5. Verify a tip section is visible
      6. Take screenshot
      7. Wait 10 seconds
      8. Verify quote text has changed (rotation working)
      9. Take second screenshot showing different quote
    Expected Result: Full-page quotes with rotation. Large text, gradient backgrounds.
    Failure Indicators: Empty page, tiny text, no rotation after 10s
    Evidence: .sisyphus/evidence/task-5-quotes-page.png, .sisyphus/evidence/task-5-quotes-rotated.png

  Scenario: Header shows 8 navigation pills including Quotes
    Tool: Playwright (dev-browser skill)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Count the number of navigation pill buttons in the header
      2. Verify "Quotes" pill is present
      3. Take screenshot of header area
    Expected Result: 8 pills visible: Applications, Appraisals, Submissions, Funded, Team Leads, Weekly Team, Summary, Quotes
    Failure Indicators: Only 7 pills, "Quotes" missing
    Evidence: .sisyphus/evidence/task-5-header-pills.png
  ```

  **Commit**: NO (QA-only task, no file changes)

---

## Final Verification Wave

- [ ] F1. **Build + Type Check** — `quick`
  Run `npm run build` in `sf-dashboard` directory. Assert zero errors and zero warnings. Check `npx tsc --noEmit` passes.
  Output: `Build [PASS/FAIL] | Types [PASS/FAIL] | VERDICT`

- [ ] F2. **Visual QA — All Pages Rotate** — `unspecified-high` (+ `dev-browser` skill)
  Start dev server. Open browser. Observe full rotation cycle: applications → appraisals → submissions → funded → teamleads → weeklyteam → summary → quotes → applications. Screenshot each page transition. Verify quotes page renders with large centered text and gradients. Verify summary page has no quotes section and leaderboard fills full width.
  Output: `Pages [8/8 rendered] | Quotes [visible/not] | Summary [correct/incorrect] | VERDICT`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| Wave 1 complete | `feat(dashboard): add QuotesPage and simplify SummaryPage layout` | QuotesPage.tsx, SummaryPage.tsx, index.ts | npm run build |
| Wave 2 complete | `feat(dashboard): wire QuotesPage into page rotation` | Dashboard.tsx | npm run build |

---

## Success Criteria

### Verification Commands
```bash
npm run build           # Expected: Compiled successfully
grep -c "quotes" components/dashboard/Dashboard.tsx  # Expected: >= 4
grep -c "QuoteSidebar" components/dashboard/SummaryPage.tsx  # Expected: 0
ls components/dashboard/QuotesPage.tsx  # Expected: file exists
grep "QuotesPage" components/dashboard/index.ts  # Expected: 1 match
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Build passes with zero errors
- [ ] 8 pages in rotation (was 7)
- [ ] Summary page: stats + leaderboard (full width) + goals sidebar
- [ ] Quotes page: full-screen motivational quotes with gradients
