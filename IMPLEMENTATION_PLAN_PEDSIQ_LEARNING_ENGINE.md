# Implementation Plan: PedsIQ Learning Engine

**Branch:** `feature/pedsiq-learning-engine`  
**Source PRD:** `PRD_PEDSIQ_LEARNING_ENGINE.md`  
**Goal:** Reframe PedsIQ from KUHS paper analyzer into a neuroscience-informed pediatrics learning engine without breaking the current static-export app.

---

## 0. Current Branch Status

This branch has started the first implementation slice:

- Phase 0 is implemented for public copy, metadata, generated-output lint ignores, accurate arcade hub counts, and stale `409` denominator cleanup.
- Phase 1 has the first clinical-light token set and reusable primitives: `LearningPanel`, `BrainTargetBadge`, `MasteryMeter`, and `ActivityLauncher`.
- Phase 2 has the first canonical topic map and topic type definitions for the top 12 pediatric topics.
- Phase 3 has a safe `/today/` route that proves the new product direction without replacing `/` yet.
- Phase 5 has the first Retrieval Lab reframing on the arcade hub and accurate JSON-derived activity counts.
- Phase 6 has a first Learn Atlas MVP with `/learn/`, static top-12 topic pages, system grouping, related-topic links, and learning activity links.
- Phase 7 has a first Review Notebook MVP with unified arcade and MCQ review adapters, filtering, and arcade item clearing.

Verification on this branch:

- `npm run build` passes.
- Targeted lint for new Today/design-system/domain files passes.
- Full `npm run lint` still fails on pre-existing React compiler and hook issues in arcade/session code; these are tracked in `LINT_EXCEPTIONS.md`.

---

## 1. Implementation Principles

1. Keep the site deployable after every phase.
2. Preserve old routes until replacement pages are live and verified.
3. Do not introduce a backend, auth, or database in this branch.
4. Do not claim true mastery before enough attempts exist.
5. Keep medical content human-authored and source-governed.
6. Keep arcade dark and immersive; make the main learning shell clinical-light.
7. Build domain models before visualizing mastery.

---

## 2. Phase Order

### Phase 0: Stabilize The Current App

Purpose: remove known blockers and stale public copy before the redesign starts.

Tasks:

- Add ESLint ignores for generated `dist/`, `.next/`, and build artifacts.
- Fix visible stale data:
  - arcade hub counts,
  - `411` references in live UI,
  - `KUHS PYQ Analyzer` sidebar subtitle,
  - metadata title/description.
- Verify all current routes still build.
- Keep `npm run build` as the required gate.

Primary files:

- `web/eslint.config.mjs`
- `web/src/app/arcade/page.tsx`
- `web/src/app/insights/page.tsx`
- `web/src/app/structured-answers/page.tsx`
- `web/src/components/Sidebar.tsx`
- `web/src/app/layout.tsx`

Acceptance criteria:

- `npm run build` passes.
- `npm run lint` no longer scans generated output.
- No visible non-archival UI says `411`.
- Sidebar brand says `Pediatrics Learning Engine`.

---

### Phase 1: Design Tokens + Clinical Shell

Purpose: establish the new visual foundation without rebuilding every page.

Tasks:

- Add clinical-light design tokens in `globals.css`.
- Add dark arcade token isolation so existing games keep their identity.
- Create foundational components:
  - `LearningPanel`
  - `BrainTargetBadge`
  - `MasteryMeter`
  - `ExamSignalBadge`
  - `ActivityLauncher`
- Update app shell surfaces to use the new tokens.
- Keep old page internals functional even if not fully redesigned.

Primary files:

- `web/src/app/globals.css`
- `web/src/components/AppShell.tsx`
- `web/src/components/Sidebar.tsx`
- `web/src/components/design-system/LearningPanel.tsx`
- `web/src/components/design-system/BrainTargetBadge.tsx`
- `web/src/components/design-system/MasteryMeter.tsx`
- `web/src/components/design-system/ExamSignalBadge.tsx`
- `web/src/components/design-system/ActivityLauncher.tsx`

Acceptance criteria:

- Main shell reads as a clinical learning app, not a black analytics dashboard.
- Arcade routes still hide shell chrome and keep dark themes.
- Components have keyboard-visible focus states.
- Mobile navigation remains usable.

