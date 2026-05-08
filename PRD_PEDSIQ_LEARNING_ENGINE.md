# PRD: PedsIQ Learning Engine

**Version:** 1.1  
**Date:** 2026-05-08  
**Status:** Red-team revised  
**Owner:** Akash Stephen  
**Product Codename:** PedsIQ Learning Engine  

---

## 1. Executive Summary

PedsIQ must evolve from a KUHS previous-year-question analyzer into a neuroscience-informed pediatrics learning operating system. The current product already contains valuable raw material: PYQ analytics, structured long answers, MCQ practice, arcade-style retrieval games, local progress tracking, and a documented neuroscience rationale. The next product phase should reframe these capabilities around mastery of pediatrics rather than analysis of exam papers.

The new PedsIQ should teach pediatric medicine through a loop:

```text
Understand -> Retrieve -> Reason -> Apply -> Correct -> Consolidate
```

The product should feel like a premium clinical learning environment: calm, intelligent, memorable, visual, and built around pediatric reasoning. KUHS exam intelligence remains important, but it becomes one layer inside the product rather than the main identity.

---

## 1A. Red-Team Audit Summary

This PRD was reviewed against product feasibility, medical-education risk, technical constraints, and current codebase reality. The original direction was strong but too broad for a single implementation cycle. It also risked making mastery and neuroscience claims that the product cannot yet prove.

### 1A.1 Critical Findings

| Severity | Finding | Risk | Required Change |
|----------|---------|------|-----------------|
| Critical | MVP scope was too broad: Today, Learn, Cases, Notebook, Progress, Mastery Map, redesign, and route migration at once | High chance of partial rebuild with no coherent release | Define a smaller Release 1 that proves the new shell, Today page, topic map, and Retrieval Lab redesign before Cases/Mastery Map |
| Critical | "Neuroscience-backed" can overclaim efficacy | Trust and ethical risk if phrased as guaranteed learning outcome | Use "neuroscience-informed" in UI where appropriate; reserve "backed" for documented principles, not outcome claims |
| Critical | Mastery scores can become fake precision without enough data | Product may mislead students about competence | Add confidence bands and "insufficient data" states; use activity coverage before mastery when attempts are low |
| High | Route migration was ambiguous and may break static export | Broken links or unsupported redirect assumptions | Preserve old routes as wrapper pages during transition; do not rely on server redirects |
| High | Light-theme overhaul could erase current arcade identity and print quality | Visual inconsistency and regression | Use dual-mode design: clinical-light shell, dark Retrieval Lab, print-specific answer styles |
| High | Content governance was missing | Medical inaccuracies can scale through new topic/case system | Add source, reviewer, confidence, and safety metadata for every authored learning object |
| Medium | "Cases" as primary nav before content exists creates empty-product smell | User trust loss | Move Cases to Phase 2 unless at least 10 reviewed cases ship |
| Medium | Recommendation engine depends on topic mapping not yet built | Recommendations may be noisy or arbitrary | Topic map and content-to-topic links are a prerequisite for recommendations |
| Medium | Metrics assume no telemetry but list product analytics | Local-only app cannot measure aggregate usage | Split local learner metrics from future opt-in aggregate analytics |

### 1A.2 PRD Corrections Made

This revised PRD adds:

- Explicit release gates.
- Smaller Release 1 scope.
- Locked product decisions.
- Local-only analytics distinction.
- Content governance model.
- Medical safety language.
- Static-export route migration strategy.
- Mastery confidence states.
- Design-system implementation guardrails.

---

## 2. Product Vision

### 2.1 Vision Statement

PedsIQ is a neuroscience-informed pediatrics mastery platform that helps medical students learn, retrieve, reason, and retain pediatric knowledge through structured teaching, clinical reasoning, active recall, adaptive practice, and high-intensity memory games.

Public-facing copy may use "neuroscience-backed" only when referring to specific learning principles documented in `NEUROSCIENCE.md` such as retrieval practice, spacing, interleaving, dual coding, hypercorrection, and elaborative interrogation. It must not imply guaranteed exam scores or clinical performance improvement.

### 2.2 Positioning

Current positioning:

> KUHS Pediatrics Exam Intelligence and PYQ Analyzer.

Target positioning:

> A pediatrics learning engine built on retrieval practice, illness-script reasoning, and memory science.

### 2.3 Product Promise

PedsIQ should help a student answer three questions every day:

1. What should I study next?
2. Why am I weak there?
3. What activity will strengthen that exact weakness?

### 2.4 Product Pillars

| Pillar | Meaning | Product Expression |
|--------|---------|--------------------|
| Mastery | Pediatrics as a connected curriculum, not a pile of exam questions | Concept atlas, mastery map, system dashboards |
| Retrieval | Memory strengthens through active recall | MCQs, Dose Duel, daily review queue |
| Reasoning | Clinical expertise depends on illness scripts and discrimination | Feature Wars, cases, differential diagnosis tools |
| Sequencing | Management is procedural and ordered | Protocol Builder, flowcharts, emergency algorithms |
| Error Correction | Mistakes are the strongest learning moments | Trap Defuser, missed-list review, misconception tracking |
| Exam Readiness | Historical exam data informs prioritization, not prediction | Exam Mode, PYQ patterns, structured answers |

---

## 3. Target Users

