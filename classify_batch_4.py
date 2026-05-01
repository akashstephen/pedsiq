import json
import os
from collections import Counter

# Import classification logic from existing module
from classify_nelson import NELSON_CHAPTERS, classify_question

INPUT_FILE = os.path.join("/Users/akashstephen/Developer/Pediatrics Exam", "questions_batch_4.json")
OUTPUT_FILE = os.path.join("/Users/akashstephen/Developer/Pediatrics Exam", "classified_batch_4.json")

with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    questions = json.load(f)

classified = []
section_counter = Counter()

for q in questions:
    section, chapter, score, keywords = classify_question(q['question_text'])
    q_copy = q.copy()
    q_copy['nelson_section'] = section
    q_copy['nelson_chapter'] = chapter
    classified.append(q_copy)
    section_counter[section] += 1

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(classified, f, indent=2, ensure_ascii=False)

print(f"Saved {len(classified)} questions to {OUTPUT_FILE}")
print("\nSummary by Nelson Section:")
for section, count in section_counter.most_common():
    print(f"  {section}: {count} questions")

uncategorized = section_counter.get('Uncategorized', 0)
if uncategorized:
    print(f"\nWARNING: {uncategorized} questions remained Uncategorized.")
