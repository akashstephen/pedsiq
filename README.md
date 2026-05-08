# PedsIQ — KUHS Pediatrics Exam Intelligence

> A comprehensive analytics dashboard and structured answer bank for KUHS (Kerala University of Health Sciences) Pediatrics theory exams. Built with Next.js, deployed on Cloudflare Pages.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4)](https://tailwindcss.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-deployed-F38020)](https://pages.cloudflare.com/)

## Live Site

**https://pedsiq.pages.dev**

## What is PedsIQ?

PedsIQ is a specialized study tool for medical students preparing for KUHS Pediatrics theory examinations. It analyzes **409 previous year questions (2015–2025)** across **24 exam papers** to provide:

- **Question Bank** — Browse, search, and filter all PYQs by year, scheme, section, and topic
- **Nelson Analysis** — Ranked chapter and section frequency charts based on the Nelson Textbook of Pediatrics
- **Subject Analytics** — Distribution of questions across Gastroenterology, Nephrology, Endocrinology, and other subjects
- **Pattern Insights** — Historical frequency and trend analysis for topic prioritization
- **Structured Answers** — 46 predicted questions with model answers, scoring checklists, flowcharts, tables, and mnemonics formatted for A4 printing
- **MCQ Practice** — 250 clinically validated MCQs with custom sessions, weak-topic targeting, repeat-wrong mode, explanations, and local progress tracking
- **Arcade** — Five neuroscience-backed gamified learning modules for active recall, dosing mastery, protocol sequencing, and examiner-trap detection

## Tech Stack

### Frontend
- **Next.js 16** — App Router with static export
- **React 19** — Server and Client Components
- **TypeScript** — Full type safety
- **Tailwind CSS v4** — Utility-first styling with custom dark theme tokens
- **Recharts** — Interactive data visualization (line, bar, pie charts)
- **Lucide React** — Icon library

### Arcade (Gamified Learning)
- **Dose Duel** — 56 timed dosing MCQs (12s/question) targeting retrieval practice, generation effect, and arousal-mediated encoding
- **Dose Sniper** — 55 falling-card dose-discrimination rounds targeting visuomotor integration and dual coding
- **Feature Wars** — 8 differential-diagnosis battles with 74 features targeting elaborative interrogation and semantic discrimination
- **Protocol Builder** — 10 management algorithms with 76 scrambled steps targeting generation effect and spatial sequencing
- **Trap Defuser** — 392 trap/correct cards targeting hypercorrection, confidence calibration, and examiner-trap memory
- **Neuroscience-backed design** — Every mechanic maps to evidence-based learning principles (see [NEUROSCIENCE.md](NEUROSCIENCE.md))

### Data Pipeline
- **Python 3** — PDF extraction, question classification, data processing
- **pdfplumber** — PDF text extraction
- **Custom classifiers** — Nelson Textbook chapter and section mapping

### Deployment
- **Cloudflare Pages** — Static site hosting with global CDN
- **Wrangler** — Deployment CLI

## Project Structure

```
Pediatrics Exam/
├── web/                          # Next.js application
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── page.tsx          # Dashboard (home)
│   │   │   ├── questions/        # Question bank
│   │   │   ├── nelson/           # Nelson chapter analysis
│   │   │   ├── subjects/         # Subject distribution
│   │   │   ├── insights/         # Pattern insights
│   │   │   ├── structured-answers/  # Model answers (46 topics)
│   │   │   ├── quiz/             # MCQ practice launcher/session/results
│   │   │   ├── mcq-review/       # Browse all MCQs with explanations
│   │   │   └── arcade/           # Gamified learning modules
│   │   │       ├── page.tsx      # Arcade launcher
│   │   │       ├── dose-duel/    # Timed dosing MCQs
│   │   │       ├── dose-sniper/  # Falling-card game
│   │   │       ├── feature-wars/ # Differential diagnosis sorting
│   │   │       ├── protocol-builder/ # Algorithm reconstruction
│   │   │       └── trap-defuser/ # Examiner trap detection
│   │   ├── components/           # React components
│   │   ├── hooks/                # Quiz and arcade session hooks
│   │   ├── lib/                  # Data, analytics, storage, arcade effects
│   │   ├── types/                # MCQ and arcade TypeScript schemas
│   │   └── data/                 # Static JSON data
│   ├── public/                   # Static assets
│   └── next.config.ts            # Static export config
├── pipeline/                     # Modern Python data pipeline
├── worker/                       # Legacy Cloudflare Worker (reference)
├── *.py                          # Data extraction and classification scripts
├── *.json                        # Raw and classified question data
└── *.html                        # Legacy static files (reference)
```

## Data Architecture

The application is built on a static data pipeline:

1. **PDF Extraction** (`extract_questions_v3.py`) — Extracts text from 24 KUHS exam PDFs
2. **Classification** (`classify_questions_v2.py`) — Maps each question to Nelson chapters and sections using fuzzy matching
3. **Consolidation** (`consolidate_data.py`) — Merges 4 classified batches into a single JSON
4. **Build-time Integration** — `questions.json` and `metadata.json` are imported at build time

This approach means:
- **Zero runtime database** — Everything is statically rendered
- **Instant page loads** — No API calls, no loading states
- **Client-side persistence** — Quiz and arcade progress are stored in browser localStorage
- **Easy updates** — Re-run Python scripts, rebuild, redeploy

## Key Features

### Dashboard
- Year-over-year question trend line chart
- Top 10 chapters by question count (bar chart)
- Subject distribution pie chart
- Scheme comparison (2010 vs 2019)
- Stat cards: total questions, marks, sections, years covered

### Question Bank
- Full-text search across question text, chapters, and sections
- Filter by exam year, scheme (2010/2019), and question type (Essay/Short Note/MCQ)
- 409 questions with metadata: year, month, marks, section, chapter

### MCQ Practice
- 250 clinically validated MCQs across gastroenterology, nephrology, and endocrinology
- Quick modes: Quick 10, Weak Topics, Repeat Wrong, Unlimited
- Custom sessions by topic, difficulty, and question count
- Per-question explanations with correct-answer rationale, misconception, and key takeaway
- Local progress profile: attempts, topic mastery, session history, and active-session resume

### Nelson Analysis
- Section frequency pie chart
- Top 15 chapters by marks (horizontal bar chart)
- Chapter ranking grid with question count and marks

### Subjects
- Subject distribution pie chart
- Cognitive level distribution (Recall/Conceptual/Clinical/Multi-step)
- High-yield subtopics table with pattern strength badges

### Pattern Insights
- Historical frequency analysis with pattern strength ratings (Strong / Moderate / Emerging)
- Statistical context and confidence notes
- Exam strategy tips
- Color-coded pattern cards

### Arcade
Five neuroscience-backed gamified modules for active recall:

- **Dose Duel** — 56 timed dosing questions (12s each). Score = 10 + remaining seconds. Targets retrieval practice, generation effect, and arousal-mediated encoding.
- **Dose Sniper** — 55 rounds of falling-card dose discrimination. Combo multipliers up to 4×. Targets visuomotor integration and dual coding.
- **Feature Wars** — 8 battles / 74 features of multi-column differential diagnosis sorting. Correct +10 / Wrong -5. Targets elaborative interrogation and semantic discrimination.
- **Protocol Builder** — 10 pediatric management protocols / 76 steps. Correct first-try placements score highest; wrong placements subtract points. Targets generation effect and spatial encoding.
- **Trap Defuser** — 392 timed trap/correct cards (8s each). Rewards calibrated judgment and captures missed traps for review. Targets hypercorrection and error-driven learning.

All games include:
- Per-session shuffled questions
- In-session streak/combo feedback plus persisted high scores, session counts, accuracy bests, and study lists
- Auto-generated study list from missed questions
- Static JSON data and local browser persistence

### Structured Answers
- 46 predicted questions with comprehensive model answers (representative sample):
  1. AGN / PSGN (Strong Pattern)
  2. Nephrotic Syndrome (Strong Pattern)
  3. Rickets (Strong Pattern)
  4. Congenital Hypothyroidism (Moderate Pattern)
  5. Testicular Torsion (Moderate Pattern)
  6. Hematuria Differential (Moderate Pattern)
  7. Neonatal Hypoglycemia (Moderate Pattern)
  8. PKU (Emerging Pattern)
  9. Polyuria & Diabetes Insipidus (Emerging Pattern)
  10. Renal Biopsy in Children (Emerging Pattern)
  11. UTI Imaging in Children (Emerging Pattern)
  12. ACTH & HPA Axis Disorders (Emerging Pattern)
  
  ...plus 34 additional topics covering nephrology, gastroenterology, endocrinology, neonatology, and more

Each answer includes:
- Definition and etiology
- Clinical features with mnemonics
- Investigation tables
- Management flowcharts (React/SVG-based, no Mermaid)
- Complications and prognosis
- **Examiner traps** — Common mistakes that cost marks
- **Related concepts** — Knowledge graph-derived connections
- **Years appeared** — Historical occurrence tracking
- **Exam scoring checklist** — Point-by-point mark allocation
- **A4 print styles** — Hide sidebar, white background, proper page breaks

## Development

### Prerequisites
- Node.js 20+
- Python 3.11+ (for data pipeline only)

### Install Dependencies
```bash
cd web
npm install
```

### Run Development Server
```bash
cd web
npm run dev
```
Open http://localhost:3000

### Build for Production
```bash
cd web
npm run build
```
Output is generated in `web/dist/` for static hosting.

### Deploy to Cloudflare Pages
```bash
cd web
npm run build
npx wrangler pages deploy dist --project-name pedsiq --branch main
```

## Data Pipeline (Optional)

To regenerate the question database from PDFs:

```bash
# Extract questions from PDFs
python extract_questions_v3.py

# Classify by Nelson chapters
python classify_questions_v2.py

# Consolidate batches
python consolidate_data.py

# Copy to web/src/data/
cp consolidated_questions.json web/src/data/questions.json
```

## Learning Science

PedsIQ Arcade is designed around evidence-based cognitive neuroscience principles:

- **Retrieval Practice** — Active recall strengthens memory traces more than passive re-reading
- **Generation Effect** — Self-generated answers create deeper encoding
- **Arousal-Mediated Encoding** — Time pressure optimizes hippocampal consolidation
- **Dual Coding** — Visual + verbal channels create redundant memory traces
- **Elaborative Interrogation** — "Why" reasoning integrates knowledge into schemas
- **Spaced Repetition** — Study list from missed questions enables distributed practice
- **Interleaving** — Mixed topics within sessions improve discriminative learning

See [NEUROSCIENCE.md](NEUROSCIENCE.md) for the full technical breakdown with neural circuits, evidence, and design constraints.

## Architecture Decisions

### Why Static Export?
The data is entirely static (409 PYQs, 250 MCQs, 46 structured-answer topics, and arcade JSON data). A static export eliminates:
- Server costs
- Database maintenance
- API latency
- Cold starts

### Why No Mermaid?
Initial attempts used Mermaid.js for flowcharts, but encountered persistent rendering bugs with:
- Multiline node labels
- Unicode characters
- HTML entities in text
- Browser-specific rendering issues

Replaced with **custom React/SVG flowcharts** that are:
- Deterministic (no runtime parsing)
- Type-safe
- Printable
- Accessible

### Why Recharts over Chart.js?
- Native React integration (no imperative API)
- Lighter bundle for the charts we need
- Better TypeScript support
- Easier custom tooltip styling for dark themes

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 15+
- Mobile browsers (iOS Safari, Chrome Android)

## Print Support

The **Structured Answers** page includes a **Print** button that:
- Hides the sidebar
- Switches to white background
- Adds page breaks between topics
- Formats tables with borders
- Optimizes font sizes for A4 paper

Works best in Chrome/Edge print-to-PDF.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)

## Acknowledgments

- **Nelson Textbook of Pediatrics** — Chapter and section classification reference
- **KUHS** — Exam question papers (2015–2025)
- **Open source community** — Next.js, React, Tailwind, Recharts, Lucide
- **Cognitive neuroscience research** — Roediger & Karpicke (retrieval practice), Bjork (desirable difficulties), Paivio (dual coding), Custers et al. (illness scripts)

---

*Built with precision for medical students. Not affiliated with KUHS or Nelson publishers.*
