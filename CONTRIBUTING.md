# Contributing to PedsIQ

Thank you for your interest in contributing! PedsIQ is built for medical students, and contributions that improve accuracy, add features, or enhance the study experience are welcome.

## Ways to Contribute

### 1. Data Corrections

Found a misclassified question or incorrect chapter mapping?

- Open an issue with:
  - The question text
  - Current classification
  - Suggested correct classification
  - Reference (Nelson chapter/section)

### 2. New Predictions

Have insights on upcoming exam trends?

- Add a new predicted topic to `web/src/app/structured-answers/topics.ts`
- Follow the existing `Topic` interface
- Include: question, marks breakdown, sections, checklist
- Submit a pull request

### 3. UI/UX Improvements

- Dark theme refinements
- Mobile responsiveness
- Accessibility (a11y) improvements
- Print stylesheet enhancements

### 4. Feature Requests

Ideas that would help medical students:

- Mock exam generator
- Spaced repetition integration
- Flashcard mode
- Topic comparison tool
- Exam timeline planner
- New arcade game modes
- Adaptive difficulty tuning

### 5. Bug Reports

Include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## Development Setup

### Prerequisites
- Node.js 20+
- npm 10+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/akashstephen/pedsiq.git
cd pedsiq/web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000

### Project Structure

```
web/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── arcade/       # Gamified learning modules
│   │   │   ├── page.tsx
│   │   │   ├── dose-duel/
│   │   │   ├── dose-sniper/
│   │   │   ├── feature-wars/
│   │   │   ├── protocol-builder/
│   │   │   └── trap-defuser/
│   │   ├── quiz/         # MCQ practice
│   │   ├── mcq-review/   # MCQ explanation browser
│   │   └── ...
│   ├── components/       # Reusable React components
│   ├── hooks/            # Quiz and arcade session hooks
│   ├── lib/              # Data, analytics, storage, arcade utilities
│   ├── types/            # MCQ and arcade TypeScript schemas
│   └── data/             # Static JSON data (questions, metadata)
├── public/               # Static assets (robots.txt, sitemap.xml)
└── next.config.ts        # Build configuration
```

### Code Style

- **TypeScript:** Strict mode enabled
- **Formatting:** Use consistent indentation (2 spaces)
- **Components:** Functional components with hooks
- **Styling:** Tailwind CSS utility classes
- **Icons:** Lucide React

### Adding a New Page

1. Create `src/app/new-page/page.tsx`
2. Add navigation link in `src/components/Sidebar.tsx`
3. Use `'use client'` if component uses hooks or browser APIs
4. Import data from `@/data/questions.json` if needed
5. Update `sitemap.xml` in `public/`