### 3.1 Primary User

Final-year MBBS students preparing for pediatrics theory, clinical exams, and viva.

Needs:

- Know what matters in a large syllabus.
- Convert textbook facts into exam-ready answers.
- Build clinical reasoning for cases.
- Revise efficiently under time pressure.
- Avoid predictable examiner traps.

### 3.2 Secondary Users

Junior medical students starting pediatrics.

Needs:

- Learn concepts progressively.
- Understand systems and mechanisms.
- Build basic pediatric vocabulary and clinical frames.

### 3.3 Future Users

- Interns needing emergency pediatric protocols.
- Residents needing rapid revision.
- Faculty interested in analytics and teaching maps.

---

## 4. Strategic Product Shift

### 4.1 From Analyzer To Learning Engine

| Current Product | Target Product |
|-----------------|----------------|
| Dashboard starts with exam stats | Home starts with today's learning plan |
| Navigation follows data source | Navigation follows learner goals |
| PYQ frequency is central | Mastery and retention are central |
| Arcade is a side mode | Arcade is a neuroscience retrieval lab |
| Structured answers are print material | Structured answers become answer-building training |
| MCQs are practice questions | MCQs become adaptive diagnosis of weaknesses |
| Visual style is generic dark analytics | Visual style is clinical, memorable, curriculum-centered |

### 4.2 What Stays

- Static export architecture.
- Current PYQ dataset and analytics.
- 250 MCQ engine.
- Five arcade modules.
- Structured-answer content.
- LocalStorage persistence for early product phase.
- Cloudflare Pages deployment.

### 4.3 What Changes

- Brand language.
- Homepage.
- Navigation.
- Visual design system.
- Information architecture.
- Topic organization.
- Progress model.
- Daily learning loop.
- Neuroscience made visible in the UI.

---

## 4.4 Locked Product Decisions

These decisions remove ambiguity for implementation.

1. **The homepage becomes Today.** Route `/` should render the Today experience in Release 1. The old dashboard moves to `/exam/overview/` or remains available inside Exam Mode.
2. **KUHS stays as an exam context, not the brand.** KUHS may appear in Exam Mode, PYQ pages, and metadata descriptions, but not as the main product tagline.
3. **Cases are Phase 2, not Release 1.** Do not expose a primary Cases nav item unless reviewed case content exists.
4. **Mastery must be confidence-aware.** If the student has too few attempts, show "Not enough data" or "Coverage started," not a percentage.
5. **No server dependency in Release 1.** All features must work under Next static export and localStorage.
6. **Old routes must keep working.** Existing URLs should render wrapper/compatibility pages during the migration.
7. **Arcade remains visually immersive.** The new light clinical shell must not flatten the dark game identities.
8. **Medical content is authored and reviewed.** No generated medical teaching content ships without explicit human review.

## 4.5 Release Strategy

### Release 1: Reframe Without Rebuild Collapse

Release 1 must prove the new product identity with the least architectural churn.

Must ship:

- New metadata and brand line.
- New navigation labels.
- Today homepage.
- Clinical-light design tokens applied to non-arcade shell.
- Retrieval Lab hub redesign with accurate counts.
- Canonical topic map v1 for existing structured topics and MCQs.
- Exam Mode wrapper around existing analytics pages.
- Local review queue v1 using existing missed items.

Must not ship:

- Full Mastery Map.
- Cases.
- Server sync.
- Full route deletion.
- Automated content generation.

### Release 2: Curriculum Depth

- Learn system atlas.
- Top 12 topic pages.
- Answer Studio.
- Notebook.
- Review scheduling.

### Release 3: Mastery Visualization

- Mastery Map.
- Confidence bands.
- Topic graph interaction.
- Cross-activity mastery summaries.

### Release 4: Clinical Reasoning

- Hand-authored cases.
- Differential diagnosis workflows.
- Case-linked review and traps.

---

## 5. New Information Architecture

### 5.1 Primary Navigation

Release 1 navigation:

```text
Today
Learn
Practice
Retrieval Lab
Exam Mode
Notebook
Progress
```

Phase 2 adds:

```text
Cases
```

### 5.2 Route Mapping

| New Route | Purpose | Existing Routes/Data Used |
|-----------|---------|---------------------------|
| `/` | Daily learning cockpit | quiz stats, arcade stats, weak topics |
| `/today/` | Optional alias for homepage | same as `/` |
| `/learn/` | Pediatric concept atlas | structured answers, topic graph metadata |
| `/learn/[topic]/` | Unified topic page | topics.ts, MCQs, PYQs, arcade links |
| `/practice/` | MCQ session builder | `/quiz/`, `/quiz/session/`, `/quiz/results/` |
| `/practice/review/` | MCQ explanation browser | `/mcq-review/` |
| `/arcade/` | Retrieval Lab | current arcade hub |
| `/cases/` | Clinical reasoning cases | Phase 2 data model |
| `/exam/` | Exam intelligence hub | questions, Nelson, subjects, insights |
| `/exam/questions/` | PYQ browser | `/questions/` |
| `/exam/patterns/` | Pattern insights | `/insights/` |
| `/exam/answers/` | Answer Studio | `/structured-answers/` |
| `/notebook/` | Saved missed items/traps/protocols | localStorage profiles |
| `/progress/` | Mastery map and retention analytics | profile + session data |

