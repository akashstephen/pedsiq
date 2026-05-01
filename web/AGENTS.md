<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PedsIQ — Agent Reference Guide

## Project Overview

PedsIQ is a statically-generated Next.js 16 application that analyzes KUHS (Kerala University of Health Sciences) Pediatrics exam papers and provides structured answers for medical students. It is deployed on Cloudflare Pages.

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
│   │   ├── predictions/        # Exam predictions
│   │   └── structured-answers/ # 12 predicted topics
│   │       ├── page.tsx        # Topic filter + renderer
│   │       └── topics.ts       # Topic data (12 predicted questions)
│   ├── components/
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   └── Flowchart.tsx       # Custom SVG flowcharts
│   ├── lib/
│   │   └── data.ts             # Data processing utilities + types
│   └── data/
│       ├── questions.json      # 411 exam questions
│       └── metadata.json       # 24 exam metadata records
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── next.config.ts              # Static export config
└── globals.css                 # Dark theme tokens + print styles

../                             # Parent directory (project root)
├── README.md                   # Main project documentation
├── ARCHITECTURE.md             # System architecture details
├── CONTRIBUTING.md             # Contribution guidelines
├── CHANGELOG.md                # Version history
├── LICENSE                     # MIT License
├── .gitignore                  # Git ignore rules
└── *.py                        # Python data pipeline scripts
```

## Critical Conventions

### 1. Static Export Only

This project uses **static export** (`output: 'export'`). This means:
- NO server components that fetch data at runtime
- NO API routes
- NO dynamic routes with `generateStaticParams`
- All data must be imported at build time or be client-side only

### 2. Chart Components Must Be Client Components

Any page using Recharts MUST include `'use client'` at the top:

```tsx
'use client';
import { LineChart, Line, ... } from 'recharts';
```

Recharts uses DOM APIs and cannot render on the server during static export.

### 3. Data Import Pattern

All data is imported directly from JSON:

```tsx
import questions from '@/data/questions.json';
import { processData } from '@/lib/data';

const data = processData(questions);
```

Do NOT fetch data in useEffect. Import it at the module level.

### 4. Dark Theme First

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

### 5. Print Styles

The `@media print` block in `globals.css` handles A4 printing:
- Hides sidebar (`aside`, mobile toggle button)
- Resets margins (`main { margin-left: 0 }`)
- Adds page breaks between `article` elements
- Do NOT use Tailwind arbitrary selectors in print CSS (causes build errors)

### 6. Flowcharts (NO Mermaid)

Never use Mermaid.js. Use the custom `Flowchart` component:

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

### 7. Structured Answer Topics

All predicted questions live in `src/app/structured-answers/topics.ts`.

Interface:
```typescript
interface Topic {
  id: string;                // URL slug (kebab-case)
  shortTitle: string;        // Button label (short)
  prob: 'Very High' | 'High' | 'Moderate';
  subject: string;
  examType: string;          // e.g., "Essay / Short Note"
  question: string;          // Predicted exam question
  marksBreakdown: string;    // Mark allocation
  sections: TopicSection[];
  checklist?: string[];      // Scoring checklist with <strong>X.M</strong>
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

If you need to regenerate the question database:

```bash
# From project root (not web/)
python extract_questions_v3.py
python classify_questions_v2.py
python consolidate_data.py
cp consolidated_questions.json web/src/data/questions.json
```

Scripts are in the parent directory, not in `web/`.

## Common Pitfalls

1. **Forgetting `'use client'` on chart pages** → Build fails with `createContext` error
2. **Using server-side data fetching** → Static export fails
3. **Complex Tailwind selectors in print CSS** → CSS parse errors
4. **Adding images without `unoptimized: true`** → Static export fails
5. **Forgetting to add new routes to `sitemap.xml`** → SEO issue

## When Adding New Features

1. Add route in `src/app/[route]/page.tsx`
2. Add nav link in `src/components/Sidebar.tsx`
3. Update `public/sitemap.xml`
4. Update `CHANGELOG.md`
5. Build and test locally before deploying
6. Deploy with Wrangler

## External Dependencies

- **Recharts** — Charts (client-side only)
- **Lucide React** — Icons
- **clsx** — Conditional class names
- **Tailwind CSS v4** — Styling (custom `@theme inline` tokens)

## Contact

Project maintainer: akashstephen  
Repository: https://github.com/akashstephen/pedsiq
