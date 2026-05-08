# PedsIQ Web App

This directory contains the Next.js 16 static-export application for PedsIQ.

## Routes

- `/` — analytics dashboard
- `/quiz/`, `/quiz/session/`, `/quiz/results/` — 250-question MCQ practice engine
- `/mcq-review/` — searchable MCQ explanation browser
- `/arcade/` — arcade launcher
- `/arcade/dose-duel/` — timed pediatric dosing recall
- `/arcade/dose-sniper/` — falling-card dose discrimination
- `/arcade/feature-wars/` — differential diagnosis sorting
- `/arcade/protocol-builder/` — pediatric management algorithm reconstruction
- `/arcade/trap-defuser/` — examiner trap detection
- `/questions/`, `/nelson/`, `/subjects/`, `/insights/`, `/structured-answers/` — PYQ analytics and structured answers

## Stack

- Next.js 16 App Router with `output: 'export'`
- React 19
- TypeScript
- Tailwind CSS v4
- Recharts
- Lucide React

## Data

Static JSON is imported at build time:

- `src/data/questions.json` — 409 KUHS PYQs from 24 papers
- `src/data/metadata.json` — paper metadata
- `src/data/mcqs.json` — 250 MCQs
- `src/app/structured-answers/topics.ts` — 46 structured-answer topics
- `src/app/arcade/**/data/*` — arcade decks and battles

Browser-only persistence:

- `pedsiq_user_v1` and `pedsiq_active_session_v1` for MCQ practice
- `pedsiq_arcade_v1` for arcade high scores and study lists

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
```

The static export is written to `web/dist/`.

## Deploy

```bash
npx wrangler pages deploy dist --project-name pedsiq --branch main
```

## Notes

- Do not add API routes or runtime data fetching; static export must keep working.
- Pages that use Recharts or browser storage must be client components.
- Arcade pages must be wrapped in `ArcadeShell`.
- The neuroscience rationale for arcade mechanics is documented in `../NEUROSCIENCE.md`.
