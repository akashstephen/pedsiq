import re

with open('/Users/akashstephen/Developer/Pediatrics Exam/web/src/app/structured-answers/topics.ts', 'r') as f:
    content = f.read()

# Extract topics with their metadata using a simpler pattern
pattern = r"id:\s*'([^']+)',\s*shortTitle:\s*'([^']+)',\s*patternStrength:\s*'([^']+)',\s*historicalFrequency:\s*\{\s*appearances:\s*(\d+),\s*papersAnalyzed:\s*(\d+),\s*lastAppeared:\s*'([^']+)'\s*\}"

matches = re.findall(pattern, content)
print(f'Total topics found: {len(matches)}')
print()
for i, m in enumerate(matches, 1):
    id_, title, strength, apps, papers, last = m
    apps_int = int(apps)
    pct = float(apps_int)/411*100
    print(f'{i:2d}. {title:40s} | {strength:8s} | {apps_int:2d}/411 ({pct:4.1f}%) | Last: {last}')
