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
│   ├── components/       # Reusable React components
│   ├── lib/              # Utilities and TypeScript types
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

### Adding a Structured Answer Topic

Edit `web/src/app/structured-answers/topics.ts`:

```typescript
{
  id: 'new-topic',
  shortTitle: 'New Topic',
  prob: 'High',
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
}
```

## Data Pipeline

To update the question database:

1. Add new PDFs to project root
2. Run extraction scripts:
   ```bash
   python extract_questions_v3.py
   python classify_questions_v2.py
   python consolidate_data.py
   ```
3. Copy output to web:
   ```bash
   cp consolidated_questions.json web/src/data/questions.json
   ```
4. Rebuild and deploy

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