### 5.3 Navigation Principles

- First item must answer "what do I do now?"
- KUHS and PYQ labels should live under Exam Mode.
- Neuroscience should appear in activity labels, summaries, and progress feedback.
- Sidebar should support collapsed and mobile states, but the hierarchy must be clear.

### 5.4 Static Export Route Migration

Because the app uses `output: 'export'`, do not depend on server redirects for old routes. Use compatibility pages instead.

Examples:

- `/quiz/` can render or import `/practice/` until internal links are migrated.
- `/mcq-review/` can render `/practice/review/`.
- `/questions/`, `/nelson/`, `/subjects/`, `/insights/`, and `/structured-answers/` can remain as direct pages while also being linked from `/exam/`.

Only remove old routes after:

- sitemap has changed,
- internal links have changed,
- build output confirms old paths are intentionally gone,
- a manual URL audit is complete.

---

## 6. Core Product Experiences

## 6.1 Today

### Purpose

The command center for daily study. This replaces the current analytics dashboard as the first screen.

### User Jobs

- Start the next best activity.
- See weak areas.
- See due reviews.
- Resume unfinished sessions.
- Understand what the platform is doing for memory.

### Required Modules

1. **Daily Plan**
   - Suggested sequence:
     - 10 MCQs
     - 1 protocol
     - 5 trap cards
     - 1 structured answer skeleton
   - Each item shows brain target:
     - Retrieval
     - Discrimination
     - Sequencing
     - Hypercorrection

2. **Mastery Snapshot**
   - System-level mastery cards:
     - Nephrology
     - Gastroenterology
     - Endocrinology
     - Neonatology
     - Infectious Diseases
     - Emergency Pediatrics
   - Each card shows:
     - coverage or mastery state
     - due reviews
     - weak concepts
     - recommended activity

3. **Memory Queue**
   - Items due today.
   - Items overdue.
   - Recently corrected traps.
   - Decaying topics.

4. **Continue Learning**
   - Active quiz session.
   - Last arcade game.
   - Last structured answer.

5. **Exam Watch**
   - Compact historical-pattern signals.
   - Must be visually secondary.

### Acceptance Criteria

- User can start a recommended session in one click.
- No first-viewport chart-heavy dashboard.
- Page communicates "learning platform" within five seconds.

---

## 6.2 Learn

### Purpose

The structured pediatrics curriculum.

### Required Views

1. **System Atlas**
   - Grid/list of pediatric systems.
   - Each system shows:
     - topics
     - mastery
     - exam relevance
     - due reviews

2. **Topic Page**
   - Every topic should combine:
     - concept explanation
     - illness script
     - mechanism map
     - clinical red flags
     - investigations
     - management protocol
     - structured answer
     - MCQs
     - arcade drills
     - PYQ appearances
     - examiner traps

3. **Answer Studio**
   - Replaces passive structured answers.
   - Modes:
     - Read
     - Skeleton
     - Write
     - Compare
     - Print
   - The default should show answer structure before full answer.

### Topic Page Layout

```text
Topic Header
├── Mastery state
├── Brain target
├── Exam relevance
├── Review due badge

Concept Core
├── One-sentence definition
├── Mechanism diagram
├── Clinical pattern

Clinical Reasoning
├── Illness script
├── Differentials
├── Red flags

Exam Answer
├── Mark skeleton
├── Model answer
├── Examiner traps

Practice Links
├── MCQs
├── Arcade
├── Protocol
├── Trap cards
```

---

## 6.3 Practice

### Purpose

Adaptive MCQ practice and weakness diagnosis.

### Current Assets

- 250 MCQs.
- Topics: gastroenterology, nephrology, endocrinology.
- Local profile.
- Active session resume.
- Weak topic analytics.

### Required Enhancements

1. **Practice Modes**
   - Quick Retrieval
   - Weak Concepts
   - Exam Sprint
   - Confidence Calibration
   - Repeat Wrong
   - Custom

2. **Question UI**
   - Add confidence selection:
     - Sure
     - Unsure
     - Guess
   - Capture time spent.
   - Show misconception category.
   - Link to topic page.

3. **Post-Session Review**
   - Accuracy.
   - Confidence accuracy.
   - Weak concepts.
   - Memory actions:
     - Add to review
     - Launch trap cards
     - Read concept
     - Play related arcade drill

### Technical Notes

- Extend `QuizResponse` to ensure confidence is always captured.
- Add concept IDs to MCQ metadata.
- Link `relatedTopic` consistently to topic slugs.

---

## 6.4 Arcade / Retrieval Lab

### Purpose

High-intensity memory training grounded in neuroscience.

### Naming Options

Preferred:

- **Retrieval Lab**

Alternate:

- NeuroArcade
- Memory Lab
- Clinical Reflex Lab

### Current Modules

| Module | Mechanic | Brain Target |
|--------|----------|--------------|
| Dose Duel | timed dose recall | retrieval + arousal |
| Dose Sniper | falling-card discrimination | visuomotor encoding |
| Feature Wars | feature sorting | illness-script discrimination |
| Protocol Builder | step sequencing | spatial sequence memory |
| Trap Defuser | trap/correct judgment | hypercorrection |

### Hub Requirements

Each game card should show:

- title
- clinical skill
- brain target
- current high score
- last played
- due missed items
- recommended if applicable

Replace "questions" counts with accurate labels:

- Dose Duel: `56 dose prompts`
- Dose Sniper: `55 rounds`
- Feature Wars: `8 battles / 74 features`
- Protocol Builder: `10 protocols / 76 steps`
- Trap Defuser: `392 cards`

### Results Requirements

Every game result should produce:

- score
- accuracy
- best streak/combo if relevant
- concepts strengthened
- missed traps/facts
- next recommended activity

---

## 6.5 Cases

### Purpose

Clinical reasoning mode that teaches diagnosis and management through progressive disclosure.

### MVP Case Structure

```typescript
interface ClinicalCase {
  id: string;
  title: string;
  system: PediatricSystem;
  age: string;
  presentation: string;
  stages: CaseStage[];
  finalDiagnosis: string;
  differentials: Differential[];
  learningObjectives: string[];
  relatedTopics: string[];
}

interface CaseStage {
  id: string;
  prompt: string;
  data: string[];
  question: string;
  options?: string[];
  expectedReasoning: string;
  commonTrap?: string;
}
```

### Case Interaction Pattern

1. Present complaint.
2. Ask for differential.
3. Reveal exam findings.
4. Ask for investigations.
5. Reveal results.
6. Ask for diagnosis.
7. Ask for management.
8. Show illness script and traps.

---

## 6.6 Exam Mode

### Purpose

Preserve and improve the KUHS exam intelligence layer.

### Pages

- PYQ Browser
- Nelson Mapping
- Subject Trends
- Pattern Insights
- Answer Studio

### Tone Rules

- Avoid "prediction" as a promise.
- Use:
  - historical pattern
  - exam relevance
  - frequency signal
  - syllabus staple
- Do not imply certainty.

---

## 6.7 Notebook

### Purpose

The student's personal mistake and memory ledger.

### Contents

- Missed MCQs.
- Missed arcade items.
- Trap Defuser misses.
- Protocol Builder wrong placements.
- Saved structured-answer skeletons.
- Marked weak concepts.

### Required Filters

- System.
- Topic.
- Activity source.
- Due for review.
- Confidence mismatch.
- Exam relevance.

---

## 6.8 Progress

### Purpose

Show growth in pediatrics mastery.

### Required Metrics

- Overall mastery.
- System mastery.
- Concept mastery.
- Retrieval strength.
- Confidence calibration.
- Trap immunity.
- Protocol fluency.
- Arcade performance.
- Exam answer readiness.

### Mastery Honesty Rules

Mastery metrics must avoid fake precision.

Show a numeric mastery score only when:

- at least 5 attempts exist for that topic, or
- at least 2 different activity types have been completed, or
- the score is explicitly labeled as preliminary.

Otherwise show states:

- Not started
- Exposure started
- Practice needed
- Enough data soon

Every mastery display must include one of:

- confidence band,
- attempts count,
- last practiced date,
- next review due date.

### Signature Feature: Mastery Map

The Mastery Map should become the visual centerpiece of the product.

```text
Systems -> Topics -> Concepts -> Activities
```

Node attributes:

- color = mastery
- ring = exam relevance
- pulse = review due
- glow = recently strengthened
- warning = repeated misconception

---

## 7. Comprehensive Design Language

## 7.1 Design Philosophy

PedsIQ should feel like a pediatric clinical learning atlas, not a generic SaaS dashboard.

Design traits:

- Clinical but warm.
- Dense but readable.
- Scientific but human.
- Premium but not decorative.
- Playful only inside Arcade.
- Calm in learning modes.
- High-energy in retrieval modes.

### Design Keywords

- clinical atlas
- cognitive cockpit
- memory map
- pediatric clarity
- neuroscience layer
- mastery over time
- structured calm
- high-signal learning

---

## 7.2 Visual Identity

### Brand Name

Keep:

```text
PedsIQ
```

### Brand Line

Replace:

```text
KUHS PYQ Analyzer
```

With:

```text
Pediatrics Learning Engine
```

Alternate:

```text
Neuroscience-backed Pediatrics Mastery
```

### Logo Direction

Create a symbol combining:

- neural node
- pediatric pulse line
- learning map
- subtle stethoscope curve

Avoid:

- cartoon children
- hospital cross cliches
- generic brain icons
- gradient-only logo

---

## 7.3 Color System

### Core Theme

The main app should move from full black to a light clinical canvas.

```css
:root {
  --bg: #F7F8F5;
  --surface: #FFFFFF;
  --surface-muted: #EEF2EF;
  --ink: #14201E;
  --ink-soft: #4B5C58;
  --line: #DCE4DF;

  --teal: #0E9F9A;
  --teal-soft: #DDF5F2;
  --coral: #E85D4F;
  --coral-soft: #FDE8E5;
  --amber: #C98910;
  --amber-soft: #FFF2D6;
  --green: #2E9D65;
  --green-soft: #E4F6EC;
  --violet: #6D5BD0;
  --violet-soft: #EDEBFF;
  --blue: #2D6CDF;
  --blue-soft: #E5EEFF;
}
```

### Semantic Use