### Adding a Chart

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Use 'use client' directive
// Wrap in ResponsiveContainer
// Style axes with stroke="rgba(255,255,255,0.3)"
// Style tooltip with dark background
```

### Adding Arcade Questions

Each game has its own JSON data in `web/src/app/arcade/[game]/data/`:

**Dose Duel** (`data/questions.json`):
```typescript
{
  "id": "dd-001",
  "patient": { "age": "6 years", "weightKg": 20, "diagnosis": "Community-acquired pneumonia" },
  "drug": "Amoxicillin",
  "route": "oral",
  "correctAnswer": "40 mg/kg/day divided BD",
  "options": ["20 mg/kg/day OD", "40 mg/kg/day divided BD", "60 mg/kg/day divided TDS", "80 mg/kg/day divided QID"],
  "explanation": "High-dose amoxicillin (80-90 mg/kg/day) is recommended for CAP, but the standard dose is 40 mg/kg/day divided BD. This is a common examiner trap.",
  "trap": "Students often confuse standard vs high-dose amoxicillin."
}
```

**Dose Sniper** (`data/questions.json`):
```typescript
{
  "id": "ds-001",
  "context": "Neonatal sepsis",
  "label": "Ampicillin + Gentamicin",
  "drug": "Gentamicin",
  "correctAnswer": "2.5 mg/kg IV q12h",
  "wrongAnswers": ["5 mg/kg IV q12h", "2.5 mg/kg IV OD", "5 mg/kg IV OD"],
  "explanation": "Neonatal gentamicin dosing is 2.5 mg/kg IV q12h for <7 days, then q8h for >7 days.",
  "trap": "Adult dosing (5 mg/kg) is a common error in neonates."
}
```

**Feature Wars** (`data/battles.json`):
```typescript
{
  "id": "fw-b1",
  "name": "Nephritic vs Nephrotic",
  "subtitle": "High-yield renal differentials",
  "diseases": [
    { "id": "agn", "name": "AGN", "color": "#22D3EE", "glow": "rgba(34,211,238,.35)", "bg": "rgba(34,211,238,.08)" },
    { "id": "ns", "name": "Nephrotic Syndrome", "color": "#FBBF24", "glow": "rgba(251,191,36,.35)", "bg": "rgba(251,191,36,.08)" }
  ],
  "features": [
    {
      "id": "fw-f1",
      "text": "Low C3 complement",
      "sub": "Complement clue",
      "correctDiseaseIds": ["agn"],
      "explanation": "C3 is low in AGN due to immune complex consumption.",
      "trap": "Nephrotic syndrome usually has normal complement."
    }
  ]
}
```

**Protocol Builder** (`data/protocols.json`) uses protocol objects with `id`, `name`, `color`, `sub`, and ordered `steps[]` (`id`, `text`, `tag`, optional `trap`).

**Trap Defuser** (`data/cards.json`) uses cards with `topic`, `isTrap`, `q`, `truth`, `exp`, and `marks`.

All arcade content should include trap or explanation text that names the common mistake. When adding a new mechanic, document its learning-science rationale in `NEUROSCIENCE.md`.

### Adding a Structured Answer Topic

Edit `web/src/app/structured-answers/topics.ts`:

```typescript
{
  id: 'new-topic',
  shortTitle: 'New Topic',
  patternStrength: 'Moderate',
  historicalFrequency: { appearances: 3, papersAnalyzed: 24, lastAppeared: '2025' },
  confidenceNote: 'Brief note explaining why this is predicted and what uncertainty remains.',
  subject: 'Subject Name',
  examType: 'Short Note',
  question: 'Predicted exam question text...',
  marksBreakdown: 'Section → marks | Section → marks',
  sections: [
    {
      title: '1. Definition',
      text: 'Definition text...',
      list: ['Point 1', 'Point 2'],
    },
  ],
  checklist: [
    'Point 1 - <strong>1M</strong>',
    'Point 2 - <strong>1M</strong>',
  ],
  references: ['Nelson Essentials of Pediatrics, 8th ed.'],
}
```

## Data Pipeline

To update the question database:

1. Add new PDFs to project root
2. Run the modern pipeline CLI:
   ```bash
   cd pipeline
   python -m pedsiq.cli run /path/to/pdfs --output output/
   ```
3. Copy output to web from the project root:
   ```bash
   cp pipeline/output/questions.json web/src/data/questions.json
   ```
4. Rebuild and deploy

Legacy root-level scripts (`extract_questions_v3.py`, `classify_questions_v2.py`, `consolidate_data.py`) remain in the repository for reference, but new pipeline work should use `pipeline/src/pedsiq/`.

## Testing

### Manual Testing Checklist

Before submitting a PR, verify:

- [ ] All pages load without errors
- [ ] Charts render correctly
- [ ] Mobile sidebar toggles properly
- [ ] Search and filters work on Questions page
- [ ] Print button generates clean A4 output
- [ ] No console errors
- [ ] Dark theme looks correct
- [ ] Links in sidebar navigate correctly
- [ ] Arcade launcher loads and shows all five game cards + stats
- [ ] Dose Duel: timer counts down, scoring works, results screen shows study list
- [ ] Dose Sniper: cards fall smoothly at 60fps, combos multiply correctly
- [ ] Feature Wars: drag/drop (or tap-to-sort) works, scoring (+10/-5) is accurate
- [ ] Protocol Builder: step selection, slot placement, first-try scoring, and final results work
- [ ] Trap Defuser: timer, swipe/tap judgment, truth reveal, and missed-trap study list work
- [ ] Arcade study list persists across sessions (localStorage)
- [ ] Arcade full-screen mode hides sidebar and resets margins
- [ ] `NEUROSCIENCE.md` mentions any new or changed arcade learning mechanic

### Build Verification

```bash
cd web
npm run build
```

Ensure build completes with 0 errors.

## Commit Messages

Follow conventional commits:

```
feat: add new predicted topic for nephrotic syndrome
fix: correct chapter classification for rickets question
docs: update README with deployment instructions
style: improve mobile sidebar spacing
refactor: extract flowchart logic into utility function
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request with:
   - Description of changes
   - Screenshots (for UI changes)
   - Testing performed

## Code of Conduct

- Be respectful and constructive
- Focus on helping medical students
- Cite medical references when adding clinical content
- Ensure accuracy of medical information

## Questions?

Open an issue with the `question` label or reach out to the maintainers.

Thank you for contributing to PedsIQ!
