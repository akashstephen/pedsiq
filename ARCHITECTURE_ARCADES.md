# PedsIQ Arcade Modules — Architecture Specification

**Version:** 1.0.0  
**Date:** 2026-05-04  
**Status:** Approved for Implementation

---

## 1. Executive Summary

PedsIQ Arcade integrates three gamified learning modules into the existing Next.js 16 static-export web app:

| Module | Mechanic | Cognitive Target | Domain |
|--------|----------|------------------|--------|
| **Dose Duel** | Timed MCQ (12s/q) | Generation effect + arousal | Pediatric dosing |
| **Dose Sniper** | Falling-card discrimination | Motor + visual encoding | Dosing thresholds |
| **Feature Wars** | Multi-column sorting | Elaborative interrogation | Differential diagnosis |

**Principle:** Each module is a **self-contained vertical** with its own data, engine, theme, and persistence. They plug into the app shell but do not leak into the core MCQ quiz system.

---

## 2. Requirements

### Functional
- Central `/arcade/` launcher hub
- Per-game splash → gameplay → results flow
- Shuffled questions per session
- Score, accuracy, streak/combo stats + missed list
- Separate `ArcadeProfile` localStorage (isolated from MCQ `UserProfile`)
- Offline playable, build-time JSON data

### Non-Functional
- First paint < 200ms, input latency < 50ms
- Sniper at stable 60fps (rAF + ref-based DOM)
- Bundle per game < 50 KB gzipped
- 320px–1920px responsive
- WCAG AA contrast

### Constraints
- Static export only — no API routes, no server components
- No new runtime deps — pure React + CSS + rAF
- Preserve existing quiz system

---

## 3. Architecture

```
PedsIQ Next.js App
├── AppShell (Sidebar + Main)
│   ├── /quiz/           → Existing MCQ Hub
│   ├── /arcade/         → NEW: Arcade Launcher
│   │   ├── /dose-duel/
│   │   ├── /dose-sniper/
│   │   └── /feature-wars/
│   └── ...
├── SHARED
│   ├── types/arcade.ts
│   ├── lib/arcade-storage.ts
│   └── components/ArcadeShell.tsx
└── GAME VERTICALS (page + components + hooks + types + data/)
```

---

## 4. Data Schema

### Core Types

```typescript
type ArcadeGameId = 'dose-duel' | 'dose-sniper' | 'feature-wars';

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

### Game-Specific
- **DoseDuelQuestion:** patient (age, weight, dx), drug, route, correctAnswer, options[], explanation, trap
- **SniperQuestion:** context, label, drug, correctAnswer, wrongAnswers[], explanation, trap
- **FeatureWarsBattle:** diseases[], features[] (each with correctDiseaseIds, explanation, trap)

---

## 5. State Management

Each game = one self-contained React hook (no Redux/Zustand).

| Game | Engine Hook | Loop Strategy |
|------|-------------|---------------|
| Dose Duel | `useDoseDuelEngine` | `setInterval` timer (100ms) |
| Dose Sniper | `useSniperEngine` | `requestAnimationFrame` + refs |
| Feature Wars | `useFeatureWarsEngine` | Event-driven (tap → state) |

**Persistence:** `lib/arcade-storage.ts` — separate from `lib/storage.ts`.

---

## 6. Visual Design

Each game has **distinct arcade theme** (approved). Themes use CSS custom properties scoped to the game container.

| Game | Fonts | Accent Colors |
|------|-------|---------------|
| Dose Duel | Space Mono, DM Sans | Cyan `#22D3EE`, Violet `#818CF8` |
| Dose Sniper | Orbitron, IBM Plex Mono | Cyan `#22CCFF`, Pink `#FF6BF5`, Green `#00FF94` |
| Feature Wars | Syne, IBM Plex Mono | Amber `#FBBF24`, Pink `#F472B6`, Cyan `#22D3EE` |

**Full-screen mode:** `ArcadeShell` adds `data-arcade-active` to `<body>` → CSS hides sidebar, resets margins.

---

## 7. Game Specs

### Dose Duel
- 26 questions, 12s each
- Score: 10 + remaining seconds
- Screens: Splash → Game (HUD + Timer + Patient Card + Options + Feedback) → Results

### Dose Sniper
- 25 rounds, 3 cards/round (1 correct + 2 wrong)
- Base speed 72 px/s, max 280 px/s, +9 per hit
- Combo multipliers: `[1, 1, 1.5, 2, 2.5, 3, 4]`
- Screens: Splash → Countdown → Game (HUD + Velocity Bar + Fall Zone) → Results

### Feature Wars
- 3 battles (12 + 10 + 8 features)
- Correct: +10 pts, Wrong: -5 pts
- Multi-assign features require all correct columns
- Screens: Splash → Battle → Battle Complete → Final Results

---

## 8. Integration

- **Sidebar:** Add `Arcade` nav item with `Gamepad2` icon → `/arcade/`
- **Sitemap:** Add `/arcade/`, `/arcade/dose-duel/`, `/arcade/dose-sniper/`, `/arcade/feature-wars/`
- **Analytics isolation:** `pedsiq_arcade_v1` localStorage key, separate from `pedsiq_user_v1`

---

## 9. Implementation Phases

1. **Foundation:** types, storage, shell, JSON data
2. **Dose Duel:** engine + screens
3. **Dose Sniper:** rAF engine + effects
4. **Feature Wars:** sorting engine + battles
5. **Integration:** sidebar, sitemap, polish

---

## 10. ADRs

### ADR-001: Separate Arcade Profile
Create `ArcadeProfile` in its own localStorage key. Arcade metrics (time pressure, combos) differ fundamentally from MCQ accuracy tracking. Future auth module can sync both.

### ADR-002: Pure React Over Game Engine
Phaser/Pixi add ~100 KB+ and are unnecessary for UI-based games. React + CSS + rAF is sufficient and keeps the bundle minimal.

### ADR-003: Build-Time JSON Import
Static export constraint. Question data is small (~15 KB total). Import JSON directly; no runtime fetching.

---

## 11. File Structure

```
web/src/
├── app/arcade/
│   ├── page.tsx
│   ├── dose-duel/page.tsx + components/ + hooks/ + types.ts + data/questions.json
│   ├── dose-sniper/page.tsx + components/ + hooks/ + types.ts + data/questions.json
│   └── feature-wars/page.tsx + components/ + hooks/ + types.ts + data/battles.json
├── components/ArcadeShell.tsx
├── types/arcade.ts
└── lib/arcade-storage.ts
```

---

*End of Document*