| Color | Meaning |
|-------|---------|
| Teal | core learning, knowledge, primary actions |
| Coral | traps, errors, danger, misconception |
| Amber | exam pattern, uncertainty, caution |
| Green | mastery, correct, consolidated |
| Violet | neuroscience, memory, brain target |
| Blue | system navigation, data, references |

### Arcade Theme

Arcade can stay dark and immersive. The contrast between the calm learning platform and dark Retrieval Lab should be intentional.

---

## 7.4 Typography

### Main App

- Primary UI: Inter or SF Pro.
- Long-form learning: Source Serif 4 or Literata for optional reading sections.
- Data/code/protocol labels: IBM Plex Mono.

### Type Scale

```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 22px;
--text-2xl: 28px;
--text-3xl: 36px;
--text-display: 48px;
```

Rules:

- No viewport-scaled text in the main app.
- Avoid oversized headings inside cards.
- Use tabular numerals for scores, marks, and mastery.
- Keep letter spacing at `0` except small uppercase labels.

---

## 7.5 Layout System

### Shell

Replace heavy left-sidebar feel with an app shell that supports:

- persistent sidebar on desktop
- bottom tab or compact drawer on mobile
- context header per section
- wide content for maps and dashboards
- focused reading width for articles

### Grid

```css
--content-max: 1280px;
--reading-max: 820px;
--panel-radius: 10px;
--control-radius: 8px;
--gap: 16px;
```

Cards should be used for:

- repeated items
- compact summaries
- modals
- tools

Avoid:

- page sections as decorative cards
- cards inside cards
- excessive glass panels

---

## 7.6 Component Language

### Core Components

1. **LearningPanel**
   - white surface
   - light border
   - compact header
   - optional action

2. **MasteryMeter**
   - segmented horizontal meter
   - color by mastery
   - shows due state

3. **BrainTargetBadge**
   - violet-tinted pill
   - labels cognitive mechanism
   - examples: Retrieval, Discrimination, Sequencing

4. **ConceptNode**
   - used in maps
   - stateful ring and mastery fill

5. **TrapCallout**
   - coral accent
   - includes misconception and correction

6. **ProtocolTimeline**
   - ordered steps
   - clear causal arrows
   - supports quiz/rebuild mode

7. **IllnessScriptCard**
   - disease pattern
   - age, onset, key features, labs, differentiators

8. **ReviewQueueItem**
   - due date
   - source
   - brain target
   - action button

9. **ExamSignalBadge**
   - amber
   - historical pattern strength
   - never styled as certainty

10. **ActivityLauncher**
   - action card for starting a session
   - shows estimated time and learning target

---

## 7.7 Motion Language

Motion should teach state change, not decorate.

Allowed:

- mastery meter fill
- node pulse for due review
- protocol step placement
- answer reveal
- arcade effects

Avoid:

- ambient blobs
- excessive gradients
- slow decorative animations

Respect `prefers-reduced-motion`.

---

## 7.8 Iconography

Use Lucide React consistently.

Suggested icon mapping:

| Concept | Icon |
|---------|------|
| Today | CalendarCheck |
| Learn | BookOpen |
| Practice | Brain |
| Arcade | Gamepad2 |
| Cases | Stethoscope |
| Exam Mode | ClipboardList |
| Notebook | NotebookTabs |
| Progress | ChartNoAxesCombined |
| Retrieval | RotateCcw |
| Trap | TriangleAlert |
| Protocol | Workflow |
| Mastery | BadgeCheck |

---

## 8. Technical Architecture

## 8.1 Current Stack

- Next.js 16 App Router.
- Static export.
- React 19.
- TypeScript.
- Tailwind CSS v4.
- Recharts.
- Lucide React.
- LocalStorage persistence.
- Cloudflare Pages.

## 8.2 Architectural Direction

Keep static-first architecture for the next phase.

Reason:

- No auth requirement yet.
- Fast deployment.
- Simple hosting.
- All current data is local/static.

Add a stronger client-side domain model:

```text
data -> domain adapters -> learning models -> UI
```

Current pages import raw JSON too directly. The overhaul should introduce typed domain layers.

### 8.2.1 Technical Guardrails

- Do not introduce a state library until cross-route state becomes painful; localStorage-backed domain services are enough for Release 1.
- Do not add a game engine for arcade redesign; keep React/CSS/rAF unless a specific mechanic cannot be implemented performantly.
- Do not add a database for Release 1.
- Do not add AI generation paths for medical content.
- Do not migrate every route in one PR. Route wrappers should preserve behavior while new IA lands.
- Do not display computed mastery values until the underlying topic mapping exists.
- Keep build verification mandatory: `npm run build`.
- Fix lint scope before using `npm run lint` as a quality gate; generated `dist/` must be ignored.

---

## 8.3 Proposed Directory Structure

```text
web/src/
├── app/
│   ├── today/
│   ├── learn/
│   │   ├── page.tsx
│   │   └── [topic]/page.tsx
│   ├── practice/
│   ├── arcade/
│   ├── cases/
│   ├── exam/
│   ├── notebook/
│   └── progress/
├── components/
│   ├── shell/
│   ├── design-system/
│   ├── learning/
│   ├── practice/
│   ├── arcade/
│   ├── exam/
│   └── visualization/
├── domain/
│   ├── topics/
│   ├── mastery/
│   ├── review/
│   ├── quiz/
│   ├── arcade/
│   └── exam/
├── data/
├── hooks/
├── lib/
└── types/
```

