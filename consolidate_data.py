import json
import os

# Read all classified batches
all_questions = []
for i in range(1, 5):
    path = f"classified_batch_{i}.json"
    with open(path, "r", encoding="utf-8") as f:
        batch = json.load(f)
        all_questions.extend(batch)

# Read metadata
with open("questions_raw.json", "r", encoding="utf-8") as f:
    raw = json.load(f)
    metadata = raw.get("metadata", [])

# Write consolidated questions as JSON
with open("web/src/data/questions.json", "w", encoding="utf-8") as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)

# Write metadata as JSON
with open("web/src/data/metadata.json", "w", encoding="utf-8") as f:
    json.dump(metadata, f, ensure_ascii=False, indent=2)

print(f"Consolidated {len(all_questions)} questions")
print(f"Metadata for {len(metadata)} exams")
