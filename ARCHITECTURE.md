# Architecture

## System Overview

PedsIQ is a **statically-generated web application** that transforms 24 KUHS Pediatrics exam PDFs into an interactive analytics dashboard and structured answer bank. There is no backend server, no database, and no runtime API. All data is processed at build time and served as static HTML, CSS, and JavaScript.

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA PIPELINE (Python)                    │
├─────────────────────────────────────────────────────────────┤
│  24 PDFs → Extract Text → Classify → Consolidate → JSON     │
│         (pdfplumber)   (fuzzy matching)        (build)      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  BUILD PIPELINE (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  JSON Data → React Components → Static HTML → Cloudflare    │
│  (import)    (Recharts)        (next export)   (Pages)      │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. PDF Extraction

**Input:** 24 KUHS exam PDFs (2015–2025)  
**Output:** `questions_raw.json`

The extraction script (`extract_questions_v3.py`) uses `pdfplumber` to:
- Detect page boundaries and question numbering
- Extract text while preserving structure
- Separate questions by section (Essay, Short Notes, MCQs)
- Capture metadata: year, month, scheme, QP code, total marks

**Challenges overcome:**
- Inconsistent PDF formatting across years
- Multi-page questions
- Roman numeral question numbering in some papers
- Mixed 2010 and 2019 schemes

### 2. Classification

**Input:** `questions_raw.json` + Nelson chapter reference  
**Output:** `classified_batch_*.json`

The classifier (`classify_questions_v2.py`) maps each question to:
- **Nelson Section** (e.g., "22. Nephrology and Urology")
- **Nelson Chapter** (e.g., "184. Glomerulonephritis")

Uses fuzzy string matching against Nelson chapter titles with confidence scoring. Questions with low confidence are flagged for manual review.

**Classification accuracy:** ~95% (low-confidence questions manually verified)

### 3. Consolidation

**Input:** 4 classified batch files  
**Output:** `web/src/data/questions.json`

The consolidator (`consolidate_data.py`) merges batches, deduplicates, and normalizes fields. Final JSON contains 411 questions with 16 fields each.

### 4. Build-time Processing

**Input:** `questions.json`, `metadata.json`  
**Output:** Static HTML pages

At `next build` time:
- `lib/data.ts` processes questions into analytics-ready structures
- `page.tsx` files import JSON directly (tree-shaken at build)
- Recharts renders charts to SVG in static HTML
- All pages pre-rendered with `generateStaticParams`

## Frontend Architecture

### App Router Structure

```
app/
├── layout.tsx          # Root layout: sidebar + main content
├── page.tsx            # Dashboard (default route)
├── questions/
│   └── page.tsx        # Question bank with search/filter
├── nelson/
│   └── page.tsx        # Chapter/section analytics
├── subjects/
│   └── page.tsx        # Subject distribution + subtopics
├── predictions/
│   └── page.tsx        # Predicted topics
└── structured-answers/
    ├── page.tsx        # Topic filter + article renderer
    └── topics.ts       # 12 predicted question data
```

### Component Hierarchy

```
RootLayout
├── Sidebar (client)          # Navigation, mobile toggle
│   └── NavLink
└── Main
    ├── Dashboard (client)    # Stats + Recharts
    │   ├── StatCard
    │   ├── LineChart
    │   ├── BarChart
    │   └── PieChart
    ├── Questions (client)    # Search + filters
    ├── Nelson (client)       # Charts + ranking grid
    ├── Subjects (client)     # Charts + subtopic table
    ├── Predictions (static)  # Probability cards
    └── StructuredAnswers (client)
        ├── TopicFilter
        ├── TopicArticle
        │   ├── Section
        │   ├── DataTable
        │   ├── Flowchart (SVG)
        │   └── MnemonicBox
        └── Checklist
```

### State Management

**No global state library.** Each page uses local `useState` for:
- Filter selections
- Search queries
- Mobile sidebar toggle

Data flows top-down via props. No context providers needed because:
- Data is static (no mutations)
- Pages are independent
- No shared state across routes

### Styling Architecture

**Tailwind CSS v4** with custom design tokens in `globals.css`:

```css
@theme inline {
  --color-background: #000000;
  --color-foreground: #ffffff;
  --color-surface: #0a0a0a;
  --color-accent: #007AFF;
  --color-success: #34C759;
  --color-warning: #FF9500;
  --color-danger: #FF3B30;
  --color-glass: rgba(255,255,255,0.03);
  --color-glass-border: rgba(255,255,255,0.08);
}
```

Design principles:
- **Dark-first:** All components built for dark backgrounds
- **Glass morphism:** Subtle transparency (`bg-white/[0.03]`) for depth
- **Print-aware:** `@media print` rules in globals.css convert to light theme
- **Responsive:** Mobile-first with `md:` breakpoints

### Chart Architecture

**Recharts** renders at build time into inline SVG:

```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={yearlyData}>
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
    <YAxis stroke="rgba(255,255,255,0.3)" />
    <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
    <Line type="monotone" dataKey="value" stroke="#007AFF" strokeWidth={2.5} dot={{ r: 4, fill: '#007AFF', strokeWidth: 0 }} />
  </LineChart>
</ResponsiveContainer>
```

Key decisions:
- Charts are client components (`'use client'`) because Recharts uses DOM APIs
- Custom tooltip styling matches dark theme
- No animation on initial render (static export limitation)

### Flowchart Architecture

Custom React component (`components/Flowchart.tsx`) replaces Mermaid:

```tsx
<Flowchart
  nodes={[
    { id: 'a', label: 'Strep throat', type: 'start' },
    { id: 'b', label: 'Immune complex formation' },
    { id: 'c', label: 'Edema + HTN + Oliguria', type: 'end' },
  ]}
  edges={[
    { from: 'a', to: 'b' },
    { from: 'b', to: 'c' },
  ]}
/>
```

Algorithm:
1. Topological level assignment (BFS from root nodes)
2. Group nodes by level into rows
3. Render rows vertically with arrow connectors
4. Style nodes by type (start/process/decision/end)

Advantages over Mermaid:
- No runtime parsing (deterministic output)
- Type-safe node/edge definitions
- Printable (SVG-based)
- Accessible (semantic HTML)

## Data Schema

### ExamQuestion

```typescript
interface ExamQuestion {
  section: string;           // "Essay", "Short Notes", "MCQs"
  question_number: number | string;  // 1, 2, 3... or "i", "ii"...
  question_text: string;     // Full question text
  marks: number;             // Individual question marks
  sub_parts: string | null;  // Sub-question breakdown (e.g., "2+4+4")
  type: string;              // "essay", "short_notes", "mcq"
  exam_year: number;
  exam_month: string;        // "April", "September", etc.
  scheme: string;            // "2010" or "2019"
  qp_code: string;           // "311001" or "320001"
  total_marks: number;       // Total marks for that exam paper
  filename: string;          // Source PDF filename
  nelson_section: string;    // "22. Nephrology and Urology"
  nelson_chapter: string;    // "184. Glomerulonephritis"
}
```

### ExamMetadata

```typescript
interface ExamMetadata {
  filename: string;
  qp_code: string;
  year: number;
  month: string;
  scheme: string;
  total_marks: number;
  duration: number;          // Hours
  exam_type: string | null;  // "Theory" or null
}
```

### Topic (Structured Answer)

```typescript
interface Topic {
  id: string;                // URL slug
  shortTitle: string;        // Button label
  prob: 'Very High' | 'High' | 'Moderate';
  subject: string;
  examType: string;
  question: string;          // Predicted question text
  marksBreakdown: string;    // Mark allocation
  sections: TopicSection[];
  checklist?: string[];      // Scoring checklist
}

interface TopicSection {
  title: string;
  text?: string;             // HTML content
  list?: string[];           // Bullet points
  table?: { headers: string[]; rows: string[][] };
  flowchart?: { nodes: FlowchartNode[]; edges: FlowchartEdge[] };
  mnemonic?: { title: string; text: string };
}
```

## Build Configuration

### next.config.ts

```typescript
const nextConfig: NextConfig = {
  output: 'export',        // Static HTML export
  distDir: 'dist',         // Output directory
  images: { unoptimized: true },  // Required for static export
  trailingSlash: true,     // /questions/ instead of /questions.html
};
```

### Why Static Export?

| Factor | Static Export | SSR | SPA |
|--------|--------------|-----|-----|
| Hosting cost | Free (Cloudflare Pages) | Paid (Worker/Node) | Free |
| Initial load | Instant (pre-rendered HTML) | Slow (server render) | Medium (hydration) |
| SEO | Excellent | Excellent | Poor |
| Data updates | Rebuild + redeploy | Instant | Instant |
| Offline support | Yes (service worker) | No | Partial |

For PedsIQ, static export is optimal because:
- Data changes infrequently (once per exam cycle)
- No user-generated content
- No authentication required
- Performance is critical for mobile study sessions

## Deployment Architecture

### Cloudflare Pages

```
Developer Machine
      │
      │ npm run build
      ▼
   web/dist/
      │
      │ wrangler pages deploy
      ▼
Cloudflare Pages CDN
      │
      ├── Global edge caching
      ├── Automatic HTTPS
      └── Custom domain support
```

**Deployment steps:**
1. Build static files: `npm run build`
2. Deploy: `npx wrangler pages deploy dist --project-name pedsiq`
3. Cloudflare serves from 300+ edge locations worldwide

**Performance:**
- First Contentful Paint: ~200ms
- Time to Interactive: ~500ms
- Lighthouse score: 95+ (Performance, Accessibility, Best Practices, SEO)

## Security Considerations

### XSS Prevention
- No user input accepted (read-only site)
- `dangerouslySetInnerHTML` used only for trusted structured answer content
- All JSON data is static and reviewed

### Content Security Policy
Recommended headers for production:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
```

### No Authentication
- No login system
- No cookies or local storage
- No tracking scripts
- Fully privacy-respecting

## Performance Budget

| Metric | Target | Current |
|--------|--------|---------|
| First Load JS | < 200 KB | ~180 KB |
| Total page weight | < 500 KB | ~350 KB |
| Time to First Byte | < 100 ms | ~50 ms (Cloudflare) |
| Largest Contentful Paint | < 2.5 s | ~1.2 s |
| Cumulative Layout Shift | < 0.1 | 0 |

## Future Architecture Considerations

### Potential Additions
1. **Service Worker** — Offline caching for structured answers
2. **Incremental Static Regeneration** — Update predictions without full rebuild
3. **Search Index** — Fuse.js for client-side full-text search (currently O(n) filter)
4. **Analytics** — Privacy-preserving analytics (Plausible or Cloudflare Web Analytics)

### Scaling
- Current: 411 questions, ~50 KB JSON
- Can handle: 10,000+ questions (~1 MB JSON) without performance issues
- If data grows beyond 5 MB: Consider splitting JSON by year or section

## File Size Breakdown

```
web/dist/
├── index.html              # 23 KB (Dashboard)
├── questions/index.html    # 180 KB (largest - all questions inline)
├── nelson/index.html       # 15 KB
├── subjects/index.html     # 18 KB
├── predictions/index.html  # 12 KB
├── structured-answers/     # 45 KB (12 topics)
│   └── index.html
├── _next/static/
│   ├── css/                # 15 KB
│   ├── js/                 # 120 KB (React + Recharts + runtime)
│   └── media/              # 30 KB (Inter font)
└── Total: ~470 KB
```