---

## 8.4 Domain Models

### Pediatric System

```typescript
type PediatricSystem =
  | 'neonatology'
  | 'growth-development'
  | 'nutrition'
  | 'infectious-diseases'
  | 'respiratory'
  | 'cardiology'
  | 'gastroenterology'
  | 'nephrology'
  | 'endocrinology'
  | 'neurology'
  | 'hematology'
  | 'emergency'
  | 'genetics'
  | 'immunization';
```

### Topic

```typescript
interface LearningTopic {
  id: string;
  title: string;
  shortTitle: string;
  system: PediatricSystem;
  summary: string;
  learningObjectives: string[];
  prerequisites: string[];
  relatedTopicIds: string[];
  examSignal?: ExamSignal;
  activities: TopicActivities;
}

interface TopicActivities {
  structuredAnswerIds: string[];
  mcqIds: string[];
  arcadeIds: ArcadeActivityRef[];
  caseIds: string[];
  protocolIds: string[];
  trapCardIds: string[];
}
```

### Content Governance

Every authored educational object must carry source and review metadata.

```typescript
interface ContentGovernance {
  sourceRefs: string[];
  lastReviewedAt: string;
  reviewedBy: string;
  medicalRisk: 'low' | 'moderate' | 'high';
  confidence: 'draft' | 'reviewed' | 'validated';
  unsafeIfWrong: boolean;
}
```

Rules:

- Drug dose content is always `medicalRisk: 'high'`.
- Emergency management protocols are always `medicalRisk: 'high'`.
- High-risk content must show source references in authoring/review tools.
- Public UI should avoid implying clinical decision support. This is an education product.
- Any future AI-assisted drafting must write `confidence: 'draft'` and cannot be published without human review.

### Mastery

```typescript
interface TopicMastery {
  topicId: string;
  retrievalStrength: number;      // 0-1
  reasoningStrength: number;      // 0-1
  protocolFluency: number;        // 0-1
  trapImmunity: number;           // 0-1
  confidenceCalibration: number;  // 0-1
  lastPracticedAt?: string;
  nextReviewAt?: string;
}
```

### Review Item

```typescript
type ReviewSource =
  | 'mcq'
  | 'dose-duel'
  | 'dose-sniper'
  | 'feature-wars'
  | 'protocol-builder'
  | 'trap-defuser'
  | 'case'
  | 'structured-answer';

interface ReviewItem {
  id: string;
  topicId: string;
  source: ReviewSource;
  prompt: string;
  correctAnswer: string;
  explanation: string;
  misconception?: string;
  brainTarget: BrainTarget;
  createdAt: string;
  nextReviewAt: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}
```

### Brain Target

```typescript
type BrainTarget =
  | 'retrieval'
  | 'generation'
  | 'arousal-encoding'
  | 'visuomotor'
  | 'dual-coding'
  | 'semantic-discrimination'
  | 'spatial-sequencing'
  | 'hypercorrection'
  | 'confidence-calibration'
  | 'consolidation';
```

---

## 8.5 Persistence

### Phase 1: LocalStorage

Extend current storage:

```typescript
const STORAGE_KEYS = {
  USER_PROFILE: 'pedsiq_user_v2',
  ACTIVE_SESSION: 'pedsiq_active_session_v2',
  ARCADE_PROFILE: 'pedsiq_arcade_v2',
  REVIEW_QUEUE: 'pedsiq_review_queue_v1',
  TOPIC_MASTERY: 'pedsiq_topic_mastery_v1',
  NOTEBOOK: 'pedsiq_notebook_v1',
};
```

Migration requirements:

- Read old `pedsiq_user_v1`.
- Read old `pedsiq_arcade_v1`.
- Convert study lists into `ReviewItem[]`.
- Preserve high scores.
- Preserve quiz history.

### Phase 2: Optional Sync

Future:

- Supabase or Cloudflare D1.
- Anonymous local-first account.
- Export/import progress.

Not required for MVP overhaul.

---

## 8.6 Recommendation Engine MVP

The first recommendation engine can be deterministic.

Score each topic:

```typescript
priority =
  dueReviewWeight +
  weaknessWeight +
  examSignalWeight +
  recencyDecayWeight +
  confidenceMismatchWeight
```

Inputs:

- accuracy
- confidence
- last practiced
- repeated mistakes
- exam signal
- available activity types

Output:

```typescript
interface DailyRecommendation {
  id: string;
  topicId: string;
  activityType: ReviewSource;
  title: string;
  reason: string;
  brainTarget: BrainTarget;
  estimatedMinutes: number;
  href: string;
}
```

Example reason:

> Nephrotic syndrome has high exam relevance and your last two errors were steroid-regimen traps. Start Trap Defuser.

---

## 8.7 Mastery Computation

Initial heuristic:

```typescript
retrievalStrength = weightedAccuracy(mcq + doseDuel + doseSniper)
reasoningStrength = weightedAccuracy(featureWars + cases)
protocolFluency = protocolBuilderScore
trapImmunity = trapDefuserAccuracy
confidenceCalibration = 1 - abs(confidence - correctness)
```

Decay:

```typescript
decayedStrength = strength * exp(-daysSincePractice / halfLifeDays)
```

Half-life starts low and increases with successful repetitions.

