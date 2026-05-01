# Changelog

All notable changes to PedsIQ will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-05-01

### Major Rewrite

Complete rebuild of the application from static HTML to Next.js static export.

#### Added
- **Next.js 16** application with App Router and static export
- **TypeScript** full type safety across all components
- **Interactive Dashboard** with Recharts visualizations
  - Year-over-year question trends (line chart)
  - Top chapters by count (bar chart)
  - Subject distribution (pie chart)
  - Scheme comparison
  - Stat cards with animated counts
- **Question Bank** with full-text search, year filter, and type filters
  - Search across question text, chapters, and sections
  - Filter by scheme (2010/2019) and question type (Essay/Short/MCQ)
- **Nelson Analysis** page
  - Section frequency pie chart
  - Top chapters by marks (horizontal bar chart)
  - Chapter ranking grid with question count and marks
- **Subjects** page
  - Subject distribution visualization
  - Cognitive level analysis
  - High-yield subtopics table with probability badges
- **Predictions** page with 8 predicted topics
  - Color-coded probability cards (Very High/High/Moderate)
  - Exam strategy tips section
- **Structured Answers** with 12 predicted questions
  - AGN/PSGN, Nephrotic Syndrome, Rickets (Very High)
  - Congenital Hypothyroidism, Testicular Torsion, Hematuria DDx, Hypoglycemia (High)
  - Intussusception, Portal Hypertension, HUS, Biliary Atresia, DKA (Moderate)
  - Each topic includes: definition, clinical features, investigations, management, complications
  - Tables for comparative data
  - Custom SVG flowcharts (replacing Mermaid)
  - Mnemonics boxes
  - Exam scoring checklists with mark allocation
  - A4 print styles with page breaks
- **Print functionality** — Print button on Structured Answers page
- **Responsive design** — Mobile-first with collapsible sidebar
- **SEO** — sitemap.xml, robots.txt, meta tags
- **Cloudflare Pages deployment** with global CDN

#### Changed
- Replaced Chart.js with **Recharts** for React-native integration
- Replaced Mermaid.js with **custom React/SVG flowcharts**
- Replaced static HTML files with dynamic React components
- Consolidated 4 batch JSON files into single `questions.json`

#### Removed
- Legacy static HTML dashboard (`dashboard.html`)
- Legacy static HTML structured answers (`structured-answers.html`)
- Legacy Cloudflare Worker (`worker/` directory — kept for reference)
- Mermaid.js dependency and all associated rendering bugs

#### Fixed
- Mermaid diagram rendering failures (Unicode, multiline nodes, HTML entities)
- Chart.js memory leaks in static HTML
- XSS vulnerabilities in static HTML (unsanitized innerHTML)
- Color contrast issues for accessibility
- Mobile layout overflow issues

### Data
- **411 questions** from 24 KUHS exam papers (2015–2025)
- Nelson Textbook chapter classification for all questions
- 12 predicted questions with model answers

## [1.1.0] - 2025-04-28

### Added
- 12 structured answer topics with comprehensive model answers
- A4 print styles for exam preparation
- Scoring checklists for each predicted question
- Comparison tables for similar conditions
- Mnemonics (P-E-A-S for nephrotic syndrome edema pattern)

### Changed
- Enhanced predictions with probability ratings
- Updated AGN answer with ISKD protocol details
- Added steroid-sparing agents section to nephrotic syndrome

### Fixed
- Mermaid diagram syntax errors in flowcharts
- Table formatting in structured answers

## [1.0.0] - 2025-04-25

### Added
- Initial static HTML dashboard
- Question extraction from 24 KUHS PDFs (2015–2025)
- Nelson chapter classification using fuzzy matching
- Basic analytics: year trends, top chapters, subject distribution
- 8 predicted topics for upcoming exam
- Chart.js visualizations
- Mermaid.js flowcharts
- Dark theme UI

### Data
- 411 questions extracted and classified
- 24 exam metadata records
- Coverage: 2015 April through 2025 May

---

## Upcoming

### Planned
- [ ] Mock exam generator with randomized questions
- [ ] Flashcard mode for quick revision
- [ ] Spaced repetition integration
- [ ] Service worker for offline access
- [ ] Search index (Fuse.js) for faster filtering
- [ ] Exam timeline/planner tool
- [ ] Topic bookmarking for personalized study lists
- [ ] Dark/light theme toggle
- [ ] PWA install support

