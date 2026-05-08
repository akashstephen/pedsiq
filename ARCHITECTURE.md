# Architecture

## System Overview

PedsIQ is a **statically-generated web application** that transforms 24 KUHS Pediatrics exam PDFs into an interactive analytics dashboard, structured answer bank, MCQ practice system, and gamified learning arcade. There is no backend server, no database, and no runtime API. Core data is processed at build time and served as static HTML, CSS, and JavaScript; quiz and arcade progress are stored locally in the browser.

The system has three conceptual layers:
1. **Analytics Layer** — Pattern insights, question bank, Nelson analysis
2. **Study Layer** — Structured answers plus MCQ practice with explanations and local mastery tracking
3. **Arcade Layer** — Neuroscience-backed gamified modules for active recall, dosing mastery, protocol sequencing, and examiner-trap detection

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
│  (import)    (Recharts/Arcade) (next export)   (Pages)      │
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

The consolidator (`consolidate_data.py`) merges batches, deduplicates, and normalizes fields. Final JSON contains 409 questions with 16 fields each; two false positives from earlier extraction passes have been removed.

### 4. Build-time Processing

**Input:** `questions.json`, `metadata.json`  
**Output:** Static HTML pages

At `next build` time:
- `lib/data.ts` processes questions into analytics-ready structures
- `page.tsx` files import JSON directly (tree-shaken at build)
- Recharts renders charts to SVG in static HTML
- Pages are statically exported by the Next.js App Router; data is available at build time through JSON imports.

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
├── insights/
│   └── page.tsx        # Pattern insights with uncertainty
├── structured-answers/
│   ├── page.tsx        # Topic filter + article renderer
│   └── topics.ts       # 46 predicted question data
├── quiz/
│   ├── page.tsx        # MCQ launcher, quick modes, custom sessions
│   ├── session/        # Active quiz session route
│   └── results/        # Session scoring and review
├── mcq-review/
│   └── page.tsx        # Browse all MCQs with explanations
└── arcade/
    ├── page.tsx        # Arcade launcher hub
    ├── dose-duel/
    │   ├── page.tsx    # Timed dosing recall game
    │   ├── hooks/      # useDoseDuelEngine
    │   └── data/
    │       └── questions.json
    ├── dose-sniper/
    │   ├── page.tsx    # Falling-card dose discrimination game
    │   ├── hooks/      # useSniperEngine (rAF-based)
    │   └── data/
    │       └── questions.json
    ├── feature-wars/
    │   ├── page.tsx    # Differential diagnosis sorting game
    │   ├── hooks/      # useFeatureWarsEngine
    │   └── data/
    │       └── battles.json
    ├── protocol-builder/
    │   ├── page.tsx    # Pediatric protocol reconstruction game
    │   └── data/
    │       └── protocols.json
    └── trap-defuser/
        ├── page.tsx    # Examiner trap detection game
        └── data/
            └── cards.json
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
    ├── Insights (static)     # Pattern cards with uncertainty
    ├── StructuredAnswers (client)
    │   ├── TopicFilter
    │   ├── TopicArticle
    │   │   ├── Section
    │   │   ├── DataTable
    │   │   ├── Flowchart (SVG)
    │   │   └── MnemonicBox
    │   └── Checklist
    ├── Quiz (client)
    │   ├── Launcher
    │   ├── Active session
    │   └── Results / review
    ├── McqReview (client)
    │   └── Searchable explanation browser
    └── Arcade (client)
        ├── ArcadeLauncher      # Hub with game cards + stats
        ├── DoseDuelGame
        │   ├── SplashScreen
        │   ├── HUD (timer/score/streak)
        │   ├── PatientCard
        │   ├── OptionGrid
        │   └── ResultsScreen
        ├── DoseSniperGame
        │   ├── SplashScreen
        │   ├── CountdownOverlay
        │   ├── HUD (score/combo/velocity)
        │   ├── FallZone (rAF loop)
        │   └── ResultsScreen
        ├── FeatureWarsGame
        │   ├── SplashScreen
        │   ├── BattleBoard
        │   ├── DiseaseColumns
        │   ├── FeatureCards
        │   └── ResultsScreen
        ├── ProtocolBuilderGame
        │   ├── SplashScreen
        │   ├── Protocol reconstruction board
        │   └── ResultsScreen
        └── TrapDefuserGame
            ├── SplashScreen
            ├── Timed trap/correct deck
            └── ResultsScreen
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

