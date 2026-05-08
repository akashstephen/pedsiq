# PedsIQ Arcade Architecture

**Status:** Implemented  
**Last reviewed:** 2026-05-08

PedsIQ Arcade is a set of five client-only learning games inside the static Next.js app. Every game imports static JSON at build time, runs entirely in the browser, and persists high scores plus missed-item study lists through `pedsiq_arcade_v1` localStorage.

## Modules

| Module | Route | Current Data | Mechanic | Primary Neuroscience |
|--------|-------|--------------|----------|----------------------|
| Dose Duel | `/arcade/dose-duel/` | 56 questions | 12-second pediatric dosing MCQs | Retrieval practice, generation effect, arousal-mediated encoding |
| Dose Sniper | `/arcade/dose-sniper/` | 55 rounds | Falling-card dose discrimination | Dual coding, visuomotor integration |
| Feature Wars | `/arcade/feature-wars/` | 8 battles / 74 features | Multi-column differential diagnosis sorting | Elaborative interrogation, semantic discrimination |
| Protocol Builder | `/arcade/protocol-builder/` | 10 protocols / 76 steps | Reconstruct scrambled management algorithms | Generation effect, spatial sequencing |
| Trap Defuser | `/arcade/trap-defuser/` | 392 cards | Timed trap-vs-correct judgments | Hypercorrection, error-driven learning, confidence calibration |

The launcher lives at `/arcade/` and surfaces per-game high scores and session counts.

## File Structure

```text
web/src/
├── app/arcade/
│   ├── page.tsx
│   ├── dose-duel/
│   │   ├── page.tsx
│   │   ├── hooks/useDoseDuelEngine.ts
│   │   └── data/questions.json
│   ├── dose-sniper/
│   │   ├── page.tsx
│   │   ├── hooks/useSniperEngine.ts
│   │   └── data/questions.json
│   ├── feature-wars/
│   │   ├── page.tsx
│   │   ├── hooks/useFeatureWarsEngine.ts
│   │   └── data/battles.json
│   ├── protocol-builder/
│   │   ├── page.tsx
│   │   └── data/protocols.json
│   └── trap-defuser/
│       ├── page.tsx
│       └── data/cards.json
├── components/
│   ├── ArcadeShell.tsx
│   └── ArcadeScreen.tsx
├── hooks/useArcadeSession.ts
├── lib/
│   ├── arcade-storage.ts
│   └── arcade-effects.ts
└── types/arcade.ts
```

## Shared Contracts

```typescript
type ArcadeGameId =
  | 'dose-duel'
  | 'dose-sniper'
  | 'feature-wars'
  | 'protocol-builder'
  | 'trap-defuser';

interface ArcadeProfile {
  version: 1;
  games: Record<ArcadeGameId, GameStats>;
  createdAt: string;
  lastPlayedAt: string;
}
```

`GameStats` stores high score, session totals, accuracy bests, best streak/combo fields, and a capped missed-item `studyList`. `arcade-storage.ts` also performs migration safety by adding missing game keys when older profiles are loaded.

## Runtime Model

- All arcade pages are client components and must be wrapped in `ArcadeShell`.
- `ArcadeShell` sets `data-arcade-active`, adds a game theme class to `<body>`, locks page scroll, and shows an Escape-key quit confirmation.
- `useArcadeSession` centralizes splash/countdown/playing/results transitions for games that opt into it.
- Dose Sniper uses `requestAnimationFrame` and refs for the falling-card loop to avoid React state churn.
- Dose Duel and Feature Wars use dedicated hooks for game state and scoring.
- Protocol Builder and Trap Defuser keep game-specific state in their page components because their mechanics are more bespoke.

## Scoring

| Module | Scoring Summary |
|--------|-----------------|
| Dose Duel | Correct answer: `10 + ceil(timeLeft)`; wrong/timeout adds the question to review. |
| Dose Sniper | Correct card earns points with combo multipliers up to 4x; missed rounds go to review. |
| Feature Wars | Correct placement: +10; wrong placement: -5, floored at 0. Multi-assign features require every correct disease column. |
| Protocol Builder | First-try correct step: +15; later correct step: +5; wrong placement: -3, floored at 0. |
| Trap Defuser | Correct judgment: `10 + ceil(timeLeft * 1.5)`; wrong/timeout cards go to review. |

## Persistence

- Arcade profile key: `pedsiq_arcade_v1`
- MCQ profile key: `pedsiq_user_v1`
- Active quiz session key: `pedsiq_active_session_v1`

Arcade data is intentionally isolated from MCQ progress because time pressure, combos, and missed-trap lists are different learning signals from quiz accuracy.

## Neuroscience Design

The arcade is not ornamental gamification. Each mechanic is chosen to push a specific learning process:

- **Dose Duel:** short timers create moderate noradrenergic arousal while forcing active retrieval before recognition.
- **Dose Sniper:** moving visual cards plus click actions bind verbal dose facts to visuomotor traces.
- **Feature Wars:** sorting features into diagnoses forces illness-script comparison and semantic discrimination.
- **Protocol Builder:** reconstructing ordered algorithms makes learners generate causal sequences and encode them spatially.
- **Trap Defuser:** confidently judging traps creates prediction errors; wrong judgments trigger the hypercorrection effect.

See [NEUROSCIENCE.md](NEUROSCIENCE.md) for the full cognitive-neuroscience rationale.

## Integration Checklist

When adding or changing an arcade game:

1. Add the route under `web/src/app/arcade/[game-id]/`.
2. Wrap gameplay in `ArcadeShell`.
3. Add game data under that route’s `data/` directory.
4. Update `ArcadeGameId`, `createDefaultProfile()`, and migration safety in `arcade-storage.ts`.
5. Add the launcher card in `web/src/app/arcade/page.tsx`.
6. Add the route to `web/public/sitemap.xml`.
7. Document the learning mechanism in `NEUROSCIENCE.md`.
8. Run `npm run build` from `web/`.
