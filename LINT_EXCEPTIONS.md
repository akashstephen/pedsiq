# Lint Exceptions

**Created:** 2026-05-08  
**Context:** PedsIQ Learning Engine implementation branch

The first implementation sprint narrowed ESLint scope so generated static-export output (`web/dist/**`) and Next build artifacts are ignored. After that change, lint reports only source-level issues.

`npm run build` passes. `npm run lint` still reports pre-existing source issues, mostly from React 19 compiler rules in arcade/session code that predate the Learning Engine branch.

## Current Source Exceptions

These should be fixed in a dedicated cleanup PR before lint becomes a blocking CI gate:

- `web/src/app/arcade/dose-sniper/hooks/useSniperEngine.ts`
  - callback ordering / React compiler immutability warnings
  - synchronous state updates in effects
- `web/src/app/arcade/dose-sniper/page.tsx`
  - ref access during render
- `web/src/app/arcade/feature-wars/page.tsx`
  - conditional hook calls
  - synchronous state updates in effects
- `web/src/app/arcade/protocol-builder/page.tsx`
  - synchronous state updates in effects
  - unused imports/variables
- `web/src/app/arcade/trap-defuser/page.tsx`
  - timeout callback ordering
  - synchronous state updates in effects
- `web/src/components/AppShell.tsx`
  - localStorage hydration effect sets state synchronously
- `web/src/components/Sidebar.tsx`
  - route-change close effect sets state synchronously
- `web/src/hooks/useQuizSession.ts`
  - active-session hydration effect sets state synchronously
- `web/src/lib/arcade-effects.ts`
  - React compiler requires inline `useCallback` functions

## Policy

- New Learning Engine code should not add new lint errors.
- Generated output must stay ignored.
- `npm run build` remains mandatory after each implementation PR.
- Once the exceptions above are resolved or intentionally downgraded in ESLint config, `npm run lint` should become mandatory.