**Quiz Exception:** The MCQ system persists `UserProfile`, active sessions, and spaced-repetition items in localStorage through `lib/storage.ts`. This is still client-only; no profile data leaves the browser.

**Arcade Exception:** Dose Duel, Dose Sniper, and Feature Wars use self-contained engine hooks (`useDoseDuelEngine`, `useSniperEngine`, `useFeatureWarsEngine`) that encapsulate game loop state, score tracking, and question progression. Protocol Builder and Trap Defuser keep their game state in their page components. All arcade state is isolated from the core app except for local profile persistence.

**Arcade Persistence:** `lib/arcade-storage.ts` manages `ArcadeProfile` in a separate localStorage key (`pedsiq_arcade_v1`), isolated from the MCQ `UserProfile` (`pedsiq_user_v1`). This separation is intentional: arcade metrics (time pressure, combos, accuracy) differ fundamentally from quiz accuracy tracking.

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
  patternStrength: 'Strong' | 'Moderate' | 'Emerging';
  subject: string;
  examType: string;
  question: string;          // Predicted question text
  marksBreakdown: string;    // Mark allocation
  sections: TopicSection[];
  checklist?: string[];      // Scoring checklist
  historicalFrequency?: {
    appearances: number;
    papersAnalyzed: number;
    lastAppeared: string;
  };
  confidenceNote?: string;
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

### Arcade Types

```typescript
type ArcadeGameId = 'dose-duel' | 'dose-sniper' | 'feature-wars' | 'protocol-builder' | 'trap-defuser';

interface ArcadeProfile {
  version: 1;
  games: Record<ArcadeGameId, GameStats>;
  createdAt: string;
  lastPlayedAt: string;
}

interface GameStats {
  highScore: number;
  totalSessions: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  bestCombo: number;
  bestAccuracy: number;
  lastPlayedAt: string;
  studyList: StudyListItem[];
}

interface StudyListItem {
  questionId: string;
  gameId: ArcadeGameId;
  text: string;
  correctAnswer: string;
  explanation: string;
  trap?: string;
  addedAt: string;
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
| Offline support | Static assets after browser cache | No | Partial |

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
- No user-submitted content is sent to a server or rendered from external sources
- Search filters, quiz answers, and arcade actions remain client-side
- `dangerouslySetInnerHTML` used only for trusted structured answer content
- All JSON data is static and reviewed

### Content Security Policy
Recommended headers for production:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
```

### Local Persistence
- MCQ profile and active session: `pedsiq_user_v1` / `pedsiq_active_session_v1`
- Arcade profile and missed-question study lists: `pedsiq_arcade_v1`
- Data stays local to the browser; there is no sync service.

### No Authentication
- No login system
- No cookies
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
| Arcade input latency | < 50 ms | ~16 ms (rAF) |
| Dose Sniper frame rate | 60 fps | 60 fps (rAF + refs) |
| Arcade bundle per game | < 50 KB gzipped | ~35 KB |

## Future Architecture Considerations

### Potential Additions
1. **Service Worker** — Offline caching for structured answers and arcade assets
2. **Incremental Static Regeneration** — Update insights without full rebuild
3. **Search Index** — Fuse.js for client-side full-text search (currently O(n) filter)
4. **Analytics** — Privacy-preserving analytics (Plausible or Cloudflare Web Analytics)
5. **Adaptive Difficulty** — Dynamic timer velocity and question selection based on player accuracy curves
6. **SM-2 Spaced Repetition** — Scheduled review intervals for arcade study-list items
7. **Mock Exam Generator** — Randomized exam generation with timer and scoring

### Scaling
- Current: 409 PYQs, 250 MCQs, 46 structured topics, and arcade JSON
- Can handle: 10,000+ questions (~1 MB JSON) without performance issues
- If data grows beyond 5 MB: Consider splitting JSON by year or section
- Arcade data: 56 Dose Duel questions, 55 Dose Sniper rounds, 8 Feature Wars battles / 74 features, 10 Protocol Builder protocols / 76 steps, and 392 Trap Defuser cards

## File Size Breakdown

```
web/dist/
├── index.html              # 23 KB (Dashboard)
├── questions/index.html    # 180 KB (largest - all questions inline)
├── nelson/index.html       # 15 KB
├── subjects/index.html     # 18 KB
├── insights/index.html     # 12 KB
├── structured-answers/     # 120 KB (46 topics)
│   └── index.html
├── _next/static/
│   ├── css/                # 15 KB
│   ├── js/                 # 120 KB (React + Recharts + runtime)
│   └── media/              # 30 KB (Inter font)
└── Total: ~470 KB
```