### 8.7.1 Minimum Viable Mastery Model

Release 1 should not attempt a full mastery model. It should compute:

1. **Coverage**: whether the student has touched a topic.
2. **Accuracy**: correctness for mapped MCQs and arcade items.
3. **Recency**: days since last practice.
4. **Review Due**: whether a missed item is waiting.

Only Release 3 should introduce composite mastery.

Release 1 display examples:

- "Not started"
- "3 attempts, 67% correct"
- "Review due: 2 trap cards"
- "Practiced yesterday"

Avoid in Release 1:

- "82% mastered"
- "clinically ready"
- "exam safe"

---

## 8.8 Performance Requirements

- Static export must continue to pass.
- First load JS target: under 250 KB for main shell.
- Heavy visualizations lazy-load.
- Mastery Map can be dynamically imported.
- Arcade modules remain route-split.
- No runtime server dependency for MVP.
- All data imports must be typed and validated.
- Existing route chunks should not become part of the homepage bundle unless needed by Today.
- Mastery Map and chart-heavy Exam Mode views must be lazy-loaded or route-isolated.
- LocalStorage reads should happen behind client-only hooks to avoid hydration instability.
- `next/font` network dependency must be accounted for in CI/build environments.

---

## 8.9 Accessibility Requirements

- WCAG AA contrast.
- Keyboard navigable sidebar and activity cards.
- Visible focus states.
- Reduced-motion support.
- No color-only meaning.
- Touch targets at least 44px on mobile.
- Tables must remain readable on small screens.
- Arcade must provide non-motion alternatives where possible.

---

## 9. Content Strategy

## 9.1 Topic Taxonomy

Create canonical topic IDs and map all content to them:

- structured answers
- MCQs
- PYQs
- arcade questions
- protocol steps
- trap cards
- future cases

This is mandatory before the Mastery Map can be reliable.

## 9.2 Content Types

| Type | Purpose |
|------|---------|
| Concept Core | Teach the idea |
| Illness Script | Teach clinical recognition |
| Protocol | Teach management sequence |
| Trap | Correct misconception |
| MCQ | Test retrieval and application |
| Case | Test reasoning |
| Structured Answer | Prepare written exams |
| PYQ | Show historical exam framing |

## 9.3 Content Coverage Reality

Release 1 must acknowledge content limits.

Current strong coverage:

- Nephrology, gastroenterology, and endocrinology MCQs.
- 46 structured-answer topics.
- Five arcade data sets.
- 409 PYQs and metadata.

Current weaker coverage:

- No full pediatric system taxonomy yet.
- No reviewed clinical cases yet.
- MCQ coverage is not full-syllabus.
- Topic graph metadata is useful but not sufficient as a canonical curriculum map.

Implication:

- The UI must not imply full pediatrics coverage until the topic taxonomy and content coverage exist.
- Use "Start with high-yield systems" rather than "complete pediatrics curriculum" in Release 1 marketing copy.

---

## 10. Detailed MVP Scope

### MVP Name

PedsIQ 4.0: Learning Engine

### MVP Must Include

1. New brand positioning.
2. New app shell/navigation.
3. New Today page.
4. New light clinical design system.
5. Exam analytics moved under Exam Mode.
6. Arcade hub redesigned as Retrieval Lab.
7. Topic model and content mapping foundation.
8. Basic review queue.
9. Topic coverage and attempt summary.
10. Updated metadata and copy.

### MVP Should Include

1. Topic pages for top 12 high-yield topics.
2. Answer Studio mode split.
3. First version of Mastery Map only if topic map quality is sufficient.
4. BrainTargetBadge across activities.

### MVP Could Include

1. Clinical cases.
2. SM-2 scheduling.
3. Import/export progress.
4. Print redesign.

### MVP Won't Include

1. User accounts.
2. Server sync.
3. Payments.
4. AI-generated medical content.
5. Native mobile app.

### MVP Release Gate

PedsIQ 4.0 can ship only if:

- `/` communicates the new product identity without relying on exam analytics.
- Old core routes remain reachable.
- Arcade hub counts match actual data.
- No visible UI copy says `411` unless it is clearly marked archival.
- No visible UI copy says `KUHS PYQ Analyzer`.
- Build passes.
- Source lint either passes or has a documented pre-existing exception list.
- At least the top 12 topics have canonical IDs.
- Every recommendation links to an existing activity.

---

## 11. Implementation Plan

## Phase 0: Foundation Cleanup

Tasks:

- Fix stale counts in current UI.
- Fix lint configuration so `dist/` is ignored.
- Remove KUHS-first metadata.
- Add canonical topic ID map.
- Add design tokens.

Deliverables:

- clean build
- lint on source only
- topic map v1

## Phase 1: Brand + Shell

Tasks:

- Update app metadata.
- Replace sidebar labels.
- Build new shell.
- Add light clinical theme.
- Keep arcade dark routes isolated.

Deliverables:

- new navigation
- new brand line
- responsive shell

## Phase 2: Today Page

Tasks:

- Build daily plan engine.
- Add mastery snapshot.
- Add memory queue.
- Add continue session.
- Add compact exam watch.

Deliverables:

- `/today/` or new `/`
- deterministic recommendations

## Phase 3: Learn + Topic Pages

Tasks:

- Build system atlas.
- Create topic page template.
- Map top topics.
- Integrate structured answers.
- Add activity links.

Deliverables:

- `/learn/`
- `/learn/agn/`
- `/learn/nephrotic/`
- first 12 topic pages

## Phase 4: Retrieval Lab Redesign

Tasks:

- Rename/reframe arcade.
- Update hub counts.
- Add brain-target labels.
- Add due missed items.
- Add post-game next actions.

Deliverables:

- redesigned `/arcade/`
- consistent result summaries

## Phase 5: Progress + Mastery Map

Tasks:

- Build topic mastery computation.
- Build system summary.
- Build interactive map.
- Add review due pulses.

Deliverables:

- `/progress/`
- Mastery Map v1

## Phase 6: Exam Mode Migration

Tasks:

- Move PYQ pages under `/exam/`.
- Reframe copy.
- Keep compatibility pages for old routes.
- Add Exam Mode overview.

Deliverables:

- `/exam/`
- `/exam/questions/`
- `/exam/patterns/`
- `/exam/answers/`

---

## 12. Success Metrics

### Measurement Constraint

Release 1 is local-first and does not send analytics to a server. Therefore, success metrics are learner-visible product metrics unless opt-in aggregate analytics are added later.

### Product Metrics

- Local daily recommended session starts.
- Local session completion.
- Local review queue completion.
- Local repeat-wrong reduction.
- Local topic coverage growth.
- User-observed usefulness during manual testing.

### Learning Metrics

- MCQ accuracy over time.
- Confidence calibration improvement.
- Trap repeat rate.
- Protocol first-try placement rate.
- Feature Wars discrimination accuracy.
- Review interval growth.

### UX Metrics

- Time to first useful action under 10 seconds.
- Mobile session completion.
- Navigation success.
- Print/export usage.

### Future Aggregate Metrics

Only after explicit privacy design:

- anonymous session starts,
- route engagement,
- feature adoption,
- retention cohorts,
- error rates.

---

## 13. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Product becomes too broad | Diluted implementation | Build around daily learning loop first |
| Visual overhaul breaks content density | Worse study utility | Preserve dense study layouts inside topic pages |
| Neuroscience language feels gimmicky | Loss of trust | Keep brain labels concise and evidence-backed |
| Static data model gets messy | Hard to scale topics | Canonical topic map before UI expansion |
| Arcade remains isolated | Missed product differentiation | Integrate arcade into recommendations and topic pages |
| Exam users miss old dashboard | Confusion | Keep Exam Mode and old route compatibility pages |
| Mastery metrics overstate learning | False confidence | Show attempts and confidence state; delay composite scores |
| Light redesign reduces study contrast for night use | Lower usability | Support dark reading mode after light shell lands |
| New IA hides useful existing pages | Regression | Maintain compatibility pages and sitemap audit |
| Content expansion introduces medical errors | High harm to trust | Governance metadata and human review gates |
| Build size grows from new visualizations | Slow mobile experience | Route-split maps/charts and enforce bundle checks |

---

## 14. Open Questions

1. Should the homepage route `/` become Today immediately, or should `/today/` launch first?
2. What is the canonical system taxonomy for all pediatrics content?
3. Should the visual theme be light-first globally, or should users have a dark mode toggle?
4. Should the product continue to mention KUHS in the top-level brand?
5. Should clinical cases be hand-authored or generated from structured topics?
6. What exact spaced repetition algorithm should be used after deterministic MVP?

---

## 15. Definition Of Done

The overhaul is successful when:

- A new visitor understands PedsIQ as a pediatrics learning engine, not a paper analyzer.
- The first screen recommends a useful learning action.
- Every major activity maps to a brain target.
- KUHS analytics are available but no longer dominate the product.
- Students can move from a topic to explanation, MCQ, arcade, protocol, trap review, and PYQ context.
- Progress is visible as mastery, retention, and reasoning growth.
- The interface feels distinctive, clinical, and premium.

---

## 16. Immediate Next Build Ticket Set

1. Add source-only ESLint ignore for `dist/` and document existing source lint exceptions.
2. Fix current stale arcade hub counts.
3. Fix `411` references in live UI.
4. Rename metadata title/description.
5. Replace sidebar subtitle with `Pediatrics Learning Engine`.
6. Create design tokens in `globals.css` without breaking arcade themes.
7. Build `BrainTargetBadge`, `MasteryMeter`, `LearningPanel`.
8. Add `domain/topics/topic-map.ts` for top 12 topics.
9. Create `/today/` as a new route while leaving `/` untouched.
10. After `/today/` is accepted, make `/` render Today and move current dashboard into Exam Mode.
11. Draft `/learn/` system atlas mock using current topic data.
12. Create `/exam/` hub that links to existing analytics pages.

---

## 17. Red-Team Implementation Checklist

Before any implementation PR is accepted, verify:

- Scope maps to one release phase.
- Existing routes still build.
- No unsupported Next static-export feature is introduced.
- Medical content changes include source/review metadata.
- Neuroscience copy describes learning principles, not guaranteed outcomes.
- Mastery UI includes attempt count or insufficiency state.
- Mobile layout is designed, not merely collapsed.
- Print behavior for long answers is preserved.
- Arcade pages still hide shell chrome correctly.
- `npm run build` passes.
