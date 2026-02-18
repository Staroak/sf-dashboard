# Learnings — summary-quotes-rework

## [2026-02-18] Session Start

### Codebase Conventions
- All dashboard pages live in `components/dashboard/`
- All pages use `"use client"` directive
- All pages use named exports: `export function PageName()`
- Root element of every page: `<div className="h-full flex flex-col p-3 overflow-hidden">`
- Dashboard has `h-full animate-fadeIn` applied to every page via Dashboard.tsx line 601
- Page components receive only data they need — QuotesPage is self-contained (no props)

### Data Sources
- Quotes/tips data: `lib/content.ts` exports `motivationalQuotes` (array of `{quote, author}`) and `proTips` (array of `{tip, category, icon}`)
- Quote rotation: QuoteSidebar uses 30s interval for quotes, 20s for tips — we use 8s for QuotesPage (faster for TV)
- Icons for tips: `{lightbulb: Lightbulb, shield: Shield, star: Star, users: Users, target: Target}` from lucide-react

### Fade Transition Pattern (QuoteSidebar)
```typescript
const [isQuoteFading, setIsQuoteFading] = useState(false);
// Trigger:
setIsQuoteFading(true);
setTimeout(() => {
  setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
  setIsQuoteFading(false);
}, 500);
// Apply:
className={cn("transition-opacity duration-500", isQuoteFading ? "opacity-0" : "opacity-100")}
```

### SummaryPage Layout (Before)
- 12-col grid: col-span-9 main (stats + leaderboard/quotes) + col-span-3 BluePearl sidebar
- Bottom section: `grid grid-cols-2` split between RotatingLeaderboard (left) and QuoteSidebar (right)
- After this task: Remove grid-cols-2 wrapper, RotatingLeaderboard fills full width as `flex-1` child

### Dashboard Rotation System
- PAGES array (line 82): const array — TypeScript infers PageType from it automatically
- Must update: PAGES, PAGE_LABELS, PAGE_DURATIONS, renderCurrentPage() switch — ALL 4 locations
- "quotes" page placement: after "summary" (8th page, cycle closer)
- Duration: 20000ms (20s)
## [2026-02-17] Task 1 Complete: QuotesPage.tsx created
- Full-screen two-section layout: quote (flex-[3]) + tip (flex-[2])
- 8s rotation with 500ms fade transitions for both sections
- No props, no navigation — passive TV display
- Gradient backgrounds match QuoteSidebar aesthetic
- LSP diagnostics clean

