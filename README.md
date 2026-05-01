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

PedsIQ is a specialized study tool for medical students preparing for KUHS Pediatrics theory examinations. It analyzes **411 previous year questions (2015–2025)** across **24 exam papers** to provide:

- **Question Bank** — Browse, search, and filter all PYQs by year, scheme, section, and topic
- **Nelson Analysis** — Ranked chapter and section frequency charts based on the Nelson Textbook of Pediatrics
- **Subject Analytics** — Distribution of questions across Gastroenterology, Nephrology, Endocrinology, and other subjects
- **Exam Predictions** — High-probability topic predictions for upcoming exams with probability ratings
- **Structured Answers** — 12 predicted questions with model answers, scoring checklists, flowcharts, tables, and mnemonics formatted for A4 printing

## Tech Stack

### Frontend
- **Next.js 16** — App Router with static export
- **React 19** — Server and Client Components
- **TypeScript** — Full type safety
- **Tailwind CSS v4** — Utility-first styling with custom dark theme tokens
- **Recharts** — Interactive data visualization (line, bar, pie charts)
- **Lucide React** — Icon library

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
│   │   │   ├── predictions/      # Exam predictions
│   │   │   └── structured-answers/  # Model answers (12 topics)
│   │   ├── components/           # React components
│   │   ├── lib/                  # Data utilities and types
│   │   └── data/                 # Static JSON data
│   ├── public/                   # Static assets
│   └── next.config.ts            # Static export config
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
- **Offline capable** — Entire site works without internet after first load
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
- 411 questions with metadata: year, month, marks, section, chapter

### Nelson Analysis
- Section frequency pie chart
- Top 15 chapters by marks (horizontal bar chart)
- Chapter ranking grid with question count and marks

### Subjects
- Subject distribution pie chart
- Cognitive level distribution (Recall/Conceptual/Clinical/Multi-step)
- High-yield subtopics table with probability badges

### Predictions
- 8 predicted topics with probability ratings (Very High / High / Moderate)
- Exam strategy tips
- Color-coded probability cards

### Structured Answers
- 12 predicted questions with comprehensive model answers:
  1. AGN / PSGN (Very High)
  2. Nephrotic Syndrome (Very High)
  3. Rickets (Very High)
  4. Congenital Hypothyroidism (High)
  5. Testicular Torsion (High)
  6. Hematuria Differential (High)
  7. Neonatal Hypoglycemia (High)
  8. Intussusception (Moderate)
  9. Portal Hypertension (Moderate)
  10. HUS (Moderate)
  11. Biliary Atresia (Moderate)
  12. DKA Management (Moderate)

Each answer includes:
- Definition and etiology
- Clinical features with mnemonics
- Investigation tables
- Management flowcharts (React/SVG-based, no Mermaid)
- Complications and prognosis
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

## Architecture Decisions

### Why Static Export?
The data is entirely static (411 questions, 24 exams). A static export eliminates:
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

---

*Built with precision for medical students. Not affiliated with KUHS or Nelson publishers.*
