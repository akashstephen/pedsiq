<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PedsIQ — Agent Reference Guide

## Project Overview

PedsIQ is a statically-generated Next.js 16 application that analyzes KUHS (Kerala University of Health Sciences) Pediatrics exam papers and provides analytics, structured answers, MCQ practice, and neuroscience-backed arcade learning for medical students. It is deployed on Cloudflare Pages.

**Live URL:** https://pedsiq.pages.dev  
**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide React  
**Deployment:** Static export to Cloudflare Pages via Wrangler

## Directory Structure

```
web/                            # Next.js application (this directory)
├── src/
│   ├── app/                    # App Router pages
│   │   ├── page.tsx            # Dashboard (home route)
│   │   ├── questions/          # Question bank with search/filter
│   │   ├── nelson/             # Nelson chapter analysis
│   │   ├── subjects/           # Subject distribution
│   │   ├── insights/           # Pattern insights with uncertainty
│   │   ├── structured-answers/ # 46 predicted topics
│   │   │   ├── page.tsx        # Topic filter + renderer
│   │   │   └── topics.ts       # Topic data (46 predicted questions)
│   │   ├── quiz/               # MCQ launcher/session/results
│   │   ├── mcq-review/         # Searchable MCQ explanations
│   │   └── arcade/             # Gamified learning modules
│   │       ├── page.tsx        # Arcade launcher hub
│   │       ├── dose-duel/      # Timed dosing MCQs
│   │       ├── dose-sniper/    # Falling-card game
│   │       ├── feature-wars/   # Differential diagnosis sorting
│   │       ├── protocol-builder/ # Algorithm reconstruction
│   │       └── trap-defuser/   # Examiner trap detection
│   ├── components/
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── Flowchart.tsx       # Custom SVG flowcharts
│   │   └── ArcadeShell.tsx     # Full-screen arcade wrapper
│   ├── hooks/
│   │   ├── useQuizSession.ts
│   │   └── useArcadeSession.ts
│   ├── lib/
│   │   ├── data.ts             # Data processing utilities + types
│   │   ├── storage.ts          # MCQ UserProfile + active-session storage
│   │   └── arcade-storage.ts   # ArcadeProfile localStorage manager
│   ├── types/
│   │   ├── mcq.ts              # MCQ type definitions
│   │   └── arcade.ts           # Arcade type definitions
│   └── data/
│       ├── questions.json      # 409 exam questions
│       ├── mcqs.json           # 250 MCQs
│       └── metadata.json       # 24 exam metadata records
```

## Critical Conventions

### 1. Arcade Components

Arcade games are **client-only** and must use `'use client'`. They also use `ArcadeShell` for full-screen mode:

```tsx
'use client';
import { ArcadeShell } from '@/components/ArcadeShell';

export default function DoseDuelPage() {
  return (
    <ArcadeShell gameId="dose-duel" themeClass="arcade-dose-duel">
      <DoseDuelGame />
    </ArcadeShell>
  );
}
```

Current `ArcadeShell` props are `gameId`, `themeClass`, and `children`. It adds `data-arcade-active` to `<body>`, applies the theme class, locks body scrolling, and shows an Escape-key quit confirmation.

### 2. Static Export Only

This project uses **static export** (`output: 'export'`). This means:
- NO server components that fetch data at runtime
- NO API routes
- NO dynamic routes with `generateStaticParams`
- All data must be imported at build time or be client-side only

### 3. Chart Components Must Be Client Components

Any page using Recharts MUST include `'use client'` at the top:

```tsx
'use client';
import { LineChart, Line, ... } from 'recharts';
```

Recharts uses DOM APIs and cannot render on the server during static export.

### 4. Data Import Pattern

All data is imported directly from JSON:

```tsx
import questions from '@/data/questions.json';
import { processData } from '@/lib/data';

const data = processData(questions);
```

Do NOT fetch data in useEffect. Import it at the module level.

### 5. Dark Theme First

All components are designed for dark backgrounds (`bg-black`). Use these tokens:

```css
bg-white/[0.03]          /* Card backgrounds */
border-white/[0.08]      /* Card borders */
text-white/90            /* Primary text */
text-white/60            /* Secondary text */
text-white/40            /* Tertiary text */
bg-[#007AFF]/15          /* Accent backgrounds */
text-[#007AFF]           /* Accent text */
```

### 6. Print Styles

The `@media print` block in `globals.css` handles A4 printing:
- Hides sidebar (`aside`, mobile toggle button)
- Resets margins (`main { margin-left: 0 }`)
- Adds page breaks between `article` elements
- Do NOT use Tailwind arbitrary selectors in print CSS (causes build errors)

### 7. Flowcharts

Use the custom `Flowchart` component for all diagrams:

```tsx
import { Flowchart } from '@/components/Flowchart';

<Flowchart
  nodes={[
    { id: 'a', label: 'Start', type: 'start' },
    { id: 'b', label: 'Process', type: 'default' },
    { id: 'c', label: 'Decision?', type: 'decision' },
    { id: 'd', label: 'End', type: 'end' },
  ]}
  edges={[
    { from: 'a', to: 'b' },
    { from: 'b', to: 'c' },
    { from: 'c', to: 'd', label: 'Yes' },
  ]}
/>
```

Node types: `default`, `decision`, `start`, `end`

### 8. Structured Answer Topics

All predicted questions live in `src/app/structured-answers/topics.ts`.

Interface:
```typescript
interface Topic {
  id: string;                // URL slug (kebab-case)
  shortTitle: string;        // Button label (short)
  patternStrength: 'Strong' | 'Moderate' | 'Emerging';
  historicalFrequency: HistoricalFrequency;
  confidenceNote: string;
  subject: string;
  examType: string;          // e.g., "Essay / Short Note"
  question: string;          // Predicted exam question
  marksBreakdown: string;    // Mark allocation
  sections: TopicSection[];
  checklist?: string[];      // Scoring checklist with <strong>X.M</strong>
  references?: string[];
}
```

HTML is allowed in `text` and `list` items (uses `dangerouslySetInnerHTML`).

## Build Commands

```bash
# Development
cd web && npm run dev          # localhost:3000

# Production build
cd web && npm run build        # Outputs to web/dist/

# Deploy
cd web && npx wrangler pages deploy dist --project-name pedsiq --branch main
```

## Data Pipeline (Python)

The canonical pipeline lives in `pipeline/src/pedsiq/` and is run via the CLI:

```bash
# From project root (not web/)
cd pipeline
python -m pedsiq.cli run /path/to/pdfs --output output/
cp output/questions.json ../web/src/data/questions.json
```

Legacy root-level scripts (`extract_questions_v3.py`, `classify_questions_v2.py`, etc.) are deprecated and retained only for reference. Use the `pedsiq` package for all new work.

## Common Pitfalls

1. **Forgetting `'use client'` on chart pages** → Build fails with `createContext` error
2. **Using server-side data fetching** → Static export fails
3. **Complex Tailwind selectors in print CSS** → CSS parse errors
4. **Adding images without `unoptimized: true`** → Static export fails
5. **Forgetting to add new routes to `sitemap.xml`** → SEO issue
6. **Using `setState` inside `requestAnimationFrame`** → React batching delays cause frame drops. Use refs for DOM mutations in rAF loops.
7. **Sharing localStorage keys between arcade and quiz** → Data corruption. Arcade uses `pedsiq_arcade_v1`; quiz uses `pedsiq_user_v1`.
8. **Forgetting to wrap arcade pages in `ArcadeShell`** → Sidebar remains visible during gameplay.
9. **Adding runtime deps for arcade** → Bundle bloat. Use pure React + CSS + rAF. No Phaser/Pixi.
10. **Hardcoding game data in components** → Static export constraint. Import JSON at build time.
11. **Forgetting to document arcade neuroscience** → Every arcade mechanic should map to a learning principle in `../NEUROSCIENCE.md`.

## When Adding New Features

1. Add route in `src/app/[route]/page.tsx`
2. Add nav link in `src/components/Sidebar.tsx`
3. Update `public/sitemap.xml`
4. Update `CHANGELOG.md`
5. Build and test locally before deploying
6. Deploy with Wrangler

## When Adding a New Arcade Game

1. Create `src/app/arcade/[game-id]/page.tsx` wrapped in `ArcadeShell`
2. Create engine hook in `src/app/arcade/[game-id]/hooks/use[Game]Engine.ts`
3. Add game-specific types in `src/types/arcade.ts` unless the type is truly local-only
4. Add static JSON data in `src/app/arcade/[game-id]/data/`
5. Export game stats type in `src/types/arcade.ts`
6. Add storage serialization in `src/lib/arcade-storage.ts`
7. Add nav link in `ArcadeLauncher` (`src/app/arcade/page.tsx`)
8. Add game card to `sitemap.xml`
9. Document neuroscience principle in `NEUROSCIENCE.md`
10. Build and test: timer, scoring, study list, fullscreen

## External Dependencies

- **Recharts** — Charts (client-side only)
- **Lucide React** — Icons
- **clsx** — Conditional class names
- **Tailwind CSS v4** — Styling (custom `@theme inline` tokens)

## Arcade Dependencies

**None.** Arcade games use pure React + CSS + `requestAnimationFrame`. No Phaser, Pixi, or other game engines. This keeps bundles small and avoids runtime dependency bloat.

## Contact

Project maintainer: akashstephen  
Repository: https://github.com/akashstephen/pedsiq
