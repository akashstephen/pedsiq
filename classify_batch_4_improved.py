import json
import os
import re
from collections import Counter

INPUT_FILE = os.path.join("/Users/akashstephen/Developer/Pediatrics Exam", "questions_batch_4.json")
OUTPUT_FILE = os.path.join("/Users/akashstephen/Developer/Pediatrics Exam", "classified_batch_4.json")

# Import chapter list from existing module
from classify_nelson import NELSON_CHAPTERS

def classify_question_improved(text):
    """Classify a question into Nelson chapters with improved matching."""
    text_lower = text.lower()
    scores = []
    
    for chapter in NELSON_CHAPTERS:
        score = 0
        matched_keywords = []
        for keyword in chapter["keywords"]:
            keyword_lower = keyword.lower()
            # Use word-boundary matching for short pure-alphabetic keywords to avoid false positives
            if keyword.isalpha() and len(keyword) <= 4:
                # regex word boundary
                pattern = r'\b' + re.escape(keyword_lower) + r'\b'
                matches = re.findall(pattern, text_lower)
                count = len(matches)
            else:
                # substring matching
                count = text_lower.count(keyword_lower)
            
            if count > 0:
                score += count
                matched_keywords.append(keyword)
        
        if score > 0:
            scores.append({
                "section": chapter["section"],
                "chapter": chapter["chapter"],
                "score": score,
                "keywords": matched_keywords
            })
    
    # Sort by score descending
    scores.sort(key=lambda x: x["score"], reverse=True)
    
    if scores:
        # Return top match
        return scores[0]["section"], scores[0]["chapter"], scores[0]["score"], scores[0]["keywords"]
    else:
        return "Uncategorized", "Uncategorized", 0, []

# Load questions
with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    questions = json.load(f)

classified = []
section_counter = Counter()

for q in questions:
    section, chapter, score, keywords = classify_question_improved(q['question_text'])
    q_copy = q.copy()
    q_copy['nelson_section'] = section
    q_copy['nelson_chapter'] = chapter
    classified.append(q_copy)
    section_counter[section] += 1

# Manual overrides for cases where improved matching still falls short or context is needed
manual_overrides = {
    # Cerebral palsy (false positive from 'pals' removed by boundary, but no keyword matches CP specifically)
    0:  ("2. Growth and Development", "10. Evaluation of the Child With Special Needs"),
    # Breast feeding reflexes (no keyword matched; belongs to normal development)
    4:  ("2. Growth and Development", "7. Normal Development"),
    # Xerophthalmia
    8:  ("6. Pediatric Nutrition", "31. Vitamin and Mineral Deficiencies"),
    # Rheumatological diseases (general question)
    10: ("15. Rheumatic Diseases", "86. Rheumatic Assessment"),
    # Delayed passage of meconium -> intestinal tract (Hirschsprung)
    11: ("17. Digestive System", "129. Intestinal Tract"),
    # Perinatal Mortality Rate
    14: ("1. Profession of Pediatrics", "1. Population and Culture"),
    # Acute Flaccid Paralysis
    18: ("24. Neurology", "182. Weakness and Hypotonia"),
    # Mumps complication
    32: ("16. Infectious Diseases", "93. Infectious Disease Assessment"),
    # Perinatal period
    34: ("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    # Pneumonia vignette (truncated text)
    35: ("16. Infectious Diseases", "110. Pneumonia"),
    # Diphtheria (dirty white patches, tonsils, cervical nodes)
    36: ("16. Infectious Diseases", "103. Pharyngitis"),
    # Tetralogy of Fallot (misspelled as Tetrology; 'all' false positive removed)
    37: ("19. Cardiovascular System", "144. Cyanotic Congenital Heart Disease"),
    # TB contact
    40: ("16. Infectious Diseases", "124. Tuberculosis"),
    # Duodenal atresia
    55: ("17. Digestive System", "129. Intestinal Tract"),
    # Paracetamol dose
    69: ("8. Acutely Ill or Injured Child", "46. Sedation and Analgesia"),
    # Neurocutaneous syndrome
    72: ("24. Neurology", "186. Neurocutaneous Disorders"),
    # Laws of development
    83: ("2. Growth and Development", "7. Normal Development"),
    # Kangaroo Mother Care
    103:("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    # Preterm baby characteristics
    23: ("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    # Milestone in four domains (two-year-old)
    33: ("2. Growth and Development", "7. Normal Development"),
    # Normal term newborn characteristics
    60: ("11. Fetal and Neonatal Medicine", "58. Assessment of the Mother, Fetus, and Newborn"),
    # Measles rash and complications
    65: ("16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"),
    # Antihypertensive choice (nephrology MCQ case)
    73: ("22. Nephrology and Urology", "166. Hypertension"),
    # Measles features (MCQ)
    86: ("16. Infectious Diseases", "97. Infections Characterized by Fever and Rash"),
    # Intussusception
    102:("17. Digestive System", "129. Intestinal Tract"),
    # AFP differential and surveillance
    104:("24. Neurology", "182. Weakness and Hypotonia"),
    # Klinefelter syndrome -> Chromosomal Disorders
    91: ("9. Human Genetics and Dysmorphology", "49. Chromosomal Disorders"),
    # Dengue fever/shock -> Vector-borne infections
    95: ("16. Infectious Diseases", "122. Zoonoses and Vector Borne Infections"),
}

for idx, (section, chapter) in manual_overrides.items():
    classified[idx]['nelson_section'] = section
    classified[idx]['nelson_chapter'] = chapter

# Recalculate section counts after overrides
section_counter = Counter(q['nelson_section'] for q in classified)

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(classified, f, indent=2, ensure_ascii=False)

print(f"Saved {len(classified)} questions to {OUTPUT_FILE}")
print("\nSummary by Nelson Section:")
for section, count in section_counter.most_common():
    print(f"  {section}: {count} questions")

uncategorized = section_counter.get('Uncategorized', 0)
if uncategorized:
    print(f"\nWARNING: {uncategorized} questions remained Uncategorized.")