---

### Phase 2: Domain Foundation

Purpose: create the data layer needed for recommendations, topic pages, and future mastery.

Tasks:

- Add canonical pediatric system taxonomy.
- Add `LearningTopic`, `BrainTarget`, `ReviewItem`, and governance types.
- Build `topic-map.ts` for the first 12 topics:
  - AGN / PSGN
  - Nephrotic Syndrome
  - Rickets
  - Congenital Hypothyroidism
  - Testicular Torsion
  - Hematuria
  - Neonatal Hypoglycemia
  - Intussusception
  - Portal Hypertension
  - HUS
  - Biliary Atresia
  - DKA
- Add adapters that map:
  - structured topics to learning topics,
  - MCQs to topics,
  - arcade data to review sources where possible.

Primary files:

- `web/src/domain/topics/types.ts`
- `web/src/domain/topics/topic-map.ts`
- `web/src/domain/topics/adapters.ts`
- `web/src/domain/review/types.ts`
- `web/src/domain/brain-targets.ts`
- `web/src/domain/exam/types.ts`

Acceptance criteria:

- Top 12 topics have canonical IDs.
- MCQs with `relatedTopic` map to canonical topic IDs.
- No mastery percentage is computed yet.
- Data adapters are unit-testable pure functions.

---

### Phase 3: Today Homepage

Purpose: make the first screen prove the new product identity.

Tasks:

- Create `/today/` first as a safe route.
- Build deterministic recommendation engine v1.
- Show:
  - daily plan,
  - continue session,
  - memory queue preview,
  - topic coverage snapshot,
  - compact exam watch.
- After review, make `/` render Today.
- Move existing dashboard into `/exam/overview/`.

Primary files:

- `web/src/app/today/page.tsx`
- `web/src/app/page.tsx`
- `web/src/app/exam/overview/page.tsx`
- `web/src/domain/recommendations/getDailyRecommendations.ts`
- `web/src/domain/review/getReviewQueue.ts`

Acceptance criteria:

- First viewport communicates PedsIQ as a learning engine.
- User can start a recommended activity in one click.
- All recommendations link to existing routes.
- Empty states are useful for new users with no localStorage history.

---

### Phase 4: Exam Mode Wrapper

Purpose: preserve the KUHS analyzer as a powerful but secondary layer.

Tasks:

- Add `/exam/` hub.
- Link existing pages from Exam Mode:
  - PYQ browser,
  - Nelson analysis,
  - subject trends,
  - pattern insights,
  - answer studio.
- Keep old routes live.
- Update sitemap after routes stabilize.

Primary files:

- `web/src/app/exam/page.tsx`
- `web/src/app/exam/overview/page.tsx`
- `web/public/sitemap.xml`
- existing analytics pages as needed

Acceptance criteria:

- Exam users can still find every current analytic page.
- Exam Mode copy says historical patterns, not predictions.
- Old URLs continue to render.

---

### Phase 5: Retrieval Lab Redesign

Purpose: make arcade feel like the central neuroscience differentiator.

Tasks:

- Reframe `/arcade/` as `Retrieval Lab`.
- Use accurate data counts.
- Add brain target to each game card.
- Add due missed-item counts from arcade study lists.
- Add next recommended activity blocks.
- Keep individual game routes intact.

Primary files:

- `web/src/app/arcade/page.tsx`
- `web/src/lib/arcade-storage.ts`
- `web/src/types/arcade.ts`
- `web/src/components/design-system/BrainTargetBadge.tsx`

Acceptance criteria:

- Each game clearly explains its clinical skill and brain target.
- Counts match actual JSON data.
- High scores and due review counts load safely on client.
- Current games still launch and complete.

---

### Phase 6: Learn Atlas MVP

Purpose: start transforming structured content into a curriculum.

Tasks:

- Add `/learn/` system atlas.
- Show systems, topic counts, and coverage states.
- Add top 12 topic detail pages or a single topic template with dynamic static params.
- Integrate:
  - concept summary,
  - structured answer link,
  - MCQ link,
  - arcade link,
  - PYQ context.

Primary files:

- `web/src/app/learn/page.tsx`
- `web/src/app/learn/[topic]/page.tsx`
- `web/src/domain/topics/topic-map.ts`
- `web/src/components/learning/TopicHeader.tsx`
- `web/src/components/learning/IllnessScriptCard.tsx`
- `web/src/components/learning/TrapCallout.tsx`

Acceptance criteria:

- Top 12 topics are navigable.
- Topic pages do not imply full syllabus coverage.
- Topic pages show activity links only when data exists.

---

### Phase 7: Review Queue + Notebook MVP

Purpose: unify missed MCQs and arcade misses into one learner-visible queue.

Tasks:

- Add `ReviewItem` storage.
- Convert existing arcade study-list items into review items.
- Add MCQ wrong answers into review queue.
- Create `/notebook/` with filters:
  - topic,
  - source,
  - due,
  - trap,
  - confidence mismatch.

Primary files:

- `web/src/domain/review/types.ts`
- `web/src/domain/review/storage.ts`
- `web/src/app/notebook/page.tsx`
- `web/src/hooks/useReviewQueue.ts`

Acceptance criteria:

- Missed items from at least MCQ and arcade appear in one place.
- New users see a clear empty state.
- Review queue does not duplicate items endlessly.

---

### Phase 8: Progress MVP

Purpose: show honest learner progress without fake mastery precision.

Tasks:

- Add `/progress/`.
- Show:
  - topics touched,
  - attempts,
  - accuracy,
  - review due,
  - recent strengthening.
- Do not show composite mastery percentages until Release 3.

Primary files:

- `web/src/app/progress/page.tsx`
- `web/src/domain/progress/getCoverageSummary.ts`
- `web/src/components/learning/CoverageState.tsx`

Acceptance criteria:

- Progress page is useful with low data.
- No topic shows numeric mastery without enough attempts.
- Page clearly explains what is and is not measured.

---

## 3. Suggested PR Breakdown

1. **PR 1: stabilization and stale copy**
   - lint ignore,
   - metadata,
   - counts,
   - sidebar subtitle.

2. **PR 2: design system foundation**
   - tokens,
   - shell,
   - foundational components.

3. **PR 3: topic domain model**
   - taxonomy,
   - topic map,
   - adapters.

4. **PR 4: Today page**
   - daily plan,
   - recommendation engine,
   - `/today/`.

5. **PR 5: homepage swap + Exam Mode**
   - `/` becomes Today,
   - old dashboard moves under Exam Mode,
   - `/exam/` hub.

6. **PR 6: Retrieval Lab hub**
   - arcade redesign,
   - counts,
   - brain targets.

7. **PR 7: Learn atlas**
   - `/learn/`,
   - top 12 topics.

8. **PR 8: Notebook and review queue**
   - unified review item storage,
   - notebook UI.

9. **PR 9: Progress MVP**
   - honest progress page,
   - coverage states.

---

## 4. Verification Plan

Run after every PR:

```bash
cd web
npm run build
```

Run after lint scope is fixed:

```bash
cd web
npm run lint
```

Manual checks:

- Desktop and mobile navigation.
- `/`, `/today/`, `/arcade/`, `/quiz/`, `/structured-answers/`.
- All arcade games launch.
- Print structured answer page still works.
- LocalStorage migration does not wipe old quiz/arcade profile.
- Old routes still render.

---

## 5. Known Dependencies

- Topic map must exist before meaningful Today recommendations.
- Review queue must exist before Notebook is useful.
- Coverage summaries must exist before Progress is useful.
- Cases should wait until content governance and at least 10 reviewed cases exist.
- Mastery Map should wait until enough topic mapping and progress data exists.

---

## 6. First Implementation Sprint

Sprint goal: make the app stop presenting as a KUHS analyzer while keeping all current functionality.

Tasks:

1. Fix ESLint scope.
2. Fix stale counts in arcade hub.
3. Fix live `411` references.
4. Update metadata.
5. Update sidebar subtitle.
6. Add initial design tokens.
7. Add `BrainTargetBadge`, `LearningPanel`, `ActivityLauncher`.
8. Create `/today/` static prototype using existing profile data.

Definition of done:

- Build passes.
- `/today/` exists.
- Current `/` remains available until the prototype is reviewed.
- No current functionality is removed.
