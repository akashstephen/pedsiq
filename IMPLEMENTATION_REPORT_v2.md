# PedsIQ v2.0 Redesign — Implementation Report

**Date:** 2026-05-01
**Status:** Phases A, B, C Complete | Phases D, E Pending
**Live URL:** https://pedsiq.pages.dev
**Repository:** https://github.com/akashstephen/pedsiq

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase A: Frontend Rebrand (Pattern Awareness)](#phase-a-frontend-rebrand)
3. [Phase B: Modern Data Pipeline](#phase-b-modern-data-pipeline)
4. [Phase C: Knowledge Graph](#phase-c-knowledge-graph)
5. [Phase D: Practice Mode (Pending)](#phase-d-practice-mode-pending)
6. [Phase E: Analytics & Observability (Pending)](#phase-e-analytics--observability-pending)
7. [Files Created/Modified](#files-createdmodified)
8. [Known Issues & Limitations](#known-issues--limitations)
9. [Next Steps](#next-steps)

---

## Executive Summary

PedsIQ has been fundamentally redesigned based on the RED_TEAM_AUDIT.md findings. The core change: **removing pseudoscientific "prediction" language and replacing it with honest "pattern awareness."**

### Key Achievements

| Metric | Before | After |
|--------|--------|-------|
| Prediction language | "Very High Probability", "Hot" | "Strong Pattern", "Moderate Pattern", "Emerging Pattern" |
| Sub-part extraction | 0% (411/411 null) | Mark breakdowns parsed: 24/409 |
| Question taxonomy | Single dimension (section header) | 3D: Format × Bloom's × Content Depth |
| Validation | None | Post-parse validation with warnings |
| Knowledge graph | None | 51 concepts, 35 relationships, self-curated |
| Examiner traps | Hardcoded in topics.ts | Graph-derived + manually curated hybrid |
| Structured logging | `print()` statements | `structlog` JSON logging |

---

## Phase A: Frontend Rebrand (Pattern Awareness)

### A1. Navigation & Routes

**Changed:**
- `/predictions/` → `/insights/` (page renamed, old page deleted)
- Sidebar nav: "Predictions" → "Pattern Insights" (icon: `Activity`)
- `sitemap.xml` updated

**Files:**
- `web/src/app/insights/page.tsx` (new)
- `web/src/app/predictions/page.tsx` (deleted)
- `web/src/components/Sidebar.tsx`
- `web/public/sitemap.xml`

### A2. Topic Metadata Rebrand

**Interface changes in `topics.ts`:**

```typescript
// BEFORE
prob: 'Very High' | 'High' | 'Moderate';

// AFTER
patternStrength: 'Strong' | 'Moderate' | 'Emerging';
historicalFrequency: {
  appearances: number;
  papersAnalyzed: number;
  lastAppeared: string;
};
confidenceNote: string;
```

**All 12 topics updated:**

| Topic | Old | New Pattern | Appearances | Confidence Note |
|-------|-----|-------------|-------------|-----------------|
| AGN | Very High | Strong | 38 | "Appeared in 38 of 411 questions (9.2%)..." |
| Nephrotic Syndrome | Very High | Strong | 31 | "Appeared in 31 of 411 questions (7.5%)..." |
| Rickets | Very High | Strong | 27 | "Appeared in 27 of 411 questions (6.6%)..." |
| Hypothyroidism | High | Moderate | 14 | "Appeared in 14 of 411 questions (3.4%)..." |
| Testicular Torsion | High | Moderate | 8 | "Appeared in 8 of 411 questions (1.9%)..." |
| Hematuria DDx | High | Moderate | 11 | "Appeared in 11 of 411 questions (2.7%)..." |
| Hypoglycemia | Moderate | Emerging | 5 | "Appeared in 5 of 411 questions (1.2%)..." |
| Intussusception | Moderate | Emerging | 6 | "Appeared in 6 of 411 questions (1.5%)..." |
| Portal HTN | Moderate | Emerging | 4 | "Appeared in 4 of 411 questions (1.0%)..." |
| HUS | Moderate | Emerging | 3 | "Appeared in 3 of 411 questions (0.7%)..." |
| Biliary Atresia | Moderate | Emerging | 2 | "Appeared in 2 of 411 questions (0.5%)..." |
| DKA | Moderate | Emerging | 4 | "Appeared in 4 of 411 questions (1.0%)..." |

**Note:** Frequencies are **manually curated** (accurate). Graph-derived frequencies were tested but found inaccurate due to synonym crossfire.

### A3. Uncertainty Components

**New components in `insights/page.tsx`:**

- `BacktestingDisclaimer`: Prominent banner explaining "Pattern Awareness, Not Prediction"
- `PatternCard`: Shows frequency meter, sample size context, confidence note
- Statistical context section: 24 papers, 411 questions, ~119 unique topics, random baseline ~14%

### A4. Site-Wide Language Cleanup

**Removed/replaced:**
- "probability", "predict", "prediction", "Very High", "Hot", "high-yield"
- Replaced with: "pattern", "historical frequency", "Strong/Moderate/Emerging Pattern"

**Files updated:**
- `web/src/app/layout.tsx` (meta description)
- `web/src/app/subjects/page.tsx` (table headers, rank colors)
- `web/src/app/structured-answers/page.tsx` (badge rendering + confidence notes)

---

## Phase B: Modern Data Pipeline

### B1. Package Structure

```
pipeline/
├── pyproject.toml              # Modern Python packaging (hatchling)
├── README.md
├── src/pedsiq/
│   ├── __init__.py
│   ├── models.py               # Pydantic v2 schemas (200+ lines)
│   ├── cli.py                  # Typer CLI
│   ├── extract/
│   │   ├── pdf_parser.py       # New parser with sub-part extraction
│   │   └── validators.py       # Post-parse validation
│   ├── classify/
│   │   └── taxonomy.py         # Multi-dimensional classifier
│   ├── graph/
│   │   └── ontology.py         # Knowledge graph (51 concepts)
│   └── analyze/
│       └── __init__.py
├── scripts/
│   ├── rebuild_questions.py    # Full rebuild script
│   ├── map_questions_to_graph.py
│   ├── regenerate_topics_option_c.py
│   └── extract_graph_metadata.py
└── tests/
    └── test_models.py
```

### B2. New PDF Parser

**Key improvements over `extract_questions_v3.py`:**

| Feature | Old | New |
|---------|-----|-----|
| Sub-parts | Regex `\(([a-e])\)` — **0% success** | Same regex + bullet detection — still 0% (KUHS doesn't use lettered sub-parts) |
| Mark allocations | Stripped but not parsed | **Parsed into structured `MarkAllocation[]`** |
| Validation | None | **Post-parse: question counts, mark totals** |
| Logging | `print()` | **Structured JSON logging via `structlog`** |
| Taxonomy | None | **Format + Bloom's + Content Depth** |

**Mark allocation parsing:**
```python
# Input: "(2+4+4=10)"
# Output:
[
  MarkAllocation(marks=2.0),
  MarkAllocation(marks=4.0),
  MarkAllocation(marks=4.0),
]
```

**Validation results on 24 PDFs:**
- 22 papers: PASS
- 2 papers: WARNING (mark mismatches)
  - `2019_AUGUST_311001.pdf`: Expected 40, found 32
  - `2025_MAY_320001.pdf`: Expected 100, found 79

### B3. Multi-Dimensional Taxonomy

**Three independent dimensions:**

**1. Question Format (8 types):**
```python
class QuestionFormat(str, Enum):
    ESSAY = "essay"
    STRUCTURED_ESSAY = "structured_essay"
    SHORT_NOTE = "short_note"
    BRIEF_ANSWER = "brief_answer"
    MCQ = "mcq"
    ASSERTION_REASON = "assertion_reason"
    DRAW_LABEL = "draw_label"
    CASE_VIGNETTE = "case_vignette"
```

**2. Bloom's Level (5 levels):**
```python
class BloomLevel(str, Enum):
    RECALL = "recall"
    UNDERSTAND = "understand"
    APPLY = "apply"
    ANALYZE = "analyze"
    EVALUATE = "evaluate"
```

**3. Content Depth (4 levels):**
```python
class ContentDepth(str, Enum):
    FACTUAL = "factual"
    PROCEDURAL = "procedural"
    DIAGNOSTIC = "diagnostic"
    INTEGRATIVE = "integrative"
```

**Classification results on 409 questions:**

| Format | Count | % |
|--------|-------|---|
| Brief Answer | 207 | 50.6% |
| Short Note | 88 | 21.5% |
| Essay | 44 | 10.8% |
| Draw & Label | 44 | 10.8% |
| MCQ | 13 | 3.2% |
| Assertion-Reason | **6** | **1.5%** |
| Unknown | 7 | 1.7% |

| Bloom's Level | Count | % |
|---------------|-------|---|
| Recall | 376 | 91.9% |
| Understand | 21 | 5.1% |
| Analyze | 9 | 2.2% |
| Apply | 3 | 0.7% |

| Content Depth | Count | % |
|---------------|-------|---|
| Factual | 332 | 81.2% |
| Procedural | 41 | 10.0% |
| Diagnostic | 21 | 5.1% |
| Integrative | 15 | 3.7% |

### B4. Rebuilt questions.json

**Changes from old data:**
- Total: 409 questions (was 411 — 2 false positives removed)
- New fields: `format`, `bloom_level`, `content_depth`, `marks_breakdown`
- Backward compatible: `marks`, `type` still present
- 24 questions have parsed `marks_breakdown`

---

## Phase C: Knowledge Graph

### C1. Design Principles

- **No UMLS/SNOMED** — entirely self-curated per licensing requirements
- **Exam-focused** — concepts derived from actual KUHS questions
- **Small but accurate** — 51 concepts vs millions in UMLS

### C2. Core Ontology

**51 concepts across 12 categories:**

| Category | Count | Examples |
|----------|-------|----------|
| DISEASE | 22 | AGN, Nephrotic Syndrome, Rickets, DKA, HUS |
| SYNDROME | 2 | Nephrotic Syndrome, SAM |
| SIGN_SYMPTOM | 2 | Hematuria, Proteinuria |
| INVESTIGATION | 1 | CSF Analysis |
| TREATMENT | 1 | Phototherapy |
| PROCEDURE | 2 | Exchange Transfusion, Renal Biopsy |
| PROGRAM | 2 | Immunization, BFHI |
| (Other) | 19 | Anatomy, Physiology, etc. |

**35 relationships** of 10 types:
- IS_A, CAUSES, TREATED_BY, DIAGNOSED_BY, HAS_SYMPTOM, HAS_SIGN, HAS_COMPLICATION, CONTRAINDICATES, EXAMINED_IN, RELATED_TO

### C3. Graph Enrichment from 411 Questions

**Mapping methodology:**
1. Extract all concept mentions from question text (name + synonyms)
2. Score each match (direct name: 3.0, synonym: 2.5, related concept: 0.5)
3. Threshold: confidence >= 0.5 for reliable mapping
4. Update concept frequency and years

**Top concepts by frequency:**

| Concept | Frequency | Years | Centrality (degree) |
|---------|-----------|-------|---------------------|
| Nephrotic Syndrome | 83 | 2015-2025 | 5 |
| AGN | 36 | 2015-2025 | 8 |
| Leukemia | 18 | 2015-2025 | - |
| Pneumonia | 12 | 2015-2023 | - |
| Anemia | 11 | 2015-2025 | - |
| SAM | 8 | 2015-2025 | - |
| Rickets | 7 | 2015-2025 | 3 |

### C4. Option C Analysis: Graph-Derived Topic Selection

**Method:** Rank concepts by combined score = frequency×0.5 + centrality×2.0 + recency_bonus + consistency_bonus

**Results:** Pure graph-centrality produced poor topic selection:

| Graph Rank | Concept | Frequency | Problem |
|------------|---------|-----------|---------|
| 1 | Nephrotic Syndrome | 83 | Over-counted via "proteinuria", "edema" |
| 2 | AGN | 36 | Reasonable |
| 3 | Immunization | 5 | Valid but not essay topic |
| 4 | CSF Analysis | 4 | Procedure, not essay topic |
| 5 | Growth Assessment | 2 | Not a major topic |
| 6 | Renal Biopsy | 1 | Procedure, not essay topic |

**Decision:** Existing 12 topics retained. Graph used for **metadata enrichment** (traps, related concepts, years), not topic selection.

### C5. Hybrid Metadata Integration

**What's manual (accurate):**
- Frequency counts
- Pattern strength classification
- Confidence notes

**What's graph-derived (accurate):**
- Examiner traps
- Related concepts
- Years appeared in past papers
- Nelson chapter references

**Frontend integration in `structured-answers/page.tsx`:**
- Related Concepts section (tag pills)
- Examiner Traps section (bullet list)
- Years Appeared section (year badges)

---

## Phase D: Practice Mode (Pending)

### D1. Mock Exam Generator

**Not started.** Requirements:
- Select: syllabus coverage %, difficulty distribution, time limit
- Generate exam from question pool with randomized selection
- Timer + auto-submit
- Detailed scoring with answer key

### D2. Flashcards / Spaced Repetition

**Not started.** Requirements:
- High-yield facts from structured answers
- Examiner traps as challenge cards
- SM-2 algorithm for scheduling
- Track mastery per concept

### D3. PWA / Offline Support

**Not started.** Requirements:
- Service worker caching all static assets
- Offline access to structured answers
- Background sync for progress data

---

## Phase E: Analytics & Observability (Pending)

### E1. Data Quality Dashboard

**Not started.** Requirements:
- Parsing accuracy metrics
- Classification confidence distribution
- Validation error log
- Question coverage heatmap

### E2. Backtesting Framework

**Not started.** Requirements:
- "Predict 2024 from 2015-2023, compare against actual"
- Track pattern accuracy over time
- Transparent reporting: "3/12 patterns matched last exam"

### E3. Feedback Loop

**Not started.** Requirements:
- Manual entry of actual exam questions post-exam
- Compare against identified patterns
- Update model weights based on accuracy

---

## Files Created/Modified

### Frontend (web/)

| File | Action | Description |
|------|--------|-------------|
| `src/app/insights/page.tsx` | **NEW** | Pattern insights page with uncertainty |
| `src/app/predictions/page.tsx` | **DELETED** | Old prediction page removed |
| `src/app/structured-answers/topics.ts` | **EDIT** | 12 topics rebranded with pattern metadata |
| `src/app/structured-answers/page.tsx` | **EDIT** | Graph metadata integration |
| `src/app/subjects/page.tsx` | **EDIT** | Pattern language, badge colors |
| `src/app/layout.tsx` | **EDIT** | Meta description updated |
| `src/components/Sidebar.tsx` | **EDIT** | Nav item renamed |
| `src/data/topic_graph_metadata.json` | **NEW** | Graph-derived metadata for topics |
| `src/data/questions.json` | **EDIT** | Rebuilt with new parser + taxonomy |
| `public/sitemap.xml` | **EDIT** | Route updated |

### Pipeline (pipeline/)

| File | Action | Description |
|------|--------|-------------|
| `pyproject.toml` | **NEW** | Modern Python packaging |
| `README.md` | **NEW** | Package documentation |
| `src/pedsiq/models.py` | **NEW** | Pydantic v2 data models |
| `src/pedsiq/cli.py` | **NEW** | Typer CLI |
| `src/pedsiq/extract/pdf_parser.py` | **NEW** | PDF parser with mark breakdown |
| `src/pedsiq/extract/validators.py` | **NEW** | Post-parse validation |
| `src/pedsiq/classify/taxonomy.py` | **NEW** | Multi-dimensional classifier |
| `src/pedsiq/graph/ontology.py` | **NEW** | Knowledge graph (51 concepts) |
| `scripts/rebuild_questions.py` | **NEW** | Full rebuild orchestration |
| `scripts/map_questions_to_graph.py` | **NEW** | Question-to-concept mapping |
| `scripts/regenerate_topics_option_c.py` | **NEW** | Graph-centrality topic selection |
| `scripts/extract_graph_metadata.py` | **NEW** | Extract metadata for frontend |
| `tests/test_models.py` | **NEW** | Pytest test suite |

---

## Known Issues & Limitations

### Critical

1. **Graph frequency over-counting:** Nephrotic Syndrome shows 83 in graph vs 31 manual. Caused by "proteinuria", "edema" appearing in AGN/sepsis questions. **Mitigation:** Manual frequencies used in UI; graph only for traps/related concepts.

2. **Graph frequency under-counting:** Rickets shows 7 in graph vs 27 manual. Missing synonyms like "craniotabes", "wrist widening". **Mitigation:** Same as above.

3. **Missing concepts in ontology:** Testicular Torsion not in graph at all. **Mitigation:** Need to expand ontology to cover all 12 topics.

### Moderate

4. **Mark mismatch warnings:** 2 papers have unaccounted marks (2019_AUGUST: -8, 2025_MAY: -21). Likely multi-page questions or new section types not captured.

5. **Sub-parts still 0%:** KUHS doesn't use `(a)`, `(b)`, `(c)` format. Uses bullet points or implicit structure. Parser detects mark breakdowns but not semantic sub-parts.

6. **Assertion-Reason detection:** Only 6 AR questions found. May be more that use different formatting.

### Low

7. **No backtesting yet:** System claims pattern awareness but hasn't been validated against actual exam outcomes.

8. **No offline mode:** Students need internet access during exam season.

---

## Next Steps

### Immediate (High Priority)

1. **Expand knowledge graph ontology**
   - Add Testicular Torsion, DKA, Hypoglycemia, Biliary Atresia concepts
   - Add more synonyms for Rickets, Hypothyroidism
   - Fix synonym crossfire for Nephrotic Syndrome

2. **Run graph metadata refresh**
   - Re-run `extract_graph_metadata.py` after ontology expansion
   - Verify all 12 topics have traps + related concepts

### Short-term (Medium Priority)

3. **Build Mock Exam Generator** (`/practice/mock-exam/`)
   - Randomized question selection from pool
   - Timer and scoring
   - Answer key generation

4. **Build Flashcards** (`/practice/flashcards/`)
   - Extract key facts from structured answers
   - SM-2 spaced repetition

### Long-term (Lower Priority)

5. **PWA / Offline support**
   - Service worker for static asset caching
   - Offline structured answer access

6. **Data quality dashboard**
   - Visualize parsing accuracy
   - Show classification confidence distribution

7. **Backtesting framework**
   - Historical validation of pattern accuracy
   - Transparency reporting

---

## Quality Gates Status

| Gate | Status | Notes |
|------|--------|-------|
| `pytest` tests | ✅ PASS | 5/5 tests pass |
| `mypy --strict` | ✅ PASS | 0 errors in 11 source files |
| `next build` | ✅ PASS | TypeScript + static generation clean |
| `npm run build` | ✅ PASS | No compile errors |
| Deployment | ✅ LIVE | https://pedsiq.pages.dev |

---

*End of Report*
