import re

with open('/Users/akashstephen/Developer/Pediatrics Exam/web/src/app/structured-answers/topics.ts', 'r') as f:
    content = f.read()

# Extract all topics from the array - match from id: to the closing } before references
# Use a more robust approach: find all Topic objects
pattern = r"\{\s*id:\s*'([^']+)',\s*shortTitle:\s*'([^']+)',\s*patternStrength:\s*'([^']+)',\s*historicalFrequency:\s*\{\s*appearances:\s*(\d+),\s*papersAnalyzed:\s*(\d+),\s*lastAppeared:\s*'([^']*)'\s*\},\s*confidenceNote:\s*'([^']+)'"

matches = re.findall(pattern, content)
print(f'Total topics found: {len(matches)}')
print()

asked = []
never_asked = []

for i, m in enumerate(matches, 1):
    id_, title, strength, apps, papers, last, note = m
    apps_int = int(apps)
    pct = float(apps_int)/411*100
    if apps_int == 0:
        never_asked.append((i, title, strength, last, note))
    else:
        asked.append((i, title, strength, apps_int, pct, last))

print("=== TOPICS THAT HAVE APPEARED BEFORE ===")
for i, title, strength, apps, pct, last in asked:
    print(f'{i:2d}. {title:40s} | {strength:8s} | {apps:2d}/411 ({pct:4.1f}%) | Last: {last}')

print(f"\n=== TOPICS NEVER ASKED BEFORE (appearances = 0) ===")
for i, title, strength, last, note in never_asked:
    print(f'{i:2d}. {title:40s} | {strength:8s} | Note: {note[:80]}...')

print(f"\nTotal asked: {len(asked)}")
print(f"Total never asked: {len(never_asked)}")
